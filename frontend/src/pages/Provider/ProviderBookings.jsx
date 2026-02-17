import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Calendar, AlertCircle, Edit2, CheckCircle, FileText, User, MapPin, ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProviderBookings, updateBookingStatus } from '../../api/bookings';
import { ProviderDateCell, ProviderStatusCell } from '../../components/ProviderBookingCells';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProviderBookings = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { providerDetails } = useOutletContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingTab, setBookingTab] = useState('current');

    // UI Logic States
    const [filterText, setFilterText] = useState('');
    const [activeBookingForEdit, setActiveBookingForEdit] = useState(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [activeBookingForCompletion, setActiveBookingForCompletion] = useState(null);
    const [activeBookingForInvoice, setActiveBookingForInvoice] = useState(null);
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

    const downloadInvoice = (booking, action = 'download') => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("INVOICE", 105, 20, null, null, "center");

        doc.setFontSize(10);
        doc.text(`Invoice #: INV-${booking._id.slice(-6).toUpperCase()}`, 14, 30);
        doc.text(`Date: ${new Date(booking.updatedAt).toLocaleDateString()}`, 14, 35);

        doc.setFontSize(12);
        doc.text(t('dashboard.invoice.billedTo') || "Billed To:", 14, 50);
        doc.setFontSize(10);
        doc.text(`Name: ${booking.user?.username || 'Customer'}`, 14, 56);
        if (booking.user?.phone) doc.text(`Phone: ${booking.user.phone}`, 14, 61);

        doc.setFontSize(12);
        doc.text(t('dashboard.invoice.serviceDetails') || "Service Details:", 14, 75);
        doc.setFontSize(10);
        doc.text(`Service: ${booking.service?.title}`, 14, 81);
        doc.text(`Provider: ${providerDetails?.user?.username || 'Provider'}`, 14, 86);

        const tableColumn = ["Description", "Amount (INR)"];
        const tableRows = [
            ["Service Price", `Rs. ${booking.invoice?.servicePrice}`],
            ["Visiting / Extra Charges", `Rs. ${booking.invoice?.serviceCharge}`],
            ["GST (18%)", `Rs. ${booking.invoice?.gst}`],
            ["Total Amount", `Rs. ${booking.invoice?.totalAmount}`]
        ];

        autoTable(doc, {
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] },
            foot: [[t('userBookings.invoice.totalAmount') || "Total Amount", `Rs. ${booking.invoice?.totalAmount}`]],
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
        });

        doc.text("Thank you for choosing our service!", 105, doc.lastAutoTable.finalY + 20, null, null, "center");

        if (action === 'preview') {
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(`Invoice_${booking._id.slice(-6)}.pdf`);
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
                                onClick={() => downloadInvoice(row)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                title="Download Invoice"
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
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
            <div className="flex flex-row justify-between items-center mb-6 gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <button
                        onClick={() => navigate('/provider/dashboard')}
                        className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                    </button>
                    <h2 className="text-lg md:text-xl font-bold text-soft-black truncate">{t('dashboard.bookings')}</h2>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto shrink-0 max-w-[75%] md:max-w-none scrollbar-hide">
                    {['current', 'pending', 'all'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setBookingTab(tab)}
                            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold capitalize whitespace-nowrap transition-all ${bookingTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
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

            <div className="overflow-x-auto">
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
            </div>

            {/* Edit Status Modal */}
            {activeBookingForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-4">Update Status</h3>
                        <div className="space-y-2 mb-6">
                            {['accepted', 'arrived', 'in_progress', 'cancelled'].map(status => (
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

            {/* Complete Job & Invoice Modal */}
            {activeBookingForCompletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-soft-black">Complete Job & Invoice</h3>
                            <button onClick={() => setActiveBookingForCompletion(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Service</p>
                                <p className="font-bold text-soft-black">{activeBookingForCompletion.service?.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            value={invoiceForm.servicePrice}
                                            onChange={e => setInvoiceForm({ ...invoiceForm, servicePrice: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Charge</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            value={invoiceForm.serviceCharge}
                                            onChange={e => setInvoiceForm({ ...invoiceForm, serviceCharge: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-blue-800 font-medium">Total Amount (inc. 18% GST)</span>
                                <span className="text-xl font-bold text-blue-900">
                                    ₹{((parseFloat(invoiceForm.servicePrice || 0) + parseFloat(invoiceForm.serviceCharge || 0)) * 1.18).toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!invoiceForm.servicePrice || !invoiceForm.serviceCharge) {
                                        alert("Please fill in all pricing fields");
                                        return;
                                    }
                                    try {
                                        // Import API call locally or use from props/import
                                        const { completeBooking } = await import('../../api/bookings');
                                        const res = await completeBooking(activeBookingForCompletion._id, {
                                            servicePrice: parseFloat(invoiceForm.servicePrice),
                                            serviceCharge: parseFloat(invoiceForm.serviceCharge)
                                        });

                                        if (res.success) {
                                            updateBookingInList(activeBookingForCompletion._id, {
                                                status: 'work_completed',
                                                invoice: res.invoice
                                            });
                                            setActiveBookingForCompletion(null);
                                        } else {
                                            alert(res.error);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to create invoice");
                                    }
                                }}
                                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Send Invoice & Mark Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderBookings;
