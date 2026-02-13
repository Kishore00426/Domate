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
    const [customers, setCustomers] = useState([]);
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

                    const customerList = usersResponse.users.filter(u =>
                        u.role?.name === 'user' || !u.role // Assuming default is user if no role or role is 'user'
                    );
                    setCustomers(customerList);
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

    const downloadCSV = () => {
        if (!reportData || !reportData.bookings) return;

        let headers = ["ID", "Service", "Date", "Amount", "Comm."];
        if (reportType === 'user') {
            headers = ["ID", "Service", "Provider", "Date", "Amount"];
        } else if (reportType === 'provider') {
            headers = ["ID", "Service", "User", "Date", "Amount", "Comm."];
        }

        const rows = reportData.bookings.map(booking => {
            if (reportType === 'user') {
                return [
                    booking.id,
                    booking.serviceName || 'N/A',
                    booking.providerName || 'N/A',
                    new Date(booking.date).toLocaleDateString(),
                    booking.amount || 0
                ];
            } else if (reportType === 'provider') {
                return [
                    booking.id,
                    booking.serviceName || 'N/A',
                    booking.customerName || 'N/A',
                    new Date(booking.date).toLocaleDateString(),
                    booking.amount || 0,
                    booking.commission || 0
                ];
            } else {
                return [
                    booking.id,
                    booking.serviceName || 'N/A',
                    new Date(booking.date).toLocaleDateString(),
                    booking.amount || 0,
                    booking.commission || 0
                ];
            }
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `report_${reportType}_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        let tableColumn = ["ID", "Service", "Date", "Amount", "Comm."];
        if (reportType === 'user') {
            tableColumn = ["ID", "Service", "Provider", "Date", "Amount"];
        } else if (reportType === 'provider') {
            tableColumn = ["ID", "Service", "User", "Date", "Amount", "Comm."];
        }

        const tableRows = [];

        if (reportData.bookings) {
            reportData.bookings.forEach(booking => {
                let bookingData = [];
                if (reportType === 'user') {
                    bookingData = [
                        booking.id.substring(0, 8),
                        booking.serviceName || 'N/A',
                        booking.providerName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        booking.amount || 0
                    ];
                } else if (reportType === 'provider') {
                    bookingData = [
                        booking.id.substring(0, 8),
                        booking.serviceName || 'N/A',
                        booking.customerName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        booking.amount || 0,
                        booking.commission || 0
                    ];
                } else {
                    bookingData = [
                        booking.id.substring(0, 8),
                        booking.serviceName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        booking.amount || 0,
                        booking.commission || 0
                    ];
                }
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-gray-500 mt-1">Generate comprehensive reports for system performance</p>
            </div>

            {/* 1. Filter Section (Top) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Generate Reports</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value);
                                setSelectedTarget('');
                            }}
                        >
                            <option value="total">Total System Report</option>
                            <option value="provider">Provider Performance</option>
                            <option value="user">User Activity Report</option>
                            <option value="service_commission">Service Commission</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Conditional Select */}
                    {(reportType === 'user' || reportType === 'provider' || reportType === 'service_commission') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {reportType === 'user' ? 'Select User' :
                                    reportType === 'provider' ? 'Select Provider' :
                                        'Select Service'}
                            </label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                            >
                                <option value="">-- All --</option>
                                {reportType === 'user' && customers.map(c => (
                                    <option key={c._id} value={c._id}>{c.username}</option>
                                ))}
                                {reportType === 'provider' && providers.map(p => (
                                    <option key={p._id} value={p._id}>{p.username}</option>
                                ))}
                                {reportType === 'service_commission' && services.map(s => (
                                    <option key={s._id} value={s._id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className={(reportType === 'total') ? "md:col-span-2 lg:col-span-2" : ""}>
                        <button
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
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
                </div>
            </div>

            {/* 2. Stats Section (Middle) */}
            {reportData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalBookings || reportData.bookings?.length || 0}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">Total Commission</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">₹{reportData.totalCommission || 0}</p>
                    </div>

                    {reportData.totalRevenue !== undefined && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">₹{reportData.totalRevenue || 0}</p>
                        </div>
                    )}

                    {reportData.totalEarned !== undefined && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                            <p className="text-gray-500 text-sm font-medium">Provider Earned</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">₹{reportData.totalEarned || 0}</p>
                        </div>
                    )}

                    {/* Export Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 h-full">
                        <button
                            onClick={downloadPDF}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-colors text-sm font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* 3. List Section (Bottom) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-4 py-3">Service</th>
                                        <th className="px-4 py-3">
                                            {reportType === 'user' ? 'Provider' :
                                                reportType === 'provider' ? 'User' : 'Date'}
                                        </th>
                                        {(reportType === 'user' || reportType === 'provider') && (
                                            <th className="px-4 py-3">Date</th>
                                        )}
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData.bookings.map((booking, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm">{booking.serviceName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {reportType === 'user' ? booking.providerName :
                                                    reportType === 'provider' ? booking.customerName :
                                                        new Date(booking.date).toLocaleDateString()}
                                            </td>
                                            {(reportType === 'user' || reportType === 'provider') && (
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                                {booking.amount > 0 ? `₹${booking.amount}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                                                ₹{booking.commission}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
    );
};

export default AdminReports;
