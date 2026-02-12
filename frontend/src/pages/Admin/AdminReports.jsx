import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, TrendingUp, Download, CheckCircle, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getUsers, getServices, getReportAnalytics } from '../../api/admin';

const AdminReports = () => {
    const { t } = useTranslation();

    // Report Generation State
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [reportType, setReportType] = useState('total'); // 'total', 'provider', 'service_commission'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTarget, setSelectedTarget] = useState(''); // provider ID or service ID
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [usersResponse, servicesResponse] = await Promise.all([
                    getUsers(),
                    getServices()
                ]);

                if (usersResponse.success) {
                    const providerList = usersResponse.users.filter(u =>
                        u.role?.name === 'service_provider' ||
                        u.providerStatus === 'approved' ||
                        u.providerStatus === 'pending'
                    );
                    setProviders(providerList);
                }

                if (servicesResponse.success) {
                    setServices(servicesResponse.services);
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data", error);
            }
        };

        fetchDropdownData();
    }, []);

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setReportData(null);
        try {
            const params = {
                type: reportType,
                startDate,
                endDate,
                targetId: selectedTarget
            };

            const response = await getReportAnalytics(params);
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
        doc.text(reportData.title || "Analytics Report", 14, 22);

        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        if (startDate && endDate) {
            doc.text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 14, 35);
        } else {
            doc.text(`Period: All Time`, 14, 35);
        }

        // Summary Section
        let yPos = 45;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Summary", 14, yPos);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        yPos += 7;

        if (reportData.totalBookings !== undefined) {
            doc.text(`Total Bookings: ${reportData.totalBookings}`, 14, yPos);
            yPos += 5;
        }
        if (reportData.totalRevenue !== undefined) {
            doc.text(`Total Revenue: ${reportData.totalRevenue}`, 14, yPos);
            yPos += 5;
        }
        if (reportData.totalCommission !== undefined) {
            doc.text(`Total Commission: ${reportData.totalCommission}`, 14, yPos);
            yPos += 5;
        }
        if (reportData.totalEarned !== undefined) {
            doc.text(`Provider Earnings: ${reportData.totalEarned}`, 14, yPos);
            yPos += 5;
        }

        // Table
        const tableColumn = ["ID", "Service", "Date", "Amount", "Comm."];
        const tableRows = [];

        if (reportData.bookings) {
            reportData.bookings.forEach(booking => {
                const bookingData = [
                    booking.id.substring(0, 8),
                    booking.serviceName || 'N/A',
                    new Date(booking.date).toLocaleDateString(),
                    booking.amount || 0,
                    booking.commission || 0
                ];
                tableRows.push(bookingData);
            });
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 5,
        });

        doc.save(`report_${reportType}_${Date.now()}.pdf`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1">Generate comprehensive reports for system performance</p>
                </div>
            </div>

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
                        {/* Report Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={reportType}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setSelectedTarget(''); // Reset target when type changes
                                }}
                            >
                                <option value="total">Total System Report</option>
                                <option value="provider">Provider Performance</option>
                                <option value="service_commission">Service Commission</option>
                            </select>
                        </div>

                        {/* Date Range Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Conditional Selectors */}
                        {reportType === 'provider' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                                <select
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                >
                                    <option value="">-- All Providers (if supported) --</option>
                                    {providers.map(p => (
                                        <option key={p._id} value={p._id}>{p.username}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {reportType === 'service_commission' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                                <select
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                >
                                    <option value="">-- All Services --</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s._id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {reportLoading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>

                    {/* Mini Recent Report Preview */}
                    {reportData && (
                        <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Report Summary</h3>
                            <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                                <div className="text-center space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Total Bookings:</span>
                                        <span className="font-bold">{reportData.totalBookings || reportData.bookings?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Total Commission:</span>
                                        <span className="font-bold text-green-600">₹{reportData.totalCommission || 0}</span>
                                    </div>
                                    {reportData.totalRevenue !== undefined && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Total Revenue:</span>
                                            <span className="font-bold text-indigo-600">₹{reportData.totalRevenue || 0}</span>
                                        </div>
                                    )}
                                    {reportData.totalEarned !== undefined && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Provider Earned:</span>
                                            <span className="font-bold text-blue-600">₹{reportData.totalEarned || 0}</span>
                                        </div>
                                    )}

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

                {/* Recent Activity / List View */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {reportData ? reportData.title : "Report Results"}
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {/* Report Data List View */}
                        {reportData && reportData.bookings && reportData.bookings.length > 0 ? (
                            <div className="space-y-3">
                                {reportData.bookings.map((booking, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{booking.serviceName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {booking.providerName ? `Provider: ${booking.providerName}` : booking.customerName ? `User: ${booking.customerName}` : new Date(booking.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-600">Comm: ₹{booking.commission}</p>
                                            {booking.amount > 0 && <p className="text-xs text-gray-500">Amt: ₹{booking.amount}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">
                                    {reportData ? "No data found for the selected criteria." : "Select report criteria to view analytics."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
