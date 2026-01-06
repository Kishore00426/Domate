import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeSearchModal } from '../store/uiSlice';
import { Search } from 'lucide-react';

const SearchModal = ({ searchTerm = '' }) => {
  const isOpen = useSelector((state) => state.ui.isSearchModalOpen);
  const services = useSelector((state) => state.services.services);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredServices = services.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    const serviceName = service.title || service.name || '';
    const categoryName = typeof service.category === 'object' ? service.category?.name : service.category || '';

    return serviceName.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower);
  });

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
    dispatch(closeSearchModal());
  };

  return (
    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
      {/* Services List */}
      <div className="py-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4 pt-2">
          {searchTerm ? 'Search Results' : 'Popular Services'}
        </h3>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
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
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No services found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
