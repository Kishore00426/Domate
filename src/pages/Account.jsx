import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import { User, MapPin, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Account = () => {
    // Mock user data
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        location: "New York, USA",
        memberSince: "December 2024"
    };

    return (
        <HomeLayout>
            <div className="pt-10 px-4 pb-20">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-soft-black mb-8">My Account</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-3xl shadow-lg p-6 text-center sticky top-24">
                                <div className="w-24 h-24 bg-beige rounded-full flex items-center justify-center text-soft-black mx-auto mb-4">
                                    <User className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-soft-black">{user.name}</h2>
                                <p className="text-gray-500 text-sm mb-6">{user.location}</p>

                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        Member since {user.memberSince}
                                    </div>
                                </div>

                                <button className="w-full mt-8 bg-gray-100 text-soft-black py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Stats/Quick Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                    <h3 className="text-2xl font-bold text-soft-black mb-1">0</h3>
                                    <p className="text-gray-500 text-sm">Active Bookings</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                                    <h3 className="text-2xl font-bold text-soft-black mb-1">0</h3>
                                    <p className="text-gray-500 text-sm">Completed Services</p>
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-soft-black">My Bookings</h3>
                                            <p className="text-xs text-gray-500">View past and upcoming services</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>

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

                                <div className="p-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-soft-black">Privacy & Security</h3>
                                            <p className="text-xs text-gray-500">Change password and settings</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Account;
