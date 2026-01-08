import { useState, useEffect } from 'react'
import "./Directories.css"


function Directories({pagePicker, setPage}){


    const handleClick = (dName) => {
        console.log("asof");
        if(dName!=pagePicker){
            dName==="Budget" ? setPage("Budget") : setPage("Categories");
            console.log(pagePicker);
        }
    }
    return(
            <div className = "leftSideBar">
                <h1 className = "leftBarHead">Navigation</h1>
                <div className = "leftDivider"></div>
                    <button className = "budgetButton" onClick = {()=>{handleClick("Budget")}} 
                    style = {{
                        "--BudgetBackColor": pagePicker==="Budget" ?"rgba(77, 141, 205, 0.6)" : "transparent",
                        "--budgetHover": pagePicker==="Budget" ? "rgba(107, 161, 215, 0.6)" : "rgba(162, 162, 162, 0.56)"
                    }}>
                    Budget</button>
                    <button className = "catButton" onClick = {()=>{handleClick("Categories")}}
                    style = {{
                        "--CategoriesBackColor": pagePicker==="Categories" ?"rgba(77, 141, 205, 0.6)" : "transparent",
                        "--catHover": pagePicker==="Categories" ? "rgba(107, 161, 215, 0.6)" : "rgba(234, 234, 234, 0.56)"
                    }}>
                    Categories</button>
            </div>
    );
}

export default Directories;