import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeSearchModal } from '../store/uiSlice';
import { Search, Grid } from 'lucide-react';

const SearchModal = ({ searchTerm = '' }) => {
  const isOpen = useSelector((state) => state.ui.isSearchModalOpen);
  const services = useSelector((state) => state.services.services);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const searchLower = searchTerm.toLowerCase();

  // Filter Services
  const filteredServices = services.filter(service => {
    const serviceName = service.title || service.name || '';
    const categoryName = typeof service.category === 'object' ? service.category?.name : service.category || '';

    return serviceName.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower);
  });

  // Extract and Filter Unique Subcategories
  const subcategoriesMap = new Map();
  services.forEach(service => {
    if (service.subcategory && typeof service.subcategory === 'object') {
      const subName = service.subcategory.name;
      const catName = typeof service.category === 'object' ? service.category?.name : '';

      if (subName && !subcategoriesMap.has(subName)) {
        subcategoriesMap.set(subName, {
          name: subName,
          categoryName: catName,
          _id: service.subcategory._id
        });
      }
    }
  });

  const filteredSubcategories = Array.from(subcategoriesMap.values()).filter(sub =>
    sub.name.toLowerCase().includes(searchLower)
  );

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
    dispatch(closeSearchModal());
  };

  const handleSubcategoryClick = (subcategory, categoryName) => {
    if (categoryName) {
      navigate(`/services?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategory)}`);
    } else {
      // Fallback if category name is missing, though less ideal
      navigate(`/services?subcategory=${encodeURIComponent(subcategory)}`);
    }
    dispatch(closeSearchModal());
  };

  const hasResults = filteredServices.length > 0 || filteredSubcategories.length > 0;

  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
      <div className="py-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4 pt-2">
          {searchTerm ? 'Search Results' : 'Popular Services'}
        </h3>

        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {hasResults ? (
            <>
              {/* Subcategories Section */}
              {filteredSubcategories.map((sub) => (
                <button
                  key={`sub-${sub._id || sub.name}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group w-full border-l-4 border-transparent hover:border-indigo-500"
                  onClick={() => handleSubcategoryClick(sub.name, sub.categoryName)}
                >
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Grid className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-soft-black">{sub.name}</div>
                    <div className="text-[10px] text-gray-500">
                      Category: {sub.categoryName || 'General'}
                    </div>
                  </div>
                </button>
              ))}

              {/* Services Section */}
              {filteredServices.map((service) => (
                <button
                  key={service._id || service.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group w-full"
                  onClick={() => handleServiceClick(service._id || service.id)}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-soft-black">{service.title || service.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {typeof service.category === 'object' ? service.category?.name : service.category}
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No results found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
