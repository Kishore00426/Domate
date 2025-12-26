import React, { useState } from 'react';
import { Save, Lock, User, Bell, Globe, Shield } from 'lucide-react';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    // Mock state - in real app would come from DB/Auth
    const [formData, setFormData] = useState({
        adminName: 'Admin User',
        email: 'admin@domate.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        siteName: 'DoMate Service Platform',
        maintenanceMode: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-soft-black">Settings</h1>
                <p className="text-gray-500">Manage your account and system preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'profile' ? 'bg-white text-soft-black shadow-sm font-medium' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <User className="w-5 h-5" /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'security' ? 'bg-white text-soft-black shadow-sm font-medium' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <Shield className="w-5 h-5" /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === 'general' ? 'bg-white text-soft-black shadow-sm font-medium' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        <Globe className="w-5 h-5" /> General
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <form onSubmit={handleSubmit}>
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-lg font-bold text-soft-black mb-4">Profile Settings</h2>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-lg font-bold text-soft-black mb-4">Security Settings</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-lg font-bold text-soft-black mb-4">General Configuration</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                            <input
                                                type="text"
                                                name="siteName"
                                                value={formData.siteName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                            <input
                                                type="checkbox"
                                                name="maintenanceMode"
                                                checked={formData.maintenanceMode}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 accent-soft-black"
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-soft-black">Maintenance Mode</h3>
                                                <p className="text-xs text-gray-600">Prevent users from accessing the site temporarily.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-soft-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 shadow-lg flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
