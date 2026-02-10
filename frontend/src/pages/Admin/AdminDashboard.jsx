import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, CheckSquare, Clock, TrendingUp, Activity, Plus } from 'lucide-react';
import { getDashboardStats } from '../../api/admin';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalUsers: '...',
        activeProviders: '...',
        pendingVerifications: '...',
        totalServices: '...',
        totalBookings: '...'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                if (response.success) {
                    const data = response.data;
                    setDashboardData({
                        totalUsers: data.totalUsers || 0,
                        activeProviders: data.activeProviders || 0,
                        pendingVerifications: data.pendingVerifications || 0,
                        totalServices: data.totalServices || 0,
                        totalBookings: data.totalBookings || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: t('admin.users'), value: dashboardData.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600', link: '/admin/users' },
        { label: t('admin.activeProviders'), value: dashboardData.activeProviders, icon: CheckSquare, color: 'bg-green-100 text-green-600', link: '/admin/users' },
        { label: t('admin.pendingVerifications'), value: dashboardData.pendingVerifications, icon: Clock, color: 'bg-yellow-100 text-yellow-600', link: '/admin/verification' },
        { label: t('admin.service'), value: dashboardData.totalServices, icon: Activity, color: 'bg-indigo-100 text-indigo-600', link: '/admin/services' },
        { label: t('admin.bookings'), value: dashboardData.totalBookings, icon: Plus, color: 'bg-purple-100 text-purple-600', link: '/admin/bookings' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">{t('admin.dashboardOverview')}</h1>
                    <p className="text-gray-500">{t('admin.welcomeMessage')}</p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const CardContent = (
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-105 h-full ${stat.link ? 'cursor-pointer' : ''}`}>
                            <div className={`p-4 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-soft-black mt-1">
                                    {loading ? <span className="animate-pulse bg-gray-200 h-8 w-16 block rounded"></span> : stat.value}
                                </h3>
                            </div>
                        </div>
                    );

                    return stat.link ? (
                        <Link to={stat.link} key={index} className="block h-full">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={index} className="h-full">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section - Placeholder for now until we have activity logs */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-soft-black" />
                    <h2 className="text-lg font-bold text-soft-black">{t('admin.recentActivity')}</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-700">{t('admin.systemInit')}</p>
                        </div>
                        <span className="text-xs text-gray-400">{t('admin.justNow')}</span>
                    </div>
                    {/* Add more items based on real logs later */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
