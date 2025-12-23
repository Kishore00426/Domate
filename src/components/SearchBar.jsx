import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
    return (
        <div className="relative hidden md:block w-72 lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-black rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-soft-black focus:border-soft-black sm:text-sm transition-colors duration-200"
                placeholder="Search for services..."
            />
        </div>
    );
};

export default SearchBar;
