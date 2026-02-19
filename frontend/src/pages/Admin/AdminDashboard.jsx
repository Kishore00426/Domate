import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, CheckSquare, Clock, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDashboardStats, getReportAnalytics } from '../../api/admin';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [dashboardData, setDashboardData] = useState({
        totalUsers: '...',
        activeProviders: '...',
        pendingVerifications: '...',
        totalServices: '...',
        totalBookings: '...'
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date()); // Fix for ReferenceError

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsResponse, analyticsResponse] = await Promise.all([
                    getDashboardStats(),
                    getReportAnalytics({ type: 'total' }) // Default fetch for overview
                ]);

                if (statsResponse.success) {
                    const data = statsResponse.data;
                    setDashboardData({
                        totalUsers: data.totalUsers || 0,
                        activeProviders: data.activeProviders || 0,
                        pendingVerifications: data.pendingVerifications || 0,
                        totalServices: data.totalServices || 0,
                        totalBookings: data.totalBookings || 0
                    });
                }

                if (analyticsResponse.success && analyticsResponse.data.bookings) {
                    // Process data for charts
                    // 1. Weekly User Activity (Bar Chart)
                    const bookings = analyticsResponse.data.bookings;

                    // Filter for the selected week based on currentDate
                    const dateRange = getDateRange(currentDate);

                    const weeklyBookings = bookings.filter(b => {
                        const bookingDate = new Date(b.date);
                        return bookingDate >= dateRange.startObj && bookingDate <= dateRange.endObj;
                    });

                    // Group by User
                    const userMap = {};

                    weeklyBookings.forEach(b => {
                        const userName = b.userName || 'Unknown';
                        if (!userMap[userName]) {
                            userMap[userName] = {
                                name: userName,
                                services: 0,
                                providers: new Set()
                            };
                        }
                        userMap[userName].services += 1;
                        if (b.providerName) {
                            userMap[userName].providers.add(b.providerName);
                        }
                    });

                    // Transform to array
                    const barData = Object.values(userMap).map(u => ({
                        name: u.name,
                        services: u.services,
                        providers: u.providers.size
                    }));

                    setChartData(barData);

                    // 2. Service Distribution (Pie Chart) - Simplified logic
                    const serviceCounts = {};
                    // Use bookings from the current window or all? 
                    // Requirement implies viewing history, so pie chart should probably look at the same window
                    // Or keep it global? Let's keep filters consistent.
                    weeklyBookings.forEach(b => {
                        const service = b.serviceName || 'Unknown';
                        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
                    });

                    const pData = Object.keys(serviceCounts).map(key => ({
                        name: key,
                        value: serviceCounts[key]
                    })).slice(0, 5); // Top 5
                    setPieData(pData);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentDate]);

    // Helper functions for date navigation
    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    const getDateRange = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const start = new Date(d);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return { start, end, startObj: start, endObj: end };
    };

    const stats = [
        { label: t('admin.users'), value: dashboardData.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', link: '/admin/users' },
        { label: t('admin.activeProviders'), value: dashboardData.activeProviders, icon: CheckCircle, color: 'bg-green-50 text-green-600', border: 'border-green-100', link: '/admin/users' },
        { label: t('admin.pendingVerifications'), value: dashboardData.pendingVerifications, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', link: '/admin/verification' },
        { label: t('admin.service'), value: dashboardData.totalServices, icon: Activity, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', link: '/admin/services' },
        { label: t('admin.bookings'), value: dashboardData.totalBookings, icon: CheckSquare, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', link: '/admin/bookings' },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('admin.dashboardOverview')}</h1>
                    <p className="text-gray-500 mt-1">{t('admin.welcomeMessage')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat, index) => {
                    const CardContent = (
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between group`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.color} transition-colors duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-gray-100 transition-colors">
                                    Total
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                    {loading ? <span className="animate-pulse bg-gray-200 h-8 w-16 block rounded"></span> : stat.value}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            </div>
                        </div>
                    );

                    return stat.link ? (
                        <Link to={stat.link} key={index} className="block h-full transform transition-transform hover:-translate-y-1">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={index} className="h-full">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly User Activity Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Weekly User Activity</h2>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                            <button
                                onClick={() => navigateWeek(-1)}
                                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                                title="Previous Week"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-semibold text-gray-500 px-2 min-w-[120px] text-center">
                                {getDateRange(currentDate).startObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {' - '}
                                {getDateRange(currentDate).endObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <button
                                onClick={() => navigateWeek(1)}
                                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={new Date(getDateRange(currentDate).end) >= new Date().setHours(0, 0, 0, 0)}
                                title="Next Week"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="services" fill="#8884d8" radius={[4, 4, 0, 0]} name="Services Booked" />
                                <Bar dataKey="providers" fill="#82ca9d" radius={[4, 4, 0, 0]} name="Providers Engaged" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Top Services</h2>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                No service data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
