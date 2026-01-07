import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';
import { openSearchModal, closeSearchModal } from '../store/uiSlice';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const searchRef = useRef(null);
    const isSearchOpen = useSelector((state) => state.ui.isSearchModalOpen);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target) && isSearchOpen) {
                dispatch(closeSearchModal());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen, dispatch]);

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-soft-black focus:border-soft-black text-base transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Search for services..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        dispatch(openSearchModal());
                    }}
                    onFocus={() => dispatch(openSearchModal())}
                />
            </div>

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <SearchModal searchTerm={searchTerm} />
                </div>
            )}
        </div>
    );
};

export default SearchBar;
