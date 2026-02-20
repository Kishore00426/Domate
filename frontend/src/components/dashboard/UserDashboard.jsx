import React, { useEffect, useState } from 'react';
import { User, Activity, PieChart as PieIcon, CreditCard, CheckCircle, XCircle, Package } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { getUserBookings } from '../../api/bookings';
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
    Cell,
    AreaChart,
    Area
} from 'recharts';

const UserDashboard = ({ user }) => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [spendingData, setSpendingData] = useState([]);
    const [serviceData, setServiceData] = useState([]);
    const [providerList, setProviderList] = useState([]);
    const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0, spent: 0 });




    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await getUserBookings();
                if (response.success) {
                    setBookings(response.bookings);
                    processChartData(response.bookings);
                }
            } catch (error) {
                console.error("Failed to fetch bookings for dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const processChartData = (bookingList) => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
        }

        // 1. Process Status Data (Pie Chart)
        const statusCounts = {
            'accepted': 0,
            'rejected': 0,
            'pending': 0,
            'cancelled': 0
        };
        bookingList.forEach(b => {
            const status = b.status?.toLowerCase() || 'pending';
            // Explicitly exclude 'completed' from the pie chart as per user request
            if (status !== 'completed' && statusCounts.hasOwnProperty(status)) {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            } else if (status !== 'completed') {
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            }
        });

        // Only include statuses with positive counts
        const sData = Object.keys(statusCounts)
            .filter(status => status !== 'completed' && statusCounts[status] > 0)
            .map(status => ({
                id: status,
                name: t(`userBookings.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')),
                value: statusCounts[status]
            }));
        setStatusData(sData);




        // Update top stats
        let totalSpent = 0;
        bookingList.forEach(b => {
            if (b.status === 'completed' || (b.invoice && b.invoice.totalAmount)) {
                totalSpent += b.invoice?.totalAmount || 0;
            }
        });

        setStats({
            total: bookingList.length,
            accepted: statusCounts['accepted'] || 0,
            rejected: statusCounts['rejected'] || 0,
            spent: totalSpent
        });


        // 2. Process Activity and Spending Data (Bar and Area Chart)
        const activityCounts = months.reduce((acc, month) => {
            acc[month] = { bookings: 0, spending: 0 };
            return acc;
        }, {});

        bookingList.forEach(b => {
            const bookingDate = new Date(b.date || b.createdAt);
            const month = bookingDate.toLocaleString('default', { month: 'short' });
            if (activityCounts.hasOwnProperty(month)) {
                activityCounts[month].bookings++;
                const amount = b.invoice?.totalAmount || 0;
                activityCounts[month].spending += amount;
            }
        });

        const aData = months.map(month => ({
            month,
            bookings: activityCounts[month].bookings
        }));
        setActivityData(aData);

        const spendData = months.map(month => ({
            month,
            amount: activityCounts[month].spending
        }));
        setSpendingData(spendData);

        // 3. Merged Service & Provider Data (Stacked Horizontal)
        const serviceMap = {};
        const allProviders = new Set();

        bookingList.forEach(b => {
            const serviceName = b.serviceName || b.service?.title || 'Other';
            const providerName = b.serviceProvider?.username || 'Unknown Provider';
            allProviders.add(providerName);

            if (!serviceMap[serviceName]) {
                serviceMap[serviceName] = { name: serviceName, total: 0 };
            }
            serviceMap[serviceName][providerName] = (serviceMap[serviceName][providerName] || 0) + 1;
            serviceMap[serviceName].total++;
        });

        const mergedData = Object.values(serviceMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        setServiceData(mergedData);
        setProviderList(Array.from(allProviders));
    };





    const STATUS_COLORS = {
        'accepted': '#10b981', // Green
        'rejected': '#ef4444', // Red
        'pending': '#3b82f6',  // Blue
        'completed': '#8b5cf6', // Purple
        'cancelled': '#6b7280', // Gray
        'in_progress': '#f59e0b', // Amber
        'arrived': '#06b6d4',  // Cyan
        'work_completed': '#ec4899', // Pink
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-600 mt-4">
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}: {entry.payload.value}</span>
                    </li>
                ))}
            </ul>
        );
    };



    return (
        <div className="min-h-full space-y-6 pt-0 px-4 pb-12 overflow-x-hidden">
            {/* User Profile Header */}
            <div className="text-center space-y-4 animate-fade-in-up max-w-4xl mx-auto">
                <div className="mx-auto w-20 h-20 bg-white border border-gray-100 rounded-full flex items-center justify-center text-soft-black text-3xl font-bold shadow-sm ring-8 ring-gray-50/50">
                    {user.name && user.name.toLowerCase() !== 'guest' ? (
                        user.name.charAt(0).toUpperCase()
                    ) : (
                        <User className="w-8 h-8" />
                    )}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-soft-black tracking-tight">
                        {t('account.hi')}, {user.name?.split(' ')[0]}
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base font-medium">
                        {t('account.welcomeBack')}
                    </p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto px-2">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard.totalBookings')}</p>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard.accepted')}</p>
                        <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard.rejected')}</p>
                        <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard.totalSpent')}</p>
                        <p className="text-xl font-bold text-gray-900">₹{stats.spent.toFixed(0)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">

                {/* Merged Service & Provider Insights Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.providerBreakdown', 'Service & Provider Insights')}</h2>
                    </div>
                    <div className="h-[400px] w-full">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-gray-50 rounded-lg" />
                        ) : serviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceData} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }}
                                        width={150}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                        cursor={{ fill: '#f9fafb' }}
                                    />
                                    <Legend iconType="circle" />
                                    {providerList.map((provider, index) => (
                                        <Bar
                                            key={provider}
                                            dataKey={provider}
                                            stackId="serviceStack"
                                            fill={COLORS[index % COLORS.length]}
                                            radius={index === providerList.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
                                            barSize={24}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>


                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                                <Activity className="w-12 h-12 mb-2 opacity-20" />
                                <p>No service insights available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Spending Trend Area Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Spending Trend</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-gray-50 rounded-lg" />
                        ) : spendingData.some(d => d.amount > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorSpend)" name="Amount Spent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                                <CreditCard className="w-12 h-12 mb-2 opacity-20" />
                                <p>No spending data found</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* Existing Activity Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.bookingActivity')}</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-gray-50 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">Loading charts...</span>
                            </div>
                        ) : activityData.some(d => d.bookings > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                        cursor={{ fill: '#f9fafb' }}
                                    />
                                    <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} name={t('dashboard.bookings')} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                                <Activity className="w-12 h-12 mb-2 opacity-20" />
                                <p>No booking activity found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Existing Status Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <PieIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.statusOverview')}</h2>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-gray-50 rounded-lg" />
                        ) : statusData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={STATUS_COLORS[entry.id] || COLORS[index % COLORS.length]}
                                            />
                                        ))}

                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                        formatter={(value, name) => [value, name]}
                                    />
                                    <Legend verticalAlign="bottom" content={renderLegend} />
                                </PieChart>

                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                                <PieIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">{t('userBookings.noActiveBookings', 'No active or historical status data to display.')}</p>
                                <p className="text-xs opacity-60 mt-1">{t('userBookings.checkHistoryBelow', 'All bookings may be completed or cancelled.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
