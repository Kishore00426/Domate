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
                            className="flex-none w-72 sm:w-80 snap-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100">
                                    {expert.user?.profileImage ? (
                                        <img
                                            src={getImageUrl(expert.user.profileImage)}
                                            alt={expert.user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>

                                {/* Name & Role */}
                                <h3 className="font-bold text-lg text-soft-black mb-1">
                                    {expert.user?.username || "Service Provider"}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-1 text-sm font-bold text-gray-700 mb-4">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span>{expert.rating || "New"}</span>
                                    <span className="text-gray-400 font-normal">
                                        ({expert.totalReviews || 0} reviews)
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="w-full grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                                        <p className="font-bold text-soft-black">{expert.experience} Yrs</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Services</p>
                                        <p className="font-bold text-soft-black">{expert.services?.length || 0}</p>
                                    </div>
                                </div>

                                {/* Services List (Truncated) */}
                                <div className="w-full text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase">Expertise</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {expert.services?.slice(0, 3).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md truncate max-w-[100px]"
                                            >
                                                {service.title || "Service"}
                                            </span>
                                        ))}
                                        {expert.services?.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md">
                                                +{expert.services.length - 3}
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
