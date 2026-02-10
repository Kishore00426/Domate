import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Search, Eye, Calendar, User, Briefcase, FileText, CheckCircle, XCircle, Clock, Download, X } from 'lucide-react';
import { getAllBookings } from '../../api/admin';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BookingManagement = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getAllBookings();
            if (response.success) {
                setBookings(response.bookings);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredItems = bookings.filter(
        item =>
            (item.user?.username && item.user.username.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.serviceProvider?.username && item.serviceProvider.username.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.service?.title && item.service.title.toLowerCase().includes(filterText.toLowerCase())) ||
            (item._id && item._id.toLowerCase().includes(filterText.toLowerCase()))
    );

    const downloadCSV = () => {
        const csvRows = [];
        const headers = ["Booking ID", "User", "Provider", "Service", "Status", "Date", "Created At"];
        csvRows.push(headers.join(","));

        filteredItems.forEach(booking => {
            const row = [
                booking._id,
                booking.user?.username || "N/A",
                booking.serviceProvider?.username || "N/A",
                booking.service?.title || "Removed Service",
                booking.status,
                booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "N/A",
                booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A"
            ];
            // Escape double quotes and wrap in quotes to handle commas
            const escapedRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
            csvRows.push(escapedRow.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("hidden", "");
        a.setAttribute("href", url);
        a.setAttribute("download", `bookings_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Bookings Report", 14, 15);

        const tableColumn = ["Booking ID", "User", "Provider", "Service", "Status", "Date", "Created At"];
        const tableRows = [];

        filteredItems.forEach(booking => {
            const bookingData = [
                booking._id.substring(0, 8),
                booking.user?.username || "N/A",
                booking.serviceProvider?.username || "N/A",
                booking.service?.title || "Removed Service",
                booking.status,
                booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "N/A",
                booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A"
            ];
            tableRows.push(bookingData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`bookings_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const subHeaderComponentMemo = React.useMemo(() => {
        return (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mb-4">
                <div className="relative flex-1 max-w-sm">
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm text-soft-black"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        CSV
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                </div>
            </div>
        );
    }, [filterText, filteredItems]);

    // Status Badge Helper
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700",
            accepted: "bg-blue-100 text-blue-700",
            rejected: "bg-red-100 text-red-700",
            in_progress: "bg-purple-100 text-purple-700",
            work_completed: "bg-indigo-100 text-indigo-700",
            completed: "bg-green-100 text-green-700",
            cancelled: "bg-gray-100 text-gray-700"
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const columns = [
        {
            name: 'Booking ID',
            selector: row => row._id,
            sortable: true,
            cell: row => <span className="font-mono text-xs text-gray-500" title={row._id}>{row._id.substring(0, 8)}...</span>,
            width: '100px'
        },
        {
            name: 'User',
            selector: row => row.user?.username,
            sortable: true,
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="font-medium text-soft-black">{row.user?.username || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{row.user?.email}</span>
                </div>
            )
        },
        {
            name: 'Provider',
            selector: row => row.serviceProvider?.username,
            sortable: true,
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="font-medium text-soft-black">{row.serviceProvider?.username || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{row.serviceProvider?.email}</span>
                </div>
            )
        },
        {
            name: 'Service',
            selector: row => row.service?.title,
            sortable: true,
            cell: row => (
                <div className="flex flex-col py-2">
                    <span className="font-medium text-soft-black">{row.service?.title || 'Removed Service'}</span>
                    <span className="text-xs text-gray-500">{row.service?.category?.name}</span>
                </div>
            )
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status)
        },
        {
            name: 'Date',
            selector: row => row.scheduledDate,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{row.scheduledDate ? new Date(row.scheduledDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            )
        },
        {
            name: 'Created At',
            selector: row => row.createdAt,
            sortable: true,
            hide: 'md',
            cell: row => <span className="text-gray-400 text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
        {
            name: 'Action',
            cell: row => (
                <button
                    onClick={() => handleViewBooking(row)}
                    className="p-2 text-gray-500 hover:text-soft-black hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Booking Details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontSize: '0.875rem',
                fontWeight: 600,
            },
        },
        rows: {
            style: {
                fontSize: '0.875rem',
                color: '#1f2937',
                '&:hover': {
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                },
            },
        },
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">Booking Management</h1>
                    <p className="text-gray-500">View and manage all service bookings.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4">
                <DataTable
                    columns={columns}
                    data={filteredItems}
                    pagination
                    paginationResetDefaultPage={resetPaginationToggle}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    persistTableHead
                    progressPending={loading}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    noDataComponent={<div className="p-8 text-gray-400">No bookings found</div>}
                />
            </div>

            {/* Booking Preview Modal */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                            <div>
                                <h2 className="text-lg font-bold text-soft-black">Booking Details</h2>
                                <p className="text-xs text-gray-500 font-mono">ID: {selectedBooking._id}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${selectedBooking.status === 'completed' ? 'bg-green-500' :
                                            selectedBooking.status === 'cancelled' || selectedBooking.status === 'rejected' ? 'bg-red-500' :
                                                selectedBooking.status === 'accepted' ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}></div>
                                    <span className="font-semibold text-soft-black capitalize">{selectedBooking.status.replace('_', ' ')}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Created: <span className="font-medium text-gray-700">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Service Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Service Details
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Service Name</p>
                                            <p className="font-medium text-soft-black">{selectedBooking.service?.title || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Category</p>
                                            <p className="text-sm text-gray-700">{selectedBooking.service?.category?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Description</p>
                                            <p className="text-sm text-gray-600 line-clamp-3">{selectedBooking.service?.description || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Price</p>
                                            <p className="font-medium text-green-600 text-lg">
                                                ₹{selectedBooking.service?.price || '0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Schedule
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Scheduled Date</p>
                                            <p className="font-medium text-soft-black flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {selectedBooking.scheduledDate ? new Date(selectedBooking.scheduledDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        {/* Add Time here if available in your data schema */}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4" /> Customer
                                    </h3>
                                    <div className="bg-blue-50/50 rounded-xl p-4 space-y-2 border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                {selectedBooking.user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-soft-black">{selectedBooking.user?.username || 'Unknown User'}</p>
                                                <p className="text-xs text-gray-500">{selectedBooking.user?.email || 'No Email'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Info */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Provider
                                    </h3>
                                    <div className="bg-purple-50/50 rounded-xl p-4 space-y-2 border border-purple-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                                                {selectedBooking.serviceProvider?.username?.charAt(0).toUpperCase() || 'P'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-soft-black">{selectedBooking.serviceProvider?.username || 'Unknown Provider'}</p>
                                                <p className="text-xs text-gray-500">{selectedBooking.serviceProvider?.email || 'No Email'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
