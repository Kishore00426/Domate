import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateBookingStatus } from '../api/bookings';

const ProviderDashboard = () => {
    const { t } = useTranslation();
    const { user, providerDetails, setProviderDetails } = useOutletContext();
    const [bookings, setBookings] = useState([]);
    // Note: In a real app we might want to lift 'bookings' state to context if needed across pages, 
    // but for now Overview just needs 'pending' ones. 
    // We'll fetch them here or re-use what we can. 
    // Actually, passing bookings via Outlet context might be heavy if not needed everywhere. 
    // Let's fetch pending bookings here or assume we want just the welcome + pending.

    // FETCHING LOGIC:
    // The original dashboard fetched ALL bookings. 
    // For Overview, we only need Pending ones.
    // Let's implement a quick fetch Effect here similar to before.

    React.useEffect(() => {
        const fetchPending = async () => {
            const { getProviderBookings } = await import('../api/bookings');
            try {
                const res = await getProviderBookings();
                if (res.success) {
                    setBookings(res.bookings);
                }
            } catch (e) { console.error(e); }
        };
        fetchPending();
    }, []);


    if (!user) return null;

    const approvalStatus = providerDetails?.approvalStatus || 'pending';
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    return (
        <div className="space-y-8">
            {/* Introduction / Welcome Card (Optional, or rely on Header) 
                UserLayout has a Navbar. 
                ProviderLayout has a specific user snippet in sidebar.
                Let's emulate the simple cleaner look of the user dashboard or just specific widgets.
            */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-soft-black mb-2">{t('dashboard.welcome')}, {user.username}!</h1>
                <p className="text-gray-500">Here is what's happening with your bookings today.</p>
            </div>

            {/* Application Status Banner if not approved */}
            {approvalStatus !== 'approved' && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${approvalStatus === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                        {approvalStatus === 'rejected'
                            ? t('dashboard.applicationRejected')
                            : t('dashboard.verificationPending')}
                    </span>
                </div>
            )}

            {/* Pending Requests Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                <h3 className="font-semibold text-lg mb-6 text-amber-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {t('dashboard.pendingRequests')}
                </h3>

                {pendingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {pendingBookings.map(booking => (
                            <div key={booking._id} className="border border-amber-100 bg-amber-50 rounded-2xl p-6 transition-all hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div>
                                        <h4 className="font-bold text-soft-black mb-1 text-lg">{booking.service?.title || 'Unknown Service'}</h4>
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('Accept this booking?')) return;
                                                const res = await updateBookingStatus(booking._id, 'accepted');
                                                if (res.success) {
                                                    setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'accepted' } : b));
                                                    // Optionally refresh main lists via context or just locally update
                                                } else {
                                                    alert(res.error);
                                                }
                                            }}
                                            className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:scale-105"
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
                                            className="bg-white text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 border border-red-100 transition-colors"
                                        >
                                            {t('dashboard.reject')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="font-medium text-lg">{t('dashboard.noPendingRequests')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
