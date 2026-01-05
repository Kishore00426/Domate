import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`fixed top-9 left-9 z-60 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-white/20 px-4 py-2 flex items-center gap-2 text-gray-500 hover:text-soft-black transition-colors text-sm font-medium ${className}`}
        >
            <ArrowLeft className="w-4 h-4" />
        </button>
    );
};

export default BackButton;