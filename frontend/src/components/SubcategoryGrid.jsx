import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubcategoryGrid = ({ subcategories, selectedSubcategory, onSubcategorySelect, categoryName }) => {
    const navigate = useNavigate();

    const handleSelect = (sub) => {
        if (onSubcategorySelect) {
            onSubcategorySelect(sub.name);
        }
    };

    if (!subcategories || subcategories.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-soft-black mb-6">What {categoryName || 'service'} do you need?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subcategories.map((sub) => (
                    <div
                        key={sub._id}
                        onClick={() => handleSelect(sub)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 group
                            ${selectedSubcategory === sub.name
                                ? 'bg-black text-white shadow-lg scale-105'
                                : 'bg-white border border-gray-100 hover:shadow-md hover:border-gray-200'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-xl overflow-hidden ${selectedSubcategory === sub.name ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            {/* Assuming subcategory has imageUrl, otherwise placeholder */}
                            {sub.imageUrl ? (
                                <img src={`http://localhost:4000${sub.imageUrl}`} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                            )}
                        </div>
                        <span className={`text-sm font-semibold text-center leading-tight ${selectedSubcategory === sub.name ? 'text-white' : 'text-gray-700 group-hover:text-black'}`}>
                            {sub.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubcategoryGrid;
