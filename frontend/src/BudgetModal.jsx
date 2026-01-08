import {useState, useRef,useEffect} from 'react'
import "./BudgetModal.css"

function BudgetModal({setModal, setBudget}){
    const inputRef = useRef(null);
    const [inputNum, setNum] = useState("");

    useEffect(() => {
        if(inputRef.current){
            inputRef.current.focus();
        }
    },[])

    const budgetHelper = async (newBudget) =>{
        const tok = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/budget", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                Authorization: `Bearer ${tok}`
            },
            body: JSON.stringify({budget:newBudget})
        });
        const data = await res.json();
        if(data.budget) setBudget(data.budget);
    }
    return(
        <div className = "budgetOverlay" onClick = {() => setModal(false)}>
            <div className = "budgetModal" onClick={(e) => e.stopPropagation()}>
                <h2 className = "topText">Input Budget</h2>
                <input ref = {inputRef}className = "inputText" type = "number" value = {inputNum} onChange = {(e) => {setNum(e.target.value)}}/>
                <button className = "inputButton" type = "button" onClick = {() => {
                    if(inputNum==="" || inputNum === "0"){
                        setModal(false);
                    }
                    else{
                        budgetHelper(parseInt(inputNum,10));
                        setModal(false);
                    }
                }}>Set</button>
            </div>
        </div>
    );
}

export default BudgetModal;
