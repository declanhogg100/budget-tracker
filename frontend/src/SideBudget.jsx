import "./SideBudget.css";

function SideCats({ data, spent }) {
  const sorted = [...data].sort(
    (a, b) => Number(b.total ?? 0) - Number(a.total ?? 0)
  );
  return (
    <div className="sideBar">
      <h1 className="header1">Categories</h1>
      {sorted.map((entry, index) => (
        <div className="categoryStats" key={entry.categoryKey ?? index}>
          <div className="sideDivider" />
          <div className="leftSide">
            <h2
              className="categoryName"
              style={{ fontSize: "28px", fontWeight: "normal", marginLeft: "12px" }}
            >
              {entry.category}
            </h2>
            <div className="colorBox" style={{ "--box-color": entry.color }} />
          </div>
          <h4
            style={{
              marginRight: "10px",
              fontSize: "28px",
              fontWeight: "normal",
            }}
          >
            {entry.total}$
          </h4>
        </div>
      ))}
    </div>
  );
}

export default SideCats;
