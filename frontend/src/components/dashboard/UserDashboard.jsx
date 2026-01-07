import React, { useState } from 'react';
import { User, MapPin, Mail, Phone, Calendar, CreditCard, Settings, HelpCircle, Info, Clock, CheckCircle, XCircle } from 'lucide-react';

const UserDashboard = ({ user, bookings = [], isEditing, tempData, handleEdit, handleCancel, handleSave, handleChange, addressTags }) => {

    // UI State for sections
    const [activeSection, setActiveSection] = useState(null);

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="pt-10 px-4 pb-20">
            <div className="max-w-6xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:my-20">
                    {/* Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg p-6 text-center sticky top-24">
                            <div className="w-24 h-24 bg-beige rounded-full flex items-center justify-center text-soft-black mx-auto mb-4 text-3xl font-bold">
                                {user.name && user.name.toLowerCase() !== 'guest' ? (
                                    user.name.charAt(0).toUpperCase()
                                ) : (
                                    <User className="w-10 h-10" />
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 mb-6">
                                    <input
                                        type="text"
                                        name="name"
                                        value={tempData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-soft-black"
                                        placeholder="Full Name"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="location"
                                            value={tempData.location}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-soft-black"
                                            placeholder="Location"
                                        />
                                        <select
                                            name="addressTag"
                                            value={tempData.addressTag}
                                            onChange={handleChange}
                                            className="px-2 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm bg-white text-soft-black"
                                        >
                                            {addressTags.map(tag => (
                                                <option key={tag} value={tag}>{tag}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-soft-black">{user.name}</h2>
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        <p className="text-gray-500 text-sm">{user.location}</p>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                            {user.addressTag}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={tempData.email}
                                            onChange={handleChange}
                                            className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-soft-black"
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={tempData.phone}
                                            onChange={handleChange}
                                            className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-soft-black"
                                        />
                                    ) : (
                                        user.phone
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    Member since {user.memberSince}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-100 text-soft-black py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-black text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="w-full mt-8 bg-gray-100 text-soft-black py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Stats/Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                <h3 className="text-2xl font-bold text-soft-black mb-1">{bookings.length}</h3>
                                <p className="text-gray-500 text-sm">Active Bookings</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center gap-2">
                                <Settings className="w-6 h-6 text-soft-black" />
                                <p className="text-gray-500 text-sm font-medium">Settings</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center gap-2">
                                <HelpCircle className="w-6 h-6 text-soft-black" />
                                <p className="text-gray-500 text-sm font-medium">Help & Support</p>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                            {/* My Bookings Section */}
                            <div
                                onClick={() => toggleSection('bookings')}
                                className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-soft-black">My Bookings</h3>
                                        <p className="text-xs text-gray-500">View past and upcoming services</p>
                                    </div>
                                </div>
                                <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${activeSection === 'bookings' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {/* Collapsible Content for Bookings */}
                            {activeSection === 'bookings' && (
                                <div className="bg-gray-50/50 p-6 animate-in slide-in-from-top-4 duration-200">
                                    {bookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {bookings.map(booking => (
                                                <div key={booking._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-soft-black text-lg">{booking.service?.title || "Service"}</h4>
                                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                            <User className="w-3 h-3" />
                                                            Provider: {booking.serviceProvider?.username || "Unknown"}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(booking.scheduledDate).toLocaleDateString()} at {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        {booking.notes && (
                                                            <p className="text-xs text-gray-400 mt-2 italic">"{booking.notes}"</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                        {/* Actions placeholder */}
                                                        {booking.status === 'accepted' && (
                                                            <button className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                                                                Contact
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            No bookings found. Book a service to get started!
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-soft-black">Saved Addresses</h3>
                                        <p className="text-xs text-gray-500">Manage your service locations</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>

                            <div className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-soft-black">Payment Methods</h3>
                                        <p className="text-xs text-gray-500">Manage saved cards and wallets</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>

                            {/* Settings Section */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-soft-black">Settings</h3>
                                        <p className="text-xs text-gray-500">Notifications, Password, & Account</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>

                            <div className="p-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-soft-black">About Us</h3>
                                        <p className="text-xs text-gray-500">Learn more about Domate</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
