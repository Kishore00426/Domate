import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, Briefcase, Calendar, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getMe } from '../api/auth';
import { getProviderBookings, updateBookingStatus } from '../api/bookings';

const ProviderDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Auth & Data States
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getMe();
                if (userData.user.role !== 'service_provider') {
                    navigate('/home'); // Kick out if not provider
                    return;
                }
                setUser(userData.user);

                // Fetch provider bookings for "Pending Requests" widget
                try {
                    const bookingsRes = await getProviderBookings();
                    if (bookingsRes.success) {
                        setBookings(bookingsRes.bookings);
                    }
                } catch (e) { console.error("Error fetching bookings", e); }

            } catch (err) {
                console.error("Failed to load user data", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Mobile Navigation Items pointing to routes
    const mobileNavItems = [
        { path: '/provider/profile', label: t('dashboard.profile') || 'Profile', icon: User, color: 'text-blue-600' },
        { path: '/provider/services', label: t('dashboard.myServices') || 'My Services', icon: Briefcase, color: 'text-purple-600' },
        { path: '/provider/bookings', label: t('dashboard.myBookings') || 'Bookings', icon: Calendar, color: 'text-amber-600' },
        { path: '/provider/documents', label: t('dashboard.verificationDocuments') || 'Documents', icon: Upload, color: 'text-green-600' },
    ];

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            {/* Introduction / Welcome Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-soft-black mb-2">{t('dashboard.welcome')}, {user?.username || 'Provider'}!</h1>
                        <p className="text-gray-500 text-sm md:text-base">Here is what's happening with your bookings today.</p>
                    </div>
                </div>
            </div>

            {/* Pending Requests Section - Hidden on Mobile to mimic UserDashboard flow */}
            <div className="hidden md:block bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                <h3 className="font-semibold text-lg mb-6 text-amber-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {t('dashboard.pendingRequests')}
                </h3>

                {bookings.filter(b => b.status === 'pending').length > 0 ? (
                    <div className="space-y-4">
                        {bookings.filter(b => b.status === 'pending').map(booking => (
                            <div key={booking._id} className="border border-amber-100 bg-amber-50 rounded-2xl p-4 md:p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div>
                                        <h4 className="font-bold text-soft-black mb-1">{booking.service?.title || 'Unknown Service'}</h4>
                                        <p className="text-sm text-gray-700 font-medium mb-1">{t('dashboard.customer')}: {booking.user?.username || 'Guest'}</p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {t('dashboard.date')}: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
                                            {' '}
                                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                        {booking.notes && (
                                            <p className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg border border-amber-100 italic">" {booking.notes} "</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('Accept this booking?')) return;
                                                const res = await updateBookingStatus(booking._id, 'accepted');
                                                if (res.success) {
                                                    setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'accepted' } : b));
                                                } else {
                                                    alert(res.error);
                                                }
                                            }}
                                            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 md:py-2 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md transition-colors"
                                        >
                                            {t('dashboard.accept')}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('Reject this booking?')) return;
                                                const res = await updateBookingStatus(booking._id, 'rejected');
                                                if (res.success) {
                                                    setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'rejected' } : b));
                                                } else {
                                                    alert(res.error);
                                                }
                                            }}
                                            className="flex-1 md:flex-none bg-red-50 text-red-600 px-6 py-3 md:py-2 rounded-xl text-sm font-bold hover:bg-red-100 border border-red-100 transition-colors"
                                        >
                                            {t('dashboard.reject')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <AlertCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium">{t('dashboard.noPendingRequests')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
