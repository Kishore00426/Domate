import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, User, Globe, Shield, Smartphone, Settings as SettingsIcon } from 'lucide-react';


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
        <div className="min-h-full pb-20">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => navigate('/account')}
                            className="p-3 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-gray-50 text-gray-600 rounded-2xl">
                            <SettingsIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-soft-black">Settings</h1>
                            <p className="text-gray-500">Manage your account preferences and security</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

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
            </div>
        </div>
    );
};

export default Settings;
