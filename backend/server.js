import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import {Readable} from "stream";
import csv from "csv-parser";
import {COLORS, CATEGORY_RULES} from "./Mappings.js";


const HEADER_MAP = {
  date: ["date", "transaction date", "posting date", "posted date", "post date", "effective date"],
  description: ["description", "narration", "details", "payee", "memo", "merchant", "reference"],
  amount: ["amount", "debit", "credit", "transaction amount", "value"]
}

dotenv.config()
const app = express();
const port = 5001;

const upload = multer({storage: multer.memoryStorage()});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new pg.Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT
});

function autoCategorize(description) {
  const desc = (description || "").toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(word => desc.includes(word))) {
      return category;
    }
  }
  return "Uncategorized";
}

function parseAmount(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (Number.isNaN(value) || value >= 0) return null;
    return value;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const hasParentheses = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw.replace(/[\$,]/g, "");
  const hasMinusSign = cleaned.trim().startsWith("-");
  const normalized = cleaned.replace(/[()]/g, "");

  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  if (!hasParentheses && !hasMinusSign) return null;
  return Math.abs(parsed);
}

function verifyToken(req, res, next){
  const authTotal = req.headers.authorization;
    if(!authTotal) return res.status(401).json({valid: false})

    const token = authTotal.split(" ")[1];
    try{
      const verified = jwt.verify(token, process.env.JWTSECRET);
      req.userId = verified.id
      next();
    }catch{
      res.status(401).json({valid:false});
    }
}

async function getTotals(userId){
  const results = {};
  const categoryTotals = await pool.query(
          "SELECT id, name AS category, total, color FROM categories WHERE user_id = $1",[userId]
  );
  const transactions = await pool.query(
          "SELECT * FROM transactions WHERE user_id = $1", [userId]
  );
  results.categories = categoryTotals.rows;
  results.transactions = transactions.rows;
  return results;
}

async function getColor(userId){
  const usedColors = await pool.query(
    "SELECT color FROM categories WHERE user_id=$1",
    [userId]
  );
  const usedSet = new Set(usedColors.rows.map(c => c.color));

  const availableColors = COLORS.filter(c => !usedSet.has(c));
  const chosenColor =
    availableColors.length > 0
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : COLORS[Math.floor(Math.random() * COLORS.length)];
  return chosenColor;
}
app.get("/", (req, res) => {
  res.send("working!");
});

app.post("/signup", async (req,res) => {
    const {username, password} = req.body;
    const exists = await pool.query("select * from users where username=$1", [username]);
    if (exists.rows.length>0) return res.status(400).json({error: "Account exists"});

    const hashed = await bcrypt.hash(password,10);
    await pool.query("insert into users (username, password) values ($1,$2)", [username,hashed]);
    return res.status(201).json({message: "User created"});
});

app.post("/login", async (req,res) => {
    const {username, password} = req.body;
    const accounts = await pool.query("select * from users where username=$1", [username]);
    const person = accounts.rows[0];

    if(!person) return res.status(400).json ({error: "Account doesn't exist"});
    const validPassword = await bcrypt.compare(password, person.password);
    if(!validPassword) return res.status(400).json({error: "Incorrect Password"});
    const token = jwt.sign({id: person.id}, process.env.JWTSECRET, {expiresIn: "7d"});
    return res.json({token});
});

app.get("/verify", verifyToken, async (req,res) => {
  res.json({valid: true})
});

