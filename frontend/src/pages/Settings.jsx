import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, User, Globe, Shield, Smartphone } from 'lucide-react';
import HomeLayout from '../layouts/HomeLayout';

const Settings = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Account",
            items: [
                { icon: User, label: "Personal Information", desc: "Update your profile details" },
                { icon: Globe, label: "Language", desc: "English (US)" },
            ]
        },
        {
            title: "Preferences",
            items: [
                { icon: Bell, label: "Notifications", desc: "Manage emails and push notifications" },
                { icon: Smartphone, label: "Device Permissions", desc: "Manage app permissions" },
            ]
        },
        {
            title: "Security",
            items: [
                { icon: Lock, label: "Password & Security", desc: "Change password, 2FA" },
                { icon: Shield, label: "Privacy", desc: "Manage data sharing" },
            ]
        }
    ];

    return (
        <HomeLayout>
            <div className="pt-24 px-4 pb-20 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/account')}
                    className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-soft-black">Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your account preferences and security</p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {sections.map((section, index) => (
                            <div key={index} className="p-6">
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{section.title}</h2>
                                <div className="space-y-4">
                                    {section.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg text-gray-600 group-hover:text-black transition-colors">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-soft-black">{item.label}</h3>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button className="text-red-500 font-medium hover:text-red-600 transition-colors text-sm">
                        Delete Account
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Version 1.0.0</p>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Settings;
