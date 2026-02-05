import React from 'react';
import { User } from 'lucide-react';

const UserDashboard = ({ user }) => {
    return (
        <div className="min-h-full flex flex-col items-center justify-center pt-20 px-4">
            <div className="text-center space-y-6 animate-fade-in-up max-w-2xl mx-auto">
                {/* User Avatar */}
                <div className="mx-auto w-28 h-28 bg-white border border-gray-100 rounded-full flex items-center justify-center text-soft-black text-5xl font-bold mb-6 shadow-sm ring-8 ring-gray-50/50">
                    {user.name && user.name.toLowerCase() !== 'guest' ? (
                        user.name.charAt(0).toUpperCase()
                    ) : (
                        <User className="w-12 h-12" />
                    )}
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-soft-black tracking-tight">
                        Hello, {user.name?.split(' ')[0]}
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl font-medium">
                        Welcome to your dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
