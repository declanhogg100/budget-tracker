import { useEffect, useMemo, useState } from "react";
import "./Categories.css";
import CatList from "./CatList.jsx";
import TransList from "./TransList.jsx";

function Categories({categories = [], transactions = [], dataNeedGrab, setDataNeedGrab}){
    const [activeCatId, setActiveCatId] = useState(null);

    useEffect(() => {
        if (categories.length === 0) {
            setActiveCatId(null);
            return;
        }
        const firstKey = categories[0].categoryKey ?? categories[0].id ?? categories[0].category;
        const normalizedKey = firstKey ? String(firstKey) : null;
        if (!activeCatId || !categories.some(cat => {
            const key = cat.categoryKey ?? cat.id ?? cat.category;
            return String(key) === activeCatId;
        })) {
            setActiveCatId(normalizedKey);
        }
    }, [categories, activeCatId]);

    const activeCategory = categories.find(cat => {
        const key = cat.categoryKey ?? cat.id ?? cat.category;
        return String(key) === activeCatId;
    }) || null;
    const activeTransactions = useMemo(
        () => transactions.filter(tx => {
            if (!activeCatId) return false;
            if (tx.categoryKey && tx.categoryKey === activeCatId) return true;
            if (!activeCategory) return false;
            return (
                (tx.category || "").toLowerCase() ===
                (activeCategory.category || "").toLowerCase()
            );
        }),
        [transactions, activeCatId, activeCategory]
    );

    return(
        <div className="categoriesPage">
            <div className="categoriesPanel">
                <CatList
                    categories={categories}
                    activeId={activeCatId}
                    onSelect={setActiveCatId}
                />
                <TransList
                    category={activeCategory}
                    transactions={activeTransactions}
                    categories={categories}
                    dataNeedGrab = {dataNeedGrab}
                    setDataNeedGrab = {setDataNeedGrab}
                />
            </div>
        </div>
    );
}

export default Categories;
