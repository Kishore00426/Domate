import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import { User, MapPin, Mail, Phone, Calendar, Shield } from 'lucide-react';

import { getMe, updateProfile } from '../api/auth';

const Account = () => {
    // User state
    const [user, setUser] = React.useState({
        name: "", // Will be populated from DB
        email: "",
        phone: "+91 98765 43210", // Placeholder (not in DB)
        location: "New York, USA", // Placeholder (not in DB)
        addressTag: "Home", // Placeholder
        memberSince: "December 2024" // Placeholder
    });

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getMe();
                setUser(prev => ({
                    ...prev,
                    name: userData.user.username,
                    email: userData.user.email,
                    location: userData.user.address?.city || "Unknown Location",
                    // Keep placeholders for other fields
                }));
            } catch (err) {
                console.error("Failed to fetch user profile", err);
            }
        };
        fetchUser();
    }, []);

    // Edit mode states
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempData, setTempData] = React.useState(user);

    const addressTags = ["Home", "Work", "Other"];

    const handleEdit = () => {
        setTempData({ ...user });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempData(user); // Reset to current user data
    };

    const handleSave = async () => {
        try {
            // Map frontend fields to backend schema
            const payload = {
                username: tempData.name,
                email: tempData.email,
                // Simple mapping for location -> city for now
                city: tempData.location,
            };

            const response = await updateProfile(payload);
            setUser({ ...tempData }); // Optimistic update or use response data
            setIsEditing(false);
            console.log("Profile updated", response);
        } catch (err) {
            console.error("Failed to update profile", err);
            // Optionally show error to user
            alert("Failed to update profile: " + (err.response?.data?.error || err.message));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({
            ...prev,
            [name]: value
        }));
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

                                {isEditing ? (
                                    <div className="space-y-3 mb-6">
                                        <input
                                            type="text"
                                            name="name"
                                            value={tempData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                            placeholder="Full Name"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="location"
                                                value={tempData.location}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                                placeholder="Location"
                                            />
                                            <select
                                                name="addressTag"
                                                value={tempData.addressTag}
                                                onChange={handleChange}
                                                className="px-2 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm bg-white"
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
                                                className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
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
                                                className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
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
