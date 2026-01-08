import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getUserBookings, deleteBooking, rateBooking } from '../api/bookings';
import { Calendar, User, ArrowLeft, Clock, Mail, Phone, X, Star } from 'lucide-react';



const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Review Modal State
    const [activeBookingForReview, setActiveBookingForReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });

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
            <div className="min-h-screen bg-gray-50/30 pt-[10px] md:mt-30 px-4 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => navigate('/account')}
                            className="p-3 -ml-2 hover:bg-gray-100 p-4 bg-blue-50 text-blue-600 rounded-2xl rounded-full transition-colors text-gray-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

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

                                            {booking.status === 'completed' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    {booking.invoice && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-soft-black">Total: ₹{booking.invoice.totalAmount}</p>
                                                        </div>
                                                    )}

                                                    {!booking.review ? (
                                                        <button
                                                            onClick={() => {
                                                                setActiveBookingForReview(booking);
                                                                setReviewForm({ rating: 0, comment: '' });
                                                            }}
                                                            className="w-full md:w-auto bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2"
                                                        >
                                                            <Star className="w-4 h-4 fill-white" /> Rate Provider
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                                            <Star className="w-4 h-4 fill-yellow-500" /> {booking.review.rating}/5
                                                        </div>
                                                    )}
                                                </div>
                                            )}

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
            </div>




            {/* Contact Modal */}
            {showContactModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-soft-black">Provider Contact</h3>
                            <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <User className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-soft-black">{selectedContact.username}</h4>
                                <p className="text-sm text-gray-500">Service Provider</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-gray-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                        <p className="font-medium text-gray-900">{selectedContact.phone || "Not available"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-gray-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                        <p className="font-medium text-gray-900">{selectedContact.email || "Not available"}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowContactModal(false)}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {
                activeBookingForReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-soft-black">Rate Your Experience</h3>
                                <button onClick={() => setActiveBookingForReview(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Leave a Comment</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none h-32 resize-none"
                                        placeholder="How was the service provided?"
                                    ></textarea>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!reviewForm.rating) return alert("Please select a star rating");

                                        const res = await rateBooking(activeBookingForReview._id, reviewForm);
                                        if (res.success) {
                                            setBookings(prev => prev.map(b => b._id === activeBookingForReview._id ? res.booking : b));
                                            setActiveBookingForReview(null);
                                            alert("Thank you for your feedback!");
                                        } else {
                                            alert(res.error);
                                        }
                                    }}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </HomeLayout >
    );
};

export default MyBookings;
