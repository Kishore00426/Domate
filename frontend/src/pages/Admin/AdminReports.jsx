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
    const [dateRange, setDateRange] = useState('this_month'); // Default to this month
    const [selectedTarget, setSelectedTarget] = useState(''); // provider ID or service ID
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Handle Date Range Presets
    useEffect(() => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (dateRange) {
            case 'today':
                // start and end are already today
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                break;
            case 'last_7_days':
                start.setDate(today.getDate() - 6);
                break;

            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'last_month':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'custom':
                return; // Don't update dates, let user pick
            default:
                break;
        }

        if (dateRange !== 'custom') {
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
        }
    }, [dateRange]);

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

        // --- Colors ---
        const colors = {
            primary: [79, 70, 229], // Indigo 600
            success: [34, 197, 94], // Green 500
            text: [17, 24, 39],     // Gray 900
            textLight: [107, 114, 128], // Gray 500
            bg: [249, 250, 251],    // Gray 50
            border: [229, 231, 235] // Gray 200
        };

        // --- Header Section ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.text);
        doc.text(reportData.title || "Analytics Report", 14, 20);

        // Subtitle (Date Range)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.textLight);
        const dateStr = `Generated on: ${new Date().toLocaleDateString()}`;
        let periodStr = "Period: All Time";
        if (startDate && endDate) {
            periodStr = `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
        }
        doc.text(`${dateStr}  |  ${periodStr}`, 14, 27);

        // --- Stats Cards Section ---
        let startY = 40;
        const cardWidth = 55;
        const cardHeight = 24;
        const gap = 10;
        let currentX = 14;

        // Helper to draw a single stat card
        const drawCard = (label, value, valueColor = colors.text) => {
            // Draw background/border
            doc.setDrawColor(...colors.border);
            doc.setFillColor(...colors.bg);
            doc.roundedRect(currentX, startY, cardWidth, cardHeight, 3, 3, 'FD');

            // Draw Label
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.textLight);
            doc.text(label.toUpperCase(), currentX + 4, startY + 8);

            // Draw Value
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...valueColor);
            doc.text(value.toString(), currentX + 4, startY + 18);

            currentX += cardWidth + gap;
        };

        // Draw cards based on available data
        if (reportData.totalBookings !== undefined) {
            drawCard("Total Bookings", reportData.totalBookings);
        } else if (reportData.bookings) {
            drawCard("Total Bookings", reportData.bookings.length);
        }

        if (reportData.totalCommission !== undefined) {
            drawCard("Total Commission", `Rs. ${reportData.totalCommission}`, colors.success);
        }

        if (reportData.totalRevenue !== undefined) {
            drawCard("Total Revenue", `Rs. ${reportData.totalRevenue}`, colors.primary);
        }

        if (reportData.totalEarned !== undefined) {
            drawCard("Provider Earned", `Rs. ${reportData.totalEarned}`, [37, 99, 235]); // Blue 600
        }

        // --- Table Section ---
        // Define columns based on report type
        let tableHead = [["ID", "Service", "Date", "Amount", "Commission"]];
        if (reportType === 'user') {
            tableHead = [["ID", "Service", "Provider", "Date", "Amount"]];
        } else if (reportType === 'provider') {
            tableHead = [["ID", "Service", "User", "Date", "Amount", "Commission"]];
        }

        // Prepare rows
        const tableBody = [];
        if (reportData.bookings) {
            reportData.bookings.forEach(booking => {
                let row = [];
                const amount = booking.amount ? `Rs. ${booking.amount}` : '-';
                const comm = booking.commission ? `Rs. ${booking.commission}` : 'Rs. 0';

                if (reportType === 'user') {
                    row = [
                        booking.id.substring(0, 8).toUpperCase(),
                        booking.serviceName || 'N/A',
                        booking.providerName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        amount
                    ];
                } else if (reportType === 'provider') {
                    row = [
                        booking.id.substring(0, 8).toUpperCase(),
                        booking.serviceName || 'N/A',
                        booking.customerName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        amount,
                        comm
                    ];
                } else {
                    row = [
                        booking.id.substring(0, 8).toUpperCase(),
                        booking.serviceName || 'N/A',
                        new Date(booking.date).toLocaleDateString(),
                        amount,
                        comm
                    ];
                }
                tableBody.push(row);
            });
        }

        // Calculate table-specific styling indices
        const amountColIndex = tableHead[0].indexOf("Amount");
        const commColIndex = tableHead[0].indexOf("Commission");

        autoTable(doc, {
            startY: startY + cardHeight + 15, // Start below cards
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [249, 250, 251], // Gray 50 header bg
                textColor: [107, 114, 128], // Gray 500 header text
                fontStyle: 'bold',
                halign: 'left',
                lineWidth: 0,
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                textColor: [55, 65, 81], // Gray 700 body text
                lineColor: [229, 231, 235], // Gray 200 borders
                lineWidth: 0.1,
            },
            columnStyles: {
                [amountColIndex]: { halign: 'right', fontStyle: 'bold' },
                [commColIndex]: { halign: 'right', textColor: [22, 163, 74], fontStyle: 'bold' } // Green for commission
            },
            didDrawPage: (data) => {
                // Optional: Footer or page numbers
            }
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

                    {/* Date Range Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_7_days">Last 7 Days</option>

                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {/* Custom Start/End Date (Conditional) */}
                    {dateRange === 'custom' && (
                        <>
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

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
                    <div>
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

            {/* 3. List Section (Bottom) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {reportData ? reportData.title : "Report Results"}
                        </h2>
                    </div>

                    {/* Export Actions (Moved Next to Title) */}
                    {reportData && (
                        <div className="flex gap-2">
                            <button
                                onClick={downloadPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <button
                                onClick={downloadCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-colors text-sm font-medium"
                            >
                                <FileText className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Section (Moved Inside) */}
                {reportData && (
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalBookings || reportData.bookings?.length || 0}</p>
                        </div>

                        <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Commission</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">₹{reportData.totalCommission || 0}</p>
                        </div>

                        {reportData.totalRevenue !== undefined && (
                            <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-bold text-indigo-600 mt-1">₹{reportData.totalRevenue || 0}</p>
                            </div>
                        )}

                        {reportData.totalEarned !== undefined && (
                            <div className="flex-1 min-w-[200px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Provider Earned</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">₹{reportData.totalEarned || 0}</p>
                            </div>
                        )}
                    </div>
                )}

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
