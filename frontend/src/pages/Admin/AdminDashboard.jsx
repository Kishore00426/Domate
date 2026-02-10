import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, CheckSquare, Clock, TrendingUp, Activity, Plus, FileText, DollarSign, Download } from 'lucide-react';
import { getDashboardStats, getUsers, getUserReport } from '../../api/admin';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Report Generation State
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, usersResponse] = await Promise.all([
                    getDashboardStats(),
                    getUsers()
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

                if (usersResponse.success) {
                    // Filter for providers only (users with role 'provider' or providerStatus not 'none')
                    // Assuming role object has name 'provider' or checking providerStatus variable
                    const providerList = usersResponse.users.filter(u =>
                        u.role?.name === 'service_provider' ||
                        u.providerStatus === 'approved' ||
                        u.providerStatus === 'pending'
                    );
                    setProviders(providerList);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleGenerateReport = async () => {
        if (!selectedProvider) return;
        setReportLoading(true);
        try {
            const response = await getUserReport(selectedProvider);
            if (response.success) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error("Failed to generate report", error);
        } finally {
            setReportLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(`Earnings Report: ${reportData.username}`, 14, 22);

        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total Bookings: ${reportData.totalBookings}`, 14, 40);
        doc.text(`Total Earned: ₹${reportData.totalEarned}`, 14, 48);

        const tableColumn = ["ID", "Service", "Date", "Status"];
        const tableRows = [];

        reportData.recentActivity.forEach(booking => {
            const bookingData = [
                booking._id.substring(0, 8) + '...',
                booking.service?.title || 'N/A',
                new Date(booking.createdAt).toLocaleDateString(),
                booking.status
            ];
            tableRows.push(bookingData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 60 });
        doc.save(`report_${reportData.username}_${Date.now()}.pdf`);
    };

    const stats = [
        { label: t('admin.users'), value: dashboardData.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', link: '/admin/users' },
        { label: t('admin.activeProviders'), value: dashboardData.activeProviders, icon: CheckCircle, color: 'bg-green-50 text-green-600', border: 'border-green-100', link: '/admin/users' },
        { label: t('admin.pendingVerifications'), value: dashboardData.pendingVerifications, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', link: '/admin/verification' },
        { label: t('admin.service'), value: dashboardData.totalServices, icon: Activity, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', link: '/admin/services' },
        { label: t('admin.bookings'), value: dashboardData.totalBookings, icon: CheckSquare, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', link: '/admin/bookings' },
    ];

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

            {/* Main Content Area: Reports & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Generator Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Generate Reports</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                            >
                                <option value="">-- Choose a Provider --</option>
                                {providers.map(p => (
                                    <option key={p._id} value={p._id}>{p.username} ({p.email})</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleGenerateReport}
                            disabled={!selectedProvider || reportLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {reportLoading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4" />
                                    Generate Earnings Report
                                </>
                            )}
                        </button>
                    </div>

                    {/* Mini Recent Report Preview */}
                    {reportData && (
                        <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Report Summary</h3>
                            <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                                    <h4 className="text-3xl font-bold text-indigo-700">₹{reportData.totalEarned.toLocaleString()}</h4>
                                    <div className="mt-2 text-xs font-medium text-indigo-500 bg-white inline-block px-2 py-1 rounded-full border border-indigo-100 shadow-sm">
                                        {reportData.totalBookings} Completed Bookings
                                    </div>
                                </div>
                                <button
                                    onClick={downloadPDF}
                                    className="w-full mt-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity / Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Recent Platform Activity</h2>
                        </div>
                        {/* <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button> */}
                    </div>

                    <div className="space-y-4">
                        {/* If we had recent bookings globally we could show them here. For now, showing Report Data Activity if available, else generic system status */}
                        {reportData ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 font-medium ml-1">Recent bookings for {reportData.username}:</p>
                                {reportData.recentActivity.length > 0 ? (
                                    reportData.recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{activity.service?.title || 'Unknown Service'}</p>
                                                    <p className="text-xs text-gray-500">Completed on {new Date(activity.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No recent activity found for this user.</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Select a provider to view specific activity details</p>
                                <p className="text-sm text-gray-400">System overview is active.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
