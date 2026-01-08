import { useState, useEffect } from 'react';
import BudgetTracker from "./BudgetTracker.jsx";
import Categories from "./Categories.jsx";
import Directories from "./Directories.jsx";
import LoginModal from "./LoginModal.jsx";
import LoginIcon from "./assets/LoginIcon.svg";
import "./App.css"

function App(){
    const [pagePicker, setPage] = useState("Budget");
    const [budget, setBudget] = useState(1);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [moneySpent, setMoneySpent] = useState(0);
    const [loginModal, setLoginModal] = useState(false);
    const [loginAlert, setLoginAlert] = useState("");
    const [dataNeedGrab, setDataNeedGrab] = useState(false);

    useEffect(() => {
        if (!loginAlert) return;
        const timer = setTimeout(() => setLoginAlert(""), 1500);
        return () => clearTimeout(timer);
    }, [loginAlert]);

    useEffect(() => {
        const tok = localStorage.getItem("token");
        if(tok){
            verifyToken(tok);
        } else {
            setLoginModal(true);
        }
    }, []);

    useEffect(() => {
        const dateCompare = async () => {
            const tok = localStorage.getItem("token");
            if(!tok) return;
            const res = await fetch("http://localhost:5001/date", {
                headers: {
                    Authorization: `Bearer ${tok}`
                }
            });
            const data = await res.json();
            if(!data.date) return;
            const oldMonth = data.date.split("/")[1];
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
            if (oldMonth !== currentMonth){
                const response = await fetch("http://localhost:5001/clear",{
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tok}`
                    }
                });
                const cleared = await response.json();
                if(cleared.success){
                    setDataNeedGrab(prev => !prev);
                }
            }
        };
        dateCompare();
    }, []);

    useEffect(()=>{
        const fetchTotals = async () => {
            const tok = localStorage.getItem("token");
            if(!tok) return;
            const res = await fetch("http://localhost:5001/totals", {
                headers: {
                    Authorization: `Bearer ${tok}`
                }
            });
            const data = await res.json();
            const catTotals = (data.catTotals || []).map(cat => {
                const rawKey = cat.id ?? "";
                const keyString = rawKey !== null && rawKey !== undefined ? String(rawKey) : "";
                return {
                    ...cat,
                    categoryKey: keyString,
                    total: Number(cat.total ?? 0)
                };
            });
            const txs = (data.transactions || []).map(tx => {
                const rawCat = tx.category_id ?? "";
                return {
                    ...tx,
                    amount: Number(tx.amount ?? 0),
                    categoryKey:
                        rawCat !== null && rawCat !== undefined && rawCat !== ""
                            ? String(rawCat)
                            : (tx.category || "").toLowerCase()
                };
            });
            setCategories(catTotals);
            setTransactions(txs);
            setBudget(data.budget);
            const spent = catTotals.reduce((sum, cat) => sum + cat.total, 0);
            setMoneySpent(spent.toFixed(2));
        };
        fetchTotals();
    },[dataNeedGrab]);

    const verifyToken = async (token) =>{
        try{
            const res = await fetch("http://localhost:5001/verify",{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if(data.valid){
                setLoginModal(false);
            }
            else{
                localStorage.removeItem("token");
                setLoginModal(true);
            }
        }catch{
            setLoginModal(true);
        }
    };

    const handleLogin = async (username,password,signup) => {
        const version = signup ? "signup" : "login";
        const response = await fetch (`http://localhost:5001/${version}`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({username, password})
        });
        const outcome = await response.json();
        if(outcome.message) {setLoginAlert(outcome.message);}
        else if(outcome.token){
            localStorage.setItem("token", outcome.token);
            setLoginModal(false);
            setDataNeedGrab(prev => !prev);
        }else{
            setLoginAlert(outcome.error);
        }
    };

    const triggerRefresh = () => setDataNeedGrab(prev => !prev);

    return(
        <>
            <Directories pagePicker = {pagePicker} setPage = {setPage}/>
            {pagePicker==="Budget" ? (
                <BudgetTracker
                    budget={budget}
                    setBudget={setBudget}
                    categories={categories}
                    transactions={transactions}
                    moneySpent={moneySpent}
                    dataNeedGrab={dataNeedGrab}
                    setDataNeedGrab={setDataNeedGrab}
                />
            ) : (
                <Categories 
                    categories={categories}
                    transactions={transactions}
                    dataNeedGrab={dataNeedGrab}
                    setDataNeedGrab={setDataNeedGrab}/>
            )}
            <div className = "loginIconDiv" onClick = {() =>{
                setCategories([]);
                setMoneySpent(0);
                setLoginModal(true);}}>
                <img src={LoginIcon} alt = "Login Icon" className = "loginIcon"/>
            </div>
            {loginModal && <LoginModal setModal = {setLoginModal} onLogin = {handleLogin}/>}
            {loginAlert && <div className = "loginAlerter">{loginAlert}</div>}
        </>
    );
}

export default App;
