import React, { useState } from 'react';
import { User, AlertCircle, Upload, Briefcase } from 'lucide-react';

const ProviderDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, profile, services, documents
    const isProfileComplete = false; // Check against providerDetails

    return (
        <div className="bg-grey-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:mt-18">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-soft-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-soft-black">Welcome, {user?.username}!</h1>
                            <p className="text-gray-500">Service Provider Dashboard</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {!isProfileComplete && (
                            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                                <AlertCircle className="w-5 h-5" /> Profile Incomplete
                            </div>
                        )}
                        <button className="bg-soft-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                            View Public Profile
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <nav className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'overview' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                >
                                    <User className="w-5 h-5" /> Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'profile' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                >
                                    <Briefcase className="w-5 h-5" /> Professional Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'documents' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                >
                                    <Upload className="w-5 h-5" /> Documents & Verification
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {!isProfileComplete && (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 text-center">
                                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-xl font-bold text-soft-black mb-2">Complete Your Registration</h2>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                            You need to complete your professional profile and upload verification documents to start receiving bookings.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
                                        >
                                            Complete Profile Now
                                        </button>
                                    </div>
                                )}

                                {/* Stats placeholders */}
                                {isProfileComplete && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                                            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Bookings</h3>
                                            <p className="text-3xl font-bold text-soft-black">0</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                                            <h3 className="text-gray-500 text-sm font-medium mb-1">Earnings</h3>
                                            <p className="text-3xl font-bold text-soft-black">₹0</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                                            <h3 className="text-gray-500 text-sm font-medium mb-1">Rating</h3>
                                            <p className="text-3xl font-bold text-soft-black">-</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm">
                                <h2 className="text-xl font-bold text-soft-black mb-6">Professional Details</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-soft-black mb-2">Service Category</label>
                                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none bg-white">
                                                <option>Cleaning</option>
                                                <option>Plumbing</option>
                                                <option>Electrical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-soft-black mb-2">Experience (Years)</label>
                                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none" placeholder="e.g. 5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-soft-black mb-2">Work Location (City)</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none bg-white">
                                            <option>Chennai</option>
                                            <option>Bangalore</option>
                                            <option>Mumbai</option>
                                        </select>
                                    </div>
                                    <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                        Save Details
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm">
                                <h2 className="text-xl font-bold text-soft-black mb-6">Verification Documents</h2>
                                <div className="space-y-6">
                                    <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <h3 className="font-semibold text-soft-black">Upload ID Proof</h3>
                                        <p className="text-xs text-gray-500 mt-1">Aadhaar, PAN, or Driving License</p>
                                    </div>
                                    <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <h3 className="font-semibold text-soft-black">Upload Address Proof</h3>
                                        <p className="text-xs text-gray-500 mt-1">Utility Bill, Rental Agreement</p>
                                    </div>
                                    <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors w-full">
                                        Submit for Verification
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
