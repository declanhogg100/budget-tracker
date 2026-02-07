import {useState} from 'react'
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';
import "./TotalSpent.css"


function TotalSpent( {budget,totalSpent, data} ){
const maxRadius = 210;
const safeRatio = Math.min(Math.max(totalSpent || 0, 0), 1);
return(
    <>
    <PieChart width = {650} height = {550} className = "pieChart">
        <Pie
        data = {data}
        dataKey="total"
        nameKey="category"
        cx="50%"
        cy="50%"
        outerRadius={maxRadius * safeRatio}
        >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} stroke = "rgba(33, 33, 33, 1)"
          strokeWidth={1.5}/>
        ))}
        </Pie>
        <Tooltip />
    </PieChart>
    </>
);
}

export default TotalSpent;
