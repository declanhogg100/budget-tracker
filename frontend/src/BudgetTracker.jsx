import { useState } from 'react'
import './BudgetTracker.css'
import TotalSpent from "./TotalSpent.jsx"
import SideCats from "./SideBudget.jsx"
import BudgetModal from "./BudgetModal.jsx"
import CsvModal from "./csvModal.jsx"
import DeleteModal from "./DeleteModal.jsx"

function BudgetTracker({
    budget,
    setBudget,
    categories,
    moneySpent,
    dataNeedGrab,
    setDataNeedGrab
}){
    const [budgetModal, setModal] = useState(false);
    const [CSVModal, setCSVModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [currMonth, setCurrMonth] = useState(new Date().toLocaleString('en-US', { month: 'long' }))

    const ratio = Number(budget) > 0 ? Number(moneySpent)/Number(budget) : 0;
return(
<div className = "appDiv">
    <div className = "budgDisplay">
        <h1>{currMonth}</h1>
        <div className = "divider2"/>
        <h2 className = "topHeader" style = {{"--budgetColor": moneySpent>=budget ? "rgba(212, 34, 34, 1)" : "black"}}>${moneySpent}/${budget}</h2>
    </div>
    <SideCats data = {categories} spent = {moneySpent}/>
    <TotalSpent budget = {budget} totalSpent = {ratio} data = {categories}/>
    <div className = "budgetOutline"></div>
    <button className = "budgetSetter" onClick = {() => setModal(true)}>Set Budget</button>
    <button className = "csvSetter" onClick = {() => setCSVModal(true)}>Add Spending</button>
    <button className = "deleteButton" onClick = {() => setDeleteModal(true)}>Clear Spending</button>
    {budgetModal && <BudgetModal setModal = {setModal} setBudget = {setBudget}/>}
    {CSVModal && <CsvModal setModal = {setCSVModal} dataChange = {dataNeedGrab} setDataChange = {setDataNeedGrab}/>}
    {deleteModal && <DeleteModal setModal = {setDeleteModal} changeVal = {dataNeedGrab} dataChange = {setDataNeedGrab}/>}
    
</div>
);
}

export default BudgetTracker;
