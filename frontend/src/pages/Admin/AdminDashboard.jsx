import React from 'react';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    // Mock Data for now
    const stats = [
        { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Active Providers', value: '56', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        { label: 'Pending Verifications', value: '12', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Revenue', value: '₹45,200', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-soft-black">Dashboard</h1>
                <p className="text-gray-500">Welcome back, Admin.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-xl font-bold text-soft-black">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-soft-black mb-4">Recent Activity</h2>
                <div className="h-40 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    Chart / Table Placeholder
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
