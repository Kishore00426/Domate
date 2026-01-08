import React, { useEffect, useState } from 'react';
import { Star, User, Award, Briefcase } from 'lucide-react';
import { getAllVerifiedProviders } from '../api/providers';
import { getImageUrl } from '../utils/imageUrl';

const OurExperts = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const response = await getAllVerifiedProviders();
                if (response.success) {
                    setExperts(response.providers);
                }
            } catch (error) {
                console.error("Failed to fetch experts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExperts();
    }, []);

    if (loading) {
        return (
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto pl-2">
                    <div className="h-8 w-64 rounded-lg animate-pulse mb-6"></div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-none w-72 h-80 bg-white rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (experts.length === 0) return null;

    return (
        <section className="py-12 px-4 ">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 pl-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-soft-black flex items-center gap-2">
                        <Award className="w-6 h-6 text-black" />
                        Meet Our Experts
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        Highly rated professionals ready to help you.
                    </p>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
                    {experts.map((expert) => (
                        <div
                            key={expert._id}
                            className="flex-none w-64 h-96 snap-start relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                        >
                            {/* Full Background Image */}
                            <div className="absolute inset-0 bg-gray-200">
                                {expert.user?.profileImage ? (
                                    <img
                                        src={getImageUrl(expert.user.profileImage)}
                                        alt={expert.user.username}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-5">
                                {/* Content placed below 50% visually due to flex-col justify-end */}

                                {/* Name */}
                                <h3 className="font-bold text-xl text-white mb-1 text-left">
                                    {expert.user?.username || "Service Provider"}
                                </h3>

                                {/* Experience & Ratings Row */}
                                <div className="flex items-center justify-between text-white/90 text-sm mb-3">
                                    <div className="font-medium text-left text-gray-300">
                                        {expert.experience} Yrs Exp
                                    </div>
                                </div>

                                {/* Expertise */}
                                <div className="text-left">
                                    <p className="text-xs text-white/60 uppercase font-semibold mb-2">Expertise</p>
                                    <div className="flex flex-wrap gap-2">
                                        {expert.services?.slice(0, 2).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-md truncate max-w-[100px] border border-white/10"
                                            >
                                                {service.title || "Service"}
                                            </span>
                                        ))}
                                        {expert.services?.length > 2 && (
                                            <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-md">
                                                +{expert.services.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurExperts;
