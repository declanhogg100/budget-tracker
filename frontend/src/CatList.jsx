import { useState } from "react";
import "./CatList.css";

function CatList({ categories = [], activeId, onSelect, setDataNeedGrab }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sortedCategories = [...categories].sort(
    (a, b) => Number(b.total ?? 0) - Number(a.total ?? 0)
  );

  const reset = () => {
    setName("");
    setError("");
    setAdding(false);
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name required");
      return;
    }
    const tok = localStorage.getItem("token");
    if (!tok) {
      setError("Please log in");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });
      let out;
      try {
        out = await res.json();
      } catch {
        out = null;
      }
      if (!res.ok || !(out?.success)) {
        const serverMsg =
          out?.error ||
          (res.status === 404
            ? "Backend missing /category route (restart server?)"
            : res.statusText);
        setError(serverMsg || "Could not create category");
        setLoading(false);
        return;
      }
      reset();
      setDataNeedGrab && setDataNeedGrab((p) => !p);
    } catch (err) {
      console.error(err);
      setError("Could not create category");
      setLoading(false);
    }
  };

  return (
    <div className={`catList ${sortedCategories.length === 0 ? "empty" : ""}`}>
      <div className="catListHeader">
        <div className="catListTitle">Categories</div>
        <button
          className="addCatBtn"
          onClick={() => {
            setError("");
            setAdding((prev) => !prev);
          }}
        >
          {adding ? "Cancel" : "New"}
        </button>
      </div>

      {adding && (
        <form className="newCatForm" onSubmit={submit}>
          <input
            className="newCatInput"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Utilities"
            disabled={loading}
          />
          <button type="submit" className="newCatSubmit" disabled={loading}>
            {loading ? "Saving..." : "Create"}
          </button>
          {error && <div className="newCatError">{error}</div>}
        </form>
      )}

      {sortedCategories.length === 0 ? (
        <p>No categories yet</p>
      ) : (
        sortedCategories.map((cat) => {
          const catKey = cat.categoryKey ?? cat.id ?? cat.category;
          const keyString = catKey != null ? String(catKey) : "";
          return (
            <button
              key={keyString}
              className={`catListItem ${activeId === keyString ? "active" : ""}`}
              onClick={() => onSelect(keyString)}
            >
              <div className="catListLeft">
                <div
                  className="catColor"
                  style={{ "--cat-color": cat.color || "#ccc" }}
                />
                <span className="catName">{cat.category}</span>
              </div>
              <span className="catTotal">${Number(cat.total).toFixed(2)}</span>
            </button>
          );
        })
      )}
    </div>
  );
}

export default CatList;
