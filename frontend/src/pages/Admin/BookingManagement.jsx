import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Search, Eye, Calendar, User, Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAllBookings } from '../../api/admin';
import { useTranslation } from 'react-i18next';

const BookingManagement = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

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

    const subHeaderComponentMemo = React.useMemo(() => {
        return (
            <div className="relative flex-1 max-w-sm mb-4">
                <input
                    type="text"
                    placeholder="Search bookings..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm text-soft-black"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
        );
    }, [filterText]);

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
        </div>
    );
};

export default BookingManagement;
