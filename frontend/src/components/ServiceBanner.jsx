import React from 'react';
import { getImageUrl } from '../utils/imageUrl';

const ServiceBanner = ({ name, description, imageUrl }) => {
    return (
        <div className="bg-soft-black rounded-3xl overflow-hidden shadow-lg p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center gap-8 relative max-w-6xl mx-auto md:mt-12">
            {/* Background Pattern/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-soft-black via-soft-black/90 to-transparent z-10"></div>

            {/* Content */}
            <div className="relative z-20 flex-1 text-center md:text-left space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    {name}
                </h1>
                {description && (
                    <p className="text-gray-300 text-lg md:text-xl max-w-xl">
                        {description}
                    </p>
                )}
                <div className="pt-4">
                    <span className="inline-block bg-white text-soft-black px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
                        Best in Class
                    </span>
                </div>
            </div>

            {/* Image */}
            {imageUrl && (
                <div className="relative z-10 w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img
                        src={getImageUrl(imageUrl)}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </div>
    );
};

export default ServiceBanner;
