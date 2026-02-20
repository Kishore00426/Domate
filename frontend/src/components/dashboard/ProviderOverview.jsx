import React, { useEffect, useState } from 'react';
import {
    Activity,
    PieChart as PieIcon,
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    Briefcase
} from 'lucide-react';
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
    Cell,
    AreaChart,
    Area
} from 'recharts';

const ProviderOverview = ({ bookings = [], providerDetails = {} }) => {
    const { t } = useTranslation();
    const [statusData, setStatusData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [serviceData, setServiceData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRevenue: 0,
        totalJobs: 0,
        completionRate: 0
    });

    const STATUS_COLORS = {
        accepted: '#10b981', // green-500
        arrived: '#3b82f6', // blue-500
        in_progress: '#f59e0b', // amber-500
        work_completed: '#8b5cf6', // violet-500
        completed: '#6b7280', // gray-500
        cancelled: '#ef4444', // red-500
        rejected: '#f43f5e', // rose-500
        pending: '#facc15' // yellow-400
    };

    const COLORS = ['#000000', '#4b5563', '#9ca3af', '#e5e7eb', '#f3f4f6'];

    useEffect(() => {
        processData(bookings);
    }, [bookings, t]);

    const processData = (bookingList) => {
        // 1. Top Stats
        let totalRev = 0;
        let pendingRev = 0;
        let completedCount = 0;
        const acceptedOrActive = ['accepted', 'arrived', 'in_progress', 'work_completed'];

        bookingList.forEach(b => {
            if (b.status === 'completed' && b.invoice) {
                totalRev += b.invoice.totalAmount || 0;
                completedCount++;
            } else if (acceptedOrActive.includes(b.status)) {
                // If no invoice yet, use consulting fee as a placeholder for "pending revenue"
                pendingRev += providerDetails?.consultFee || 0;
            }
        });

        const rate = bookingList.length > 0
            ? Math.round((completedCount / bookingList.length) * 100)
            : 0;

        setStats({
            totalRevenue: totalRev,
            pendingRevenue: pendingRev,
            totalJobs: bookingList.length,
            completionRate: rate
        });

        // 2. Revenue Trend (Last 6 Months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
        }

        const revMap = months.reduce((acc, m) => ({ ...acc, [m]: 0 }), {});
        bookingList.forEach(b => {
            if (b.status === 'completed' && b.invoice) {
                const bMonth = new Date(b.updatedAt).toLocaleString('default', { month: 'short' });
                if (revMap.hasOwnProperty(bMonth)) {
                    revMap[bMonth] += b.invoice.totalAmount || 0;
                }
            }
        });

        setRevenueData(months.map(m => ({ name: m, revenue: revMap[m] })));

        // 3. Status Distribution (Pie Chart)
        const statusCounts = {};
        bookingList.forEach(b => {
            const s = b.status || 'pending';
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        const sData = Object.keys(statusCounts).map(s => ({
            name: t(`dashboard.statusLabel.${s}`, s),
            id: s,
            value: statusCounts[s]
        }));
        setStatusData(sData);

        // 4. Service Performance (Bar Chart)
        const serviceMap = {};
        bookingList.forEach(b => {
            const title = b.service?.title || 'Unknown';
            serviceMap[title] = (serviceMap[title] || 0) + 1;
        });

        const servData = Object.entries(serviceMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setServiceData(servData);

        // 5. Top Customers
        const customerMap = {};
        bookingList.forEach(b => {
            const name = b.user?.username || 'Guest';
            customerMap[name] = (customerMap[name] || 0) + 1;
        });

        const custData = Object.entries(customerMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        setCustomerData(custData);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('dashboard.analytics.totalRevenue'), value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: t('dashboard.analytics.pendingRevenue'), value: `₹${stats.pendingRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: t('dashboard.analytics.totalJobs'), value: stats.totalJobs, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: t('dashboard.analytics.completionRate'), value: `${stats.completionRate}%`, icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-soft-black tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-soft-black text-lg flex items-center gap-2">
                                <Activity className="w-5 h-5 text-gray-400" /> {t('dashboard.analytics.revenueTrend')}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">{t('dashboard.analytics.revenueTrendSub')}</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-soft-black text-lg flex items-center gap-2 mb-8">
                        <PieIcon className="w-5 h-5 text-gray-400" /> {t('dashboard.analytics.jobStatuses')}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.id] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Performance (Bar Chart) */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-soft-black text-lg flex items-center gap-2 mb-8">
                        <Briefcase className="w-5 h-5 text-gray-400" /> {t('dashboard.analytics.serviceUsage')}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={serviceData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                />
                                <Bar dataKey="count" fill="#000000" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-soft-black text-lg flex items-center gap-2 mb-8">
                        <Users className="w-5 h-5 text-gray-400" /> {t('dashboard.analytics.topCustomers')}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderOverview;
