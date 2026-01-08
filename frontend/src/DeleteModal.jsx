import "./DeleteModal.css";


function DeleteModal({ setModal, changeVal, dataChange }) {

  const onConfirm = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5001/clear",{
          method: "POST",
          headers: {
              Authorization: `Bearer ${token}`
          }
    });
    const data = await res.json();
    if(data.success){
      dataChange(!changeVal);
      setModal(false);
    } 
  }


  return (
    <div className="deleteOverlay" onClick={() => setModal(false)}>
      <div className="deleteModal" onClick={(e) => e.stopPropagation()}>
        <h2>Are you sure you want to clear spending?</h2>
        <button className="confirmClear" onClick={onConfirm}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default DeleteModal;
