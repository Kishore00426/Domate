import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../api/services';
import { getProvidersByService } from '../api/providers';
import { createBooking } from '../api/bookings';
import HomeLayout from '../layouts/HomeLayout';
import { CheckCircle2, XCircle, Wrench, FileText, Loader, Star, User } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';


const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Booking State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingNotes, setBookingNotes] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const serviceResponse = await getServiceById(id);
                if (serviceResponse.success) {
                    setService(serviceResponse.service);
                } else {
                    setError('Service not found or failed to load.');
                    setLoading(false);
                    return;
                }

                try {
                    const providersResponse = await getProvidersByService(id);
                    if (providersResponse.success) {
                        setProviders(providersResponse.providers);
                    }
                } catch (err) {
                    console.error("Failed to fetch providers", err);
                }

            } catch (err) {
                setError('An error occurred while fetching details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleOpenBooking = (provider) => {
        setSelectedProvider(provider);
        setIsBookingModalOpen(true);
        setBookingError(null);
    };

    const handleCloseBooking = () => {
        setIsBookingModalOpen(false);
        setSelectedProvider(null);
        setBookingDate("");
        setBookingTime("");
        setBookingNotes("");
        setBookingError(null);
    };

    const handleConfirmBooking = async () => {
        if (!bookingDate || !bookingTime) {
            setBookingError("Please select both date and time.");
            return;
        }

        setBookingLoading(true);
        setBookingError(null);

        try {
            const scheduledDateTime = new Date(`${bookingDate}T${bookingTime}`);

            const payload = {
                providerId: selectedProvider._id,
                serviceId: service._id,
                scheduledDate: scheduledDateTime.toISOString(),
                notes: bookingNotes
            };

            const response = await createBooking(payload);

            if (response.success) {
                setIsBookingModalOpen(false);
                navigate('/account');
            } else {
                setBookingError(response.error);
            }
        } catch (err) {
            setBookingError("Failed to book service. Please try again.");
            console.error(err);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader className="w-10 h-10 text-soft-black animate-spin" />
                </div>
            </HomeLayout>
        );
    }

    const parseList = (list) => {
        if (!list) return [];
        return list.flatMap(item =>
            typeof item === 'string' ? item.split(',').map(s => s.trim()) : item
        ).filter(s => s !== "");
    };

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
                        Back to Services
                    </button>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>


            <div className=" min-h-screen mt-16 md:mt-20 pb-20 pt-4 md:pt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">

                        <div className="w-full lg:w-[60%] space-y-6 md:space-y-8">
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="aspect-video relative bg-gray-100">
                                    {service.imageUrl ? (
                                        <img
                                            src={getImageUrl(service.imageUrl)}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image Available
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold text-soft-black shadow-sm">
                                            {service.category?.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 md:p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-bold text-soft-black mb-2">{service.title}</h1>
                                            {service.subcategory && (
                                                <p className="text-gray-500 text-sm">{service.subcategory.name}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-soft-black">₹{service.price}</div>
                                            <div className="text-xs text-gray-500">Starting from</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                        {service.detailedDescription}
                                    </p>

                                    {service.warranty && (
                                        <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg w-fit text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Warranty: {service.warranty}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {service.whatIsCovered && service.whatIsCovered.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-soft-black mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        What is Covered
                                    </h3>
                                    <ul className="list-disc list-inside grid grid-cols-1 gap-3 text-sm text-gray-700">
                                        {parseList(service.whatIsCovered).map((item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {service.whatIsNotCovered && service.whatIsNotCovered.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-soft-black mb-4 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        What is Not Covered
                                    </h3>
                                    <ul className="list-disc list-inside grid grid-cols-1 gap-3 text-sm text-gray-700">
                                        {parseList(service.whatIsNotCovered).map((item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {parseList(service.requiredEquipment).length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-soft-black mb-4 flex items-center gap-2">
                                            <Wrench className="w-5 h-5 text-amber-600" />
                                            Required Equipment
                                        </h3>
                                        <ul className="space-y-3">
                                            {parseList(service.requiredEquipment).map((item, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {service.serviceProcess && service.serviceProcess.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-soft-black mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Service Process
                                        </h3>
                                        <div className="space-y-3">
                                            {parseList(service.serviceProcess).map((item, index) => (
                                                <div key={index} className="flex gap-3 text-sm">
                                                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                                                    <span className="text-gray-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-[40%]">
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-soft-black mb-6">Book an Expert Today</h2>

                                {providers.length > 0 ? (
                                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                                        {providers.map((provider) => (
                                            <div
                                                key={provider._id}
                                                title="Click to book"
                                                className="group border border-gray-100 rounded-xl p-4 hover:border-gray-800 hover:bg-white transition-all cursor-pointer bg-gray-50/50"
                                                onClick={() => handleOpenBooking(provider)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-soft-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:bg-black transition-colors">
                                                        {provider.user?.username ? provider.user.username.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-soft-black truncate">{provider.user?.username || 'Service Provider'}</h3>
                                                        <div className="flex items-center gap-3 text-sm mt-1">
                                                            <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-md">
                                                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                                <span className="font-semibold text-yellow-700">{provider.rating || 'New'}</span>
                                                            </div>
                                                            <span className="text-gray-500 text-xs px-2 py-0.5 bg-gray-100 rounded-md">
                                                                {provider.experience ? `${provider.experience} exp` : 'Trained'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-gray-300 group-hover:text-black transition-colors">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">No experts currently available for this service.</p>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                    <p className="text-xs text-gray-500">
                                        All our experts are verified and background checked.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Booking Modal */}
                {isBookingModalOpen && selectedProvider && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95">

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-soft-black">Confirm Booking</h3>
                                <button
                                    onClick={handleCloseBooking}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-xl flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Wrench className="w-6 h-6 text-soft-black" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-soft-black">{service.title}</p>
                                        <p className="text-sm text-gray-500">with {selectedProvider.user?.username}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                                    <textarea
                                        value={bookingNotes}
                                        onChange={(e) => setBookingNotes(e.target.value)}
                                        placeholder="Any specific instructions or requirements..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                    />
                                </div>

                                {bookingError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        {bookingError}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleCloseBooking}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={bookingLoading}
                                        className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {bookingLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Confirm & Book"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </HomeLayout>
    );
};

export default ServiceDetail;
