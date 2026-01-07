import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getUserBookings, deleteBooking } from '../api/bookings';
import { Calendar, User, ArrowLeft, Clock, Mail, Phone } from 'lucide-react';



const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getUserBookings();
                if (data.success) {
                    setBookings(data.bookings);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
            </HomeLayout>
        );
    }



    const handleContactClick = (provider) => {
        setSelectedContact(provider);
        setShowContactModal(true);
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;

        try {
            const res = await deleteBooking(bookingId);
            if (res.success) {
                setBookings(prev => prev.filter(b => b._id !== bookingId));
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete booking");
        }
    };

    return (
        <HomeLayout>
            <div className="pt-[100px] px-4 pb-20 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/account')}
                    className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-soft-black">My Bookings</h1>
                        <p className="text-gray-500">View and track your service appointments</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {bookings.length > 0 ? (
                        bookings.map(booking => (
                            <div key={booking._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between md:justify-start gap-4">
                                            <h3 className="font-bold text-xl text-soft-black">{booking.service?.title || "Service Unavailable"}</h3>
                                            <span className={`md:hidden px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">Provider: <span className="font-medium text-gray-800">{booking.serviceProvider?.username || "Unknown"}</span></span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">
                                                {new Date(booking.scheduledDate).toLocaleDateString()} at {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {booking.notes && (
                                            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm text-gray-600 italic border border-gray-100">
                                                "{booking.notes}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                                        <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>

                                        {booking.status === 'accepted' && (
                                            <button
                                                onClick={() => handleContactClick(booking.serviceProvider)}
                                                className="w-full md:w-auto bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                                            >
                                                Contact Provider
                                            </button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleDelete(booking._id)}
                                                className="w-full md:w-auto text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                        {booking.status === 'rejected' && (
                                            <button
                                                onClick={() => handleDelete(booking._id)}
                                                className="w-full md:w-auto text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-gray-50/50 rounded-3xl border border-gray-100">
                            <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-lg">No bookings found.</p>
                            <p className="text-sm">Book a service to get started!</p>
                            <button
                                onClick={() => navigate('/services')}
                                className="mt-4 text-blue-600 font-medium hover:underline"
                            >
                                Browse Services
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && selectedContact && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-soft-black">{selectedContact.username}</h3>
                            <p className="text-sm text-gray-500">Service Provider</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                                    <p className="font-medium text-gray-900 truncate">{selectedContact.email}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedContact.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowContactModal(false)}
                            className="w-full bg-soft-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </HomeLayout>
    );
};

export default MyBookings;
