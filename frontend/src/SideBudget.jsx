import { useState } from 'react'
import "./SideBudget.css"


function SideCats({data, spent}){
    return(
        <div className = "sideBar">
            <h1 className = "header1">Categories</h1>
            {data.map((entry, index) => (
                <div className = "categoryStats">
                    <div className = "sideDivider"/>
                    <div className = "leftSide">
                        <h2 style ={{fontSize: "28px",fontWeight: "normal", marginLeft: "40px"}}>{entry.category}</h2>
                        <div className = "colorBox" style = {{"--box-color": entry.color}}/>
                    </div>
                    <h4 style = {{
                        marginRight: "10px", 
                        fontSize: "28px", 
                        fontWeight: "normal" }}>
                            {entry.total}$
                        </h4>
                </div>
            ))}
        </div>
    );
}

export default SideCats;