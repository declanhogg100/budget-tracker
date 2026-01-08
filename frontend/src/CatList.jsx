import "./CatList.css";

function CatList({ categories = [], activeId, onSelect }) {
  if (categories.length === 0) {
    return (
      <div className="catList empty">
        <p>No categories yet</p>
      </div>
    );
  }

  return (
    <div className="catList">
        <div className="catListTitle">Categories</div>
      {categories.map(cat => {
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
      )})}
    </div>
  );
}

export default CatList;
