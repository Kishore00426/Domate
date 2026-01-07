import React, { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllServices } from '../api/services';
import { getImageUrl } from '../utils/imageUrl';

const CategoryServiceRow = ({ category }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fetch services specifically for this category
                const response = await getAllServices({ category: category.name });
                if (response.success) {
                    setServices(response.services);
                }
            } catch (error) {
                console.error(`Failed to fetch services for ${category.name}`, error);
            } finally {
                setLoading(false);
            }
        };

        if (category?.name) {
            fetchServices();
        }
    }, [category]);

    if (loading) {
        return (
            <section className="py-8 px-4 border-b border-gray-50 last:border-0">
                <div className="max-w-6xl mx-auto pl-2">
                    <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse mb-6"></div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-none w-72 h-64 bg-gray-50 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (services.length === 0) return null;

    return (
        <section className="py-12 px-4 border-b border-gray-50 last:border-0">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 pl-2 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-soft-black flex items-center gap-2">
                            {category.name} Services
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Explore top-rated {category.name.toLowerCase()} services
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/services?category=${category.name}`)}
                        className="text-sm font-semibold text-black hover:underline hidden sm:block"
                    >
                        View All
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
                    {services.map((service) => (
                        <div
                            key={service._id}
                            className="flex-none w-60 sm:w-80 snap-start group rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 bg-white"
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
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-sm">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span>4.8</span>
                                </div>
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

                    {/* View All Card */}
                    <div
                        onClick={() => navigate(`/services?category=${category.name}`)}
                        className="flex-none w-40 sm:w-48 snap-start rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Sparkles className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500">View All {category.name}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryServiceRow;
