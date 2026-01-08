import { useState,useEffect } from "react";
import "./csvModal.css";

function CsvModal({ setModal, dataChange, setDataChange }) {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(()=>{
    const getDate = async () => {
      const tok = localStorage.getItem("token");
      if(!tok) return;
      const res = await fetch("http://localhost:5001/date", {
        headers: {
              Authorization: `Bearer ${tok}`
        }
      })
      const data = await res.json();
      setDate(data.date);
    }
    getDate();
  },[date])

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a CSV file first.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    const tok = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tok}`
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadMessage("File uploaded successfully!");
        setDate(data.date);
        setDataChange(!dataChange);
      } else {
        setUploadMessage(data.message);
      }
    } catch (err) {
      setUploadMessage("Error uploading file.3");
      console.error(err);
    }
  };

  return (
    <div className="uploadOverlay" onClick={() => setModal(false)}>
      <div className="uploadModal" onClick={(e) => e.stopPropagation()}>
        <h1 className = "modalTitle">Upload CSV File</h1>
        <h4 className = "duplicateMessage">{date ? `Last upload: ${date}` : "No previous uploads"}</h4>
        <label htmlFor="csvUpload" className="customFileUpload">Choose CSV File</label>
        <input
        id="csvUpload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        hidden
        />
        <p className="fileName">{file ? file.name : "No file chosen"}</p>
        <button onClick={handleUpload} className="uploadButton">
          Upload
        </button>
        {uploadMessage && <p className="uploadMessage">{uploadMessage}</p>}
      </div>
    </div>
  );
}

export default CsvModal;