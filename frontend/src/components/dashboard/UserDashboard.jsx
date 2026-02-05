import React from 'react';
import { User, MapPin, Mail, Phone, Calendar, CreditCard, Settings, HelpCircle, FileText, ChevronRight, LogOut, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ user, bookings = [], isEditing, tempData, handleEdit, handleCancel, handleSave, handleChange, addressTags }) => {
    const navigate = useNavigate();

    const activeBookingsCount = bookings.filter(b =>
        ['pending', 'accepted'].includes(b.status)
    ).length;

    const completedBookingsCount = bookings.filter(b => b.status === 'work_completed').length;

    return (
        <div className="min-h-screen bg-[#F5F1EB] pt-24 pb-20 px-4 md:px-8 hover:cursor-default">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Welcome back, <span className="text-[#1C1C1C] font-semibold">{user.name?.split(' ')[0]}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Profile (Takes 4 cols on desktop) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100/50 h-full flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent -z-10" />

                            <div className="w-28 h-28 bg-[#F5F1EB] rounded-full flex items-center justify-center text-[#1C1C1C] mb-6 text-4xl font-bold shadow-inner ring-4 ring-white">
                                {user.name && user.name.toLowerCase() !== 'guest' ? (
                                    user.name.charAt(0).toUpperCase()
                                ) : (
                                    <User className="w-12 h-12" />
                                )}
                            </div>

                            {isEditing ? (
                                <div className="w-full space-y-4 animate-fade-in">
                                    <div className="space-y-1 text-left">
                                        <label className="text-xs font-medium text-gray-500 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={tempData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 text-[#1C1C1C] font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-xs font-medium text-gray-500 ml-1">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={tempData.location}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 text-[#1C1C1C] font-medium"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-xs font-medium text-gray-500 ml-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={tempData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 text-[#1C1C1C] font-medium"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 py-3 rounded-2xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 py-3 rounded-2xl font-semibold text-white bg-[#1C1C1C] hover:bg-black transition-all shadow-lg shadow-black/20"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-[#1C1C1C] mb-1">{user.name}</h2>
                                    <p className="text-gray-500 mb-8 flex items-center gap-1.5 text-sm">
                                        <MapPin className="w-3.5 h-3.5" /> {user.location}
                                    </p>

                                    <div className="w-full space-y-4 mb-8">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#F5F1EB] transition-colors group/item">
                                            <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                                                <p className="text-sm font-semibold text-[#1C1C1C] truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#F5F1EB] transition-colors group/item">
                                            <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone</p>
                                                <p className="text-sm font-semibold text-[#1C1C1C]">{user.phone || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#F5F1EB] transition-colors group/item">
                                            <div className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Member Since</p>
                                                <p className="text-sm font-semibold text-[#1C1C1C]">{user.memberSince}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleEdit}
                                        className="mt-auto w-full py-3.5 rounded-2xl font-semibold border-2 border-gray-100 text-[#1C1C1C] hover:border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all duration-300"
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Content (Takes 8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            <div
                                onClick={() => navigate('/user/bookings')}
                                className="bg-[#1C1C1C] text-white p-6 rounded-[2rem] shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform cursor-pointer flex flex-col justify-between h-40 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors" />
                                <div className="relative z-10 p-2 bg-white/10 w-fit rounded-xl backdrop-blur-md">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-4xl font-bold tracking-tight">{activeBookingsCount}</span>
                                    <p className="text-gray-300 text-sm font-medium mt-1">Active Bookings</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 hover:-translate-y-1 transition-transform cursor-pointer flex flex-col justify-between h-40 group" onClick={() => navigate('/user/bookings')}>
                                <div className="p-2 bg-[#F5F1EB] w-fit rounded-xl text-[#1C1C1C] group-hover:bg-[#1C1C1C] group-hover:text-white transition-colors duration-300">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-4xl font-bold text-[#1C1C1C] tracking-tight">{completedBookingsCount}</span>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Completed Jobs</p>
                                </div>
                            </div>

                            <div
                                onClick={() => navigate('/user/plans')}
                                className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 hover:-translate-y-1 transition-transform cursor-pointer flex flex-col justify-between h-40 col-span-2 md:col-span-1 group"
                            >
                                <div className="p-2 bg-[#F5F1EB] w-fit rounded-xl text-[#1C1C1C] group-hover:bg-[#1C1C1C] group-hover:text-white transition-colors duration-300">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-[#1C1C1C] flex items-center gap-2">
                                        View Plans <ChevronRight className="w-4 h-4 opacity-50" />
                                    </span>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Manage subscriptions</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Grid */}
                        <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-100/50">
                            <div className="grid md:grid-cols-2 gap-2">
                                <div
                                    onClick={() => navigate('/user/bookings')}
                                    className="p-6 rounded-[2rem] hover:bg-[#F5F1EB] transition-colors cursor-pointer group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1C1C1C]">All Bookings</h3>
                                            <p className="text-sm text-gray-500">History & Status</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1C1C1C]" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => navigate('/user/addresses')}
                                    className="p-6 rounded-[2rem] hover:bg-[#F5F1EB] transition-colors cursor-pointer group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1C1C1C]">Saved Addresses</h3>
                                            <p className="text-sm text-gray-500">Manage locations</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1C1C1C]" />
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2rem] hover:bg-[#F5F1EB] transition-colors cursor-pointer group flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1C1C1C]">Payments</h3>
                                            <p className="text-sm text-gray-500">Cards & Wallets</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1C1C1C]" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => navigate('/user/settings')}
                                    className="p-6 rounded-[2rem] hover:bg-[#F5F1EB] transition-colors cursor-pointer group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Settings className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1C1C1C]">Settings</h3>
                                            <p className="text-sm text-gray-500">Preferences & Security</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1C1C1C]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Banner */}
                        <div className="bg-[#1C1C1C] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Need help?</h3>
                                    <p className="text-gray-400 max-w-sm">Our support team is available 24/7 to assist you with any issues.</p>
                                </div>
                                <button className="px-6 py-3 bg-white text-[#1C1C1C] rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                    Contact Support
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
