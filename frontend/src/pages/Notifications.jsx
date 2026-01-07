import React, { useState } from 'react';
import { Bell, Calendar, CheckCircle, Info, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Notifications = () => {
    // Mock user data - in a real app this would come from context/store
    const user = JSON.parse(localStorage.getItem('user'));

    // Mock notifications data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: 'Your booking for Home Cleaning on Jan 12, 2026 has been confirmed.',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'promo',
            title: 'Special Offer',
            message: 'Get 20% off on your next plumbing service! Use code PLUMB20.',
            time: '1 day ago',
            read: true
        },
        {
            id: 3,
            type: 'system',
            title: 'Account Update',
            message: 'Your password was successfully changed.',
            time: '3 days ago',
            read: true
        }
    ]);

    const getIcon = (type) => {
        switch (type) {
            case 'booking_confirmed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'promo':
                return <TagIcon className="w-5 h-5 text-purple-500" />;
            case 'alert':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const TagIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
    );

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar user={user} variant="dashboard" />

            <main className="flex-grow pt-28 pb-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-500 mt-1">Stay updated with your activities</p>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-soft-black font-medium hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 flex gap-4 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className={`text-base font-semibold ${!notification.read ? 'text-black' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="self-center">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                                <p className="text-gray-500 mt-1">We'll notify you when something important happens.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Notifications;
