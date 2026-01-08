import React, { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllServices } from '../api/services';
import { getImageUrl } from '../utils/imageUrl';

const CleanHomeServices = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCleaningServices = async () => {
            try {
                const response = await getAllServices({ category: 'Cleaning' });
                if (response.success) {
                    setServices(response.services);
                }
            } catch (error) {
                console.error("Failed to fetch cleaning services", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCleaningServices();
    }, []);

    if (loading) {
        return (
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto pl-2">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-none w-72 h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (services.length === 0) return null;

    return (
        <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 pl-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-soft-black flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        Sparkle & Shine: Premium Cleaning for Your Home
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Experience the joy of a spotless home with our top-rated cleaning professionals.
                    </p>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
                    {services.map((service) => (
                        <div
                            key={service._id}
                            className="flex-none w-72 sm:w-80 snap-start group rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 bg-white"
                            onClick={() => navigate(`/services/${service._id}`)}
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden rounded-xl bg-gray-100">
                                {service.imageUrl ? (
                                    <img
                                        src={getImageUrl(service.imageUrl)}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}

                            </div>

                            {/* Content */}
                            <div className="pt-4 px-2 pb-4">
                                <h3 className="font-bold text-soft-black mb-1 text-lg truncate" title={service.title}>
                                    {service.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10">
                                    {service.description || service.detailedDescription}
                                </p>
                                <div className="text-sm font-medium text-gray-900 flex items-center justify-between">
                                    <div>Starts at <span className="font-bold">₹{service.price}</span></div>
                                    <span className="text-xs text-blue-600 font-semibold group-hover:underline">Book Now &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CleanHomeServices;
