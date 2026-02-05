import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Calendar, AlertCircle, Edit2, CheckCircle, FileText, User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProviderBookings, updateBookingStatus } from '../../api/bookings';
import { ProviderDateCell, ProviderStatusCell } from '../../components/ProviderBookingCells';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProviderBookings = () => {
    const { t, i18n } = useTranslation();
    const { providerDetails } = useOutletContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingTab, setBookingTab] = useState('current');

    // UI Logic States
    const [filterText, setFilterText] = useState('');
    const [activeBookingForEdit, setActiveBookingForEdit] = useState(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [activeBookingForCompletion, setActiveBookingForCompletion] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({ servicePrice: '', serviceCharge: '' });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await getProviderBookings();
                if (res.success) {
                    setBookings(res.bookings);
                }
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const updateBookingInList = useCallback((id, updates) => {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, ...updates } : b));
    }, []);

    const statusConfig = useMemo(() => ({
        accepted: { color: 'bg-green-100 text-green-700', label: t('dashboard.statusLabel.accepted') },
        arrived: { color: 'bg-blue-100 text-blue-700', label: t('dashboard.statusLabel.arrived') },
        in_progress: { color: 'bg-orange-100 text-orange-700', label: t('dashboard.statusLabel.in_progress') },
        work_completed: { color: 'bg-purple-100 text-purple-700', label: t('dashboard.statusLabel.work_completed') },
        completed: { color: 'bg-gray-100 text-gray-700', label: t('dashboard.statusLabel.completed') },
        cancelled: { color: 'bg-red-100 text-red-700', label: t('dashboard.statusLabel.cancelled') },
        rejected: { color: 'bg-red-50 text-red-500', label: t('dashboard.statusLabel.rejected') },
        pending: { color: 'bg-yellow-100 text-yellow-700', label: t('dashboard.statusLabel.pending') }
    }), [t]);

    const handleUpdateStatus = async () => {
        if (!activeBookingForEdit || !statusToUpdate) return;
        try {
            const res = await updateBookingStatus(activeBookingForEdit._id, statusToUpdate);
            if (res.success) {
                updateBookingInList(activeBookingForEdit._id, { status: statusToUpdate });
                setActiveBookingForEdit(null);
                setStatusToUpdate('');
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error(err);
            alert(t('dashboard.failedToUpdateStatus'));
        }
    };

    const columns = useMemo(() => [
        {
            name: `${t('dashboard.service')} & ${t('dashboard.customer')}`,
            selector: row => row.service?.title,
            sortable: true,
            cell: row => (
                <div className="py-2">
                    <h4 className="font-bold text-soft-black text-sm">{row.service?.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.cust')}: <span className="font-medium text-gray-700">{row.user?.username}</span></p>
                    {row.notes && (
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-100 max-w-[200px] truncate" title={row.notes}>
                            "{row.notes}"
                        </p>
                    )}
                </div>
            ),
            width: '250px'
        },
        {
            name: t('dashboard.date'),
            id: 'date',
            selector: row => row.scheduledDate,
            sortable: true,
            cell: row => <ProviderDateCell booking={row} onUpdate={(updated) => updateBookingInList(row._id, updated)} />,
            width: '200px'
        },
        {
            name: t('dashboard.status'),
            selector: row => row.status,
            sortable: true,
            cell: row => <ProviderStatusCell booking={row} onUpdate={(updated) => updateBookingInList(row._id, updated)} statusConfig={statusConfig} />,
            width: '200px'
        },
        {
            name: t('dashboard.contactInfo'),
            cell: row => (
                <div className="py-2">
                    {row.user?.phone ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="bg-gray-100 p-1.5 rounded-full"><User className="w-3 h-3" /></div>
                            <span className="font-mono">{row.user.phone}</span>
                        </div>
                    ) : <span className="text-gray-400 text-xs italic">{t('dashboard.noInfo')}</span>}
                    {row.user?.address?.city && (
                        <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {row.user.address.city}
                        </div>
                    )}
                </div>
            )
        },
        {
            name: t('dashboard.actions'),
            cell: row => (
                <div className="flex items-center justify-end gap-2 w-full py-2">
                    {/* Status Edit - Available for active bookings */}
                    {['pending', 'accepted', 'arrived', 'in_progress'].includes(row.status) && (
                        <button
                            onClick={() => {
                                setActiveBookingForEdit(row);
                                setStatusToUpdate(row.status);
                            }}
                            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            title="Edit Status"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}

                    {['accepted', 'arrived', 'in_progress'].includes(row.status) && (
                        <button
                            onClick={() => {
                                setActiveBookingForCompletion(row);
                                setInvoiceForm({
                                    servicePrice: row.service?.price || '',
                                    serviceCharge: providerDetails?.consultFee || ''
                                });
                            }}
                            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                            title="Complete Job & Invoice"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {row.status === 'work_completed' && (
                        <span className="text-xs text-amber-600 font-medium block" title="Waiting for user confirmation">Waiting</span>
                    )}
                    {(row.status === 'completed' || row.status === 'cancelled') && row.invoice && (
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-soft-black">₹{row.invoice.totalAmount}</p>
                            <button
                                // onClick={() => setActiveBookingForCompletion(row)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                title="View Invoice"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            ),
            // right: true 
        }
    ], [providerDetails, updateBookingInList, statusConfig, t]);

    const filteredItems = bookings.filter(b => {
        if (bookingTab === 'all') return true;
        if (bookingTab === 'pending') return b.status === 'pending';

        const isCurrent = ['accepted', 'in_progress', 'arrived', 'work_completed'].includes(b.status);
        if (bookingTab === 'current' && !isCurrent) return false;

        const searchText = filterText.toLowerCase();
        return (
            (b.service?.title?.toLowerCase() || '').includes(searchText) ||
            (b.user?.username?.toLowerCase() || '').includes(searchText) ||
            (b.status?.toLowerCase() || '').includes(searchText)
        );
    });

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f9fafb',
                borderBottomColor: '#e5e7eb',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
            },
        },
        headCells: {
            style: {
                color: '#111827',
                fontSize: '0.95rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                fontSize: '0.875rem',
                color: '#374151',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: '#e5e7eb',
                '&:hover': {
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                },
            },
        },
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-soft-black">{t('dashboard.bookings')}</h2>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    {['current', 'pending', 'all'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setBookingTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${bookingTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('dashboard.searchPlaceholder')}
                    className="w-full md:w-64 pl-4 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                customStyles={customStyles}
                persistTableHead
                noDataComponent={
                    <div className="p-12 text-center text-gray-400">
                        <Calendar className="w-12 h-12 mb-3 text-gray-300 mx-auto" />
                        <p>No bookings found.</p>
                    </div>
                }
            />

            {/* Edit Status Modal */}
            {activeBookingForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-4">Update Status</h3>
                        <div className="space-y-2 mb-6">
                            {['accepted', 'arrived', 'in_progress', 'work_completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusToUpdate(status)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all font-medium ${statusToUpdate === status
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {status.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setActiveBookingForEdit(null)}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderBookings;
