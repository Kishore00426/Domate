import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

const ServiceList = ({ selectedCategory, selectedSubcategory }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (selectedCategory) params.append('category', selectedCategory);
                if (selectedSubcategory) params.append('subcategory', selectedSubcategory);

                const queryString = params.toString();
                const url = queryString ? `/services?${queryString}` : '/services';

                const response = await api.get(url);
                setServices(response.data.services);
            } catch (err) {
                console.error("Failed to fetch services", err);
                setError("Failed to load services. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [selectedCategory, selectedSubcategory]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                {error}
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No services found{selectedCategory ? ` for "${selectedCategory}"` : ''}.</p>
            </div>
        );
    }

    return (
        <section className="py-8 px-6 max-w-6xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                            {service.imageUrl ? (
                                <img
                                    src={getImageUrl(service.imageUrl)}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-soft-black">
                                {service.category?.name}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-soft-black mb-2">{service.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.detailedDescription}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-soft-black">₹{service.price}</span>
                                <button
                                    onClick={() => navigate(`/services/${service._id}`)}
                                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServiceList;
