import { useMemo, useState, useEffect } from "react";
import "./MovePicker.css";

function MovePicker({ open, onClose, categories = [], initialCategoryKey, onConfirm }) {
  const [targetCat, setTargetCat] = useState(initialCategoryKey || null);

  useEffect(() => {
    setTargetCat(initialCategoryKey || null);
  }, [initialCategoryKey, open]);

  const categoryOptions = useMemo(
    () =>
      (categories || []).map(cat => ({
        key: cat.id,
        name: cat.category,
        color: cat.color
      })),
    [categories]
  );

  if (!open) return null;

  return (
    <div className="moveOverlay" onClick={onClose}>
      <div className="moveModal" onClick={e => e.stopPropagation()}>
        <h3>Select a category</h3>
        <div className="moveList">
          {categoryOptions.map(option => {
            const keyString = option.key != null ? String(option.key) : "";
            return (
              <button
                key={keyString}
                className={`moveItem ${targetCat === keyString ? "active" : ""}`}
                onClick={() => setTargetCat(keyString)}
              >
                <span className="moveLeft">
                  <span
                    className="moveColor"
                    style={{ "--cat-color": option.color || "#ccc" }}
                  />
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
        <div className="moveActions">
          <button className="moveCancel" onClick={onClose}>Cancel</button>
          <button
            className="moveConfirm"
            onClick={() => onConfirm(targetCat)}
            disabled={!targetCat}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovePicker;