app.post("/upload", verifyToken, upload.single("file"), async(req, res) => {
  try{
    if(!req.file){
      return res.status(400).json({success: false, message: "no file"})
    }

    const stream = Readable.from(req.file.buffer);
    const results = [];

    stream
      .pipe(csv())
      .on("data", (row) => {
        const normalized = {};
        for(const key in row){
          const lowerKey = key.toLowerCase().trim();
          if(HEADER_MAP.date.some(h => h===lowerKey)){
            normalized.date = row[key];
          }else if(HEADER_MAP.description.some(h => h===lowerKey)){
            normalized.description = row[key];
          }else if(HEADER_MAP.amount.some(h => h===lowerKey)){
            normalized.amount = parseAmount(row[key]);
          }
        }
        if (normalized.description && normalized.amount !== null) {
          results.push(normalized);
        }

      })
      .on("end", async ()=> {
        try {
          const userId = req.userId;
          
          for (const tx of results) {
            const categoryName = autoCategorize(tx.description);
            tx.category = categoryName;
            let category = await pool.query(
              "SELECT id FROM categories WHERE user_id=$1 AND name=$2",
              [userId, categoryName]
            );

            let categoryId;
            if (category.rows.length === 0) {
              const color = await getColor(userId);
              const newCategory = await pool.query(
                "INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3) RETURNING id",
                [userId, categoryName, color]
              );
              categoryId = newCategory.rows[0].id;
            } else {
              categoryId = category.rows[0].id;
            }

            await pool.query(
              `INSERT INTO transactions (user_id, category_id, date, description, amount)
               VALUES ($1, $2, $3, $4, $5)`,
              [userId, categoryId, tx.date, tx.description, tx.amount]
            );
            await pool.query(
              "UPDATE categories SET total = total + $1 WHERE id = $2", [tx.amount, categoryId]
            );
          }
          const categoryTotals = await pool.query(
            "SELECT id, name AS category, total, color FROM categories WHERE user_id = $1",[userId]
          );
          const now = new Date().toISOString().slice(0,10);
          await pool.query("UPDATE users SET date = $1 WHERE id = $2",[now, userId]);
          const date = now.replace(/-/g,"/")
          res.json({
            success: true,
            message: "Transactions uploaded successfully",
            data: results,
            catTotals: categoryTotals.rows,
            count: results.length,
            date: date,
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ success: false, message: "Database insert failed" });
        }
      })
      .on("error", (error) => {
        console.error("CSV stream failed", error);
        res.status(500).json({success:false, message: "upload failed"});
      })
  }catch(err){
    console.error("Upload handler failed", err);
    res.status(500).json({success:false, message: "upload failed 2"});
  }
});

app.get("/totals", verifyToken, async (req,res) => {
  const bothTotals = await getTotals(req.userId);
  const result = await pool.query("SELECT budget FROM users WHERE id = $1", [req.userId]);
  res.json({
    catTotals: bothTotals.categories,
    transactions: bothTotals.transactions,
    budget: result.rows[0].budget
  })
});

app.post("/budget", verifyToken, async(req,res) => {
  const newBudg = req.body.budget;
  await pool.query("UPDATE users SET budget = $1 WHERE id = $2", [newBudg, req.userId]);
  res.json({budget:newBudg});
  
})

app.get("/date", verifyToken, async(req,res)=>{
  const results = await pool.query("SELECT date FROM users WHERE id = $1",[req.userId]);
  const row = results.rows[0];
  let formatted = "";
  if (row?.date) {
    const asString = typeof row.date === "string"
      ? row.date
      : new Date(row.date).toISOString().slice(0,10);
    formatted = asString.replace(/-/g,"/");
  }
  return res.json({date: formatted});
})

app.post("/clear", verifyToken, async(req,res) => {
  await pool.query("DELETE FROM transactions WHERE user_id = $1", [req.userId]);
  await pool.query("DELETE FROM categories WHERE user_id = $1", [req.userId]);
  await pool.query("UPDATE users SET date = $1 WHERE id = $2",[null,req.userId]);

  return res.json({success:true});
})

app.post("/move", verifyToken, async(req,res) =>{
  const {oldCatKey, newCatKey, transId, transTotal} = req.body;
  try{
    await pool.query(
      "UPDATE transactions SET category_id = $1 WHERE id = $2 AND user_id = $3",
      [newCatKey, transId, req.userId]
    );
    await pool.query(
      "UPDATE categories SET total = total - $1 WHERE id = $2 AND user_id = $3",
      [transTotal, oldCatKey, req.userId]
    );
    await pool.query(
      "UPDATE categories SET total = total + $1 WHERE id = $2 AND user_id = $3",
      [transTotal, newCatKey, req.userId]
    );
    res.json({success:true});
  }catch(err){
    console.error("Move failed", err);
    res.status(500).json({success:false, message:"move failed"});
  }
})

app.listen(port, () => console.log(`running on port ${port}`))
