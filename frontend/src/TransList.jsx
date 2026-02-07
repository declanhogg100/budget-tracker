import { useState } from "react";
import "./TransList.css";
import MovePicker from "./MovePicker.jsx";

function TransList({ category, transactions = [], categories = [], dataNeedGrab, setDataNeedGrab }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openMoveModal = (tx) => {
    setSelectedTx(tx);
    setModalOpen(true);
  };

  const handleMove = async (targetCatKey) => {
    const tok = localStorage.getItem("token");
    if(!tok) return;
    const oldCatKey = category?.id;
    const newCatKey = targetCatKey;
    const transId = selectedTx.id;
    const transTotal = selectedTx.amount;
    await fetch("http://localhost:5001/move", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        Authorization: `Bearer ${tok}`
      },
      body: JSON.stringify({oldCatKey, newCatKey, transId, transTotal})
    });
    setDataNeedGrab(prev => !prev);
    setModalOpen(false);
    setSelectedTx(null);
  };

  const deleteCategory = async () => {
    if (!category) return;
    const confirmed = window.confirm(
      `Delete category "${category.category}" and move its transactions to Uncategorized?`
    );
    if (!confirmed) return;
    const tok = localStorage.getItem("token");
    if(!tok) return;
    try{
      setDeleting(true);
      const res = await fetch("http://localhost:5001/category/delete", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
          Authorization: `Bearer ${tok}`
        },
        body: JSON.stringify({categoryId: category.id})
      });
      const outcome = await res.json();
      if(!res.ok || !outcome.success){
        alert(outcome.error || "Could not delete category");
        setDeleting(false);
        return;
      }
      setModalOpen(false);
      setSelectedTx(null);
      setDataNeedGrab(prev => !prev);
    }catch(err){
      console.error(err);
      alert("Could not delete category");
    }finally{
      setDeleting(false);
    }
  };

  return (
    <div className="transListWrapper">
      <div className="transListHeader">
        <h2>{category ? category.category : "No category selected"}</h2>
        <div className="transListHeaderRight">
          {category && (
            <>
              <span>Total ${Number(category.total).toFixed(2)}</span>
              <button
                className="deleteCatBtn"
                onClick={deleteCategory}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="transList">
        {transactions.length === 0 ? (
          <p className="transEmpty">No transactions recorded.</p>
        ) : (
          transactions.map((tx, idx) => (
            <div className="transRow" key={tx.id ?? idx}>
              <div className="transMeta">
                <p className="transDesc">{tx.description}</p>
                <span className="transDate">
                  {new Date(tx.date).toLocaleDateString()}
                </span>
              </div>
              <div className="transActions">
                <span className="transAmount">
                  ${Math.abs(Number(tx.amount)).toFixed(2)}
                </span>
                <button className="moveButton" onClick={() => openMoveModal(tx)}>
                  Move
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <MovePicker
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        initialCategoryKey={category?.id ?? null}
        onConfirm={handleMove}
      />
    </div>
  );
}

export default TransList;
