import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../api/services';
import HomeLayout from '../layouts/HomeLayout';
import { CheckCircle2, XCircle, Wrench, FileText, ArrowLeft, Loader, IndianRupee } from 'lucide-react';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            setLoading(true);
            try {
                const response = await getServiceById(id);
                if (response.success) {
                    setService(response.service);
                } else {
                    setError('Service not found or failed to load.');
                }
            } catch (err) {
                setError('An error occurred while fetching service details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchService();
        }
    }, [id]);

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader className="w-10 h-10 text-soft-black animate-spin" />
                </div>
            </HomeLayout>
        );
    }

    if (error || !service) {
        return (
            <HomeLayout>
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-8">{error || "Service not found."}</p>
                    <button
                        onClick={() => navigate('/services')}
                        className="text-soft-black font-medium hover:underline flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Services
                    </button>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <div className="bg-gray-50 min-h-screen pb-20">
                {/* Hero / Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-500 hover:text-soft-black transition-colors flex items-center gap-2 mb-6 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-1/3 bg-gray-100 rounded-2xl overflow-hidden aspect-video relative shadow-sm">
                                {service.imageUrl ? (
                                    <img
                                        src={`http://localhost:4000${service.imageUrl}`}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{service.category?.name}</span>
                                        <h1 className="text-3xl font-bold text-soft-black mt-3 mb-2">{service.title}</h1>
                                        {service.subcategory && (
                                            <p className="text-gray-500 text-sm mb-4">Type: {service.subcategory.name}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-soft-black flex items-center justify-end">
                                            <IndianRupee className="w-6 h-6" />{service.price}
                                        </div>
                                        {service.warranty && (
                                            <p className="text-green-600 text-sm font-medium mt-1">Warranty: {service.warranty}</p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 mt-4 leading-relaxed bg-white rounded-xl">
                                    {service.detailedDescription}
                                </p>

                                <div className="mt-8 flex gap-4">
                                    <button className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-transform active:scale-95 shadow-lg">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Sections */}
                <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* What is Covered */}
                    {service.whatIsCovered && service.whatIsCovered.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-soft-black mb-6 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                What is Covered
                            </h3>
                            <ul className="space-y-4">
                                {service.whatIsCovered.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* What is Not Covered */}
                    {service.whatIsNotCovered && service.whatIsNotCovered.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-soft-black mb-6 flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                What is Not Covered
                            </h3>
                            <ul className="space-y-4">
                                {service.whatIsNotCovered.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Required Equipment */}
                    {service.requiredEquipment && service.requiredEquipment.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-soft-black mb-6 flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                Required Equipment
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 italic">Please ensure these are available/prepared:</p>
                            <ul className="space-y-4">
                                {service.requiredEquipment.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Service Process */}
                    {service.serviceProcess && service.serviceProcess.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-soft-black mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Service Process
                            </h3>
                            <div className="space-y-6">
                                {service.serviceProcess.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-gray-700">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </HomeLayout>
    );
};

export default ServiceDetail;
