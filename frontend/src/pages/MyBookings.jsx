import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getUserBookings, deleteBooking, rateBooking, confirmBooking, updateBookingDetails } from '../api/bookings';
import { Calendar, User, ArrowLeft, Clock, Mail, Phone, X, Star, CheckCircle, Edit2, Save } from 'lucide-react';



import DataTable from 'react-data-table-component';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Review Modal State
    const [activeBookingForReview, setActiveBookingForReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [activeBookingForInvoice, setActiveBookingForInvoice] = useState(null);

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f9fafb', // gray-50
                borderBottomColor: '#f3f4f6', // gray-100
                borderBottomWidth: '1px',
            },
        },
        headCells: {
            style: {
                color: '#6b7280', // gray-500
                fontSize: '0.75rem', // xs
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingLeft: '24px',
                paddingRight: '24px',
            },
        },
        rows: {
            style: {
                fontSize: '0.875rem', // sm
                color: '#374151', // gray-700
                paddingTop: '12px',
                paddingBottom: '12px',
                '&:hover': {
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '24px',
                paddingRight: '24px',
            },
        },
    };

    // Helper for updating individual booking in list
    const updateBookingInList = (updatedBooking) => {
        setBookings(prev => prev.map(b => b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b));
    };


    const columns = [
        {
            name: 'Service',
            selector: row => row.service?.title,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-3 py-2">
                    <img src={row.service?.image || 'https://via.placeholder.com/40'} alt={row.service?.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                        <p className="font-semibold text-soft-black">{row.service?.title}</p>
                        <p className="text-sm text-gray-500">{row.service?.category?.name}</p>
                    </div>
                </div>
            ),
            width: '250px'
        },
        {
            name: 'Provider',
            selector: row => row.serviceProvider?.username,
            sortable: true,
            cell: row => (
                <div className="py-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-gray-700">{row.serviceProvider?.username}</p>
                    </div>
                    <button
                        onClick={() => handleContactClick(row.serviceProvider)}
                        className="text-blue-600 text-xs hover:underline mt-1 ml-6"
                    >
                        Contact
                    </button>
                </div>
            )
        },
        {
            name: 'Scheduled Date',
            selector: row => row.scheduledDate,
            sortable: true,
            cell: row => <DateCell booking={row} onUpdate={updateBookingInList} />,
            width: '220px'
        },
        {
            name: 'Notes',
            cell: row => <NotesCell booking={row} onUpdate={updateBookingInList} />,
            width: '200px'
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                    {row.status.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex flex-col items-end space-y-2 w-full">
                    {row.status === 'work_completed' && (
                        <button
                            onClick={() => handleConfirmBooking(row._id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 px-2 py-1 rounded"
                        >
                            <CheckCircle className="w-3 h-3" /> Confirm
                        </button>
                    )}
                    {row.status === 'completed' && !row.review && (
                        <button
                            onClick={() => setActiveBookingForReview(row)}
                            className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-medium text-xs"
                        >
                            <Star className="w-3 h-3" /> Rate
                        </button>
                    )}
                    {row.status === 'completed' && row.invoice && (
                        <button
                            onClick={() => setActiveBookingForInvoice(row)}
                            className="text-blue-600 hover:underline text-xs"
                        >
                            View Invoice
                        </button>
                    )}
                    {(row.status === 'pending' || row.status === 'accepted') && (
                        <button
                            onClick={() => handleDelete(row._id)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    )}
                </div>
            ),
            right: true
        }
    ];

    // Inline Edit Components for Cells
    const NotesCell = ({ booking, onUpdate }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [notes, setNotes] = useState(booking.notes || '');

        const handleSave = async () => {
            const res = await updateBookingDetails(booking._id, { notes });
            if (res.success) {
                onUpdate({ ...booking, notes });
                setIsEditing(false);
            } else alert(res.error);
        };

        if (isEditing) {
            return (
                <div className="flex items-center gap-1">
                    <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full text-xs border rounded p-1" />
                    <button onClick={handleSave} className="text-green-600"><Save className="w-3 h-3" /></button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400"><X className="w-3 h-3" /></button>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 group">
                <p className="text-gray-600 text-sm italic truncate max-w-[120px]" title={booking.notes}>{booking.notes || '-'}</p>
                {booking.status === 'pending' && (
                    <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black">
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    };

    const DateCell = ({ booking, onUpdate }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [date, setDate] = useState(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : '');

        const handleSave = async () => {
            const res = await updateBookingDetails(booking._id, { scheduledDate: date });
            if (res.success) {
                onUpdate({ ...booking, scheduledDate: date });
                setIsEditing(false);
            } else alert(res.error);
        };

        if (isEditing) {
            return (
                <div className="flex flex-col gap-1 w-full">
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="text-xs border rounded p-1" />
                    <div className="flex gap-1">
                        <button onClick={handleSave} className="bg-black text-white px-2 py-0.5 rounded text-[10px]">Save</button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-2 py-0.5 rounded text-[10px]">Cancel</button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 group">
                <div>
                    <div className="flex items-center gap-1 text-gray-700 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{booking.scheduledTime}</span>
                    </div>
                </div>
                {booking.status === 'pending' && (
                    <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    };

    useEffect(() => {
        const fetchBookings = async () => {
            // ... (existing code, not changing, but showing context for placement)
            try {
                const data = await getUserBookings();
                if (data.success) {
                    setBookings(data.bookings);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const downloadInvoice = (booking) => {
        try {
            if (!booking || !booking.invoice) {
                alert("Invoice data is incomplete.");
                return;
            }

            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("INVOICE", 105, 20, null, null, "center");

            doc.setFontSize(10);
            const invoiceId = booking._id ? booking._id.slice(-6).toUpperCase() : 'UNKNOWN';
            doc.text(`Invoice #: INV-${invoiceId}`, 14, 30);
            doc.text(`Date: ${new Date(booking.updatedAt || Date.now()).toLocaleDateString()}`, 14, 35);

            doc.setFontSize(12);
            doc.text("Billed To:", 14, 50);
            doc.setFontSize(10);

            const userName = booking.user?.username || 'Customer';
            doc.text(`Name: ${userName}`, 14, 56);

            if (booking.user?.contactNumber || booking.user?.phone) {
                doc.text(`Phone: ${booking.user.contactNumber || booking.user.phone}`, 14, 61);
            }

            doc.setFontSize(12);
            doc.text("Service Details:", 14, 75);
            doc.setFontSize(10);
            doc.text(`Service: ${booking.service?.title || 'Service'}`, 14, 81);
            doc.text(`Provider: ${booking.serviceProvider?.username || 'Provider'}`, 14, 86);

            const tableColumn = ["Description", "Amount (INR)"];
            const tableRows = [
                ["Service Price", `Rs. ${Number(booking.invoice.servicePrice || 0).toFixed(2)}`],
                ["Visiting / Extra Charges", `Rs. ${Number(booking.invoice.serviceCharge || 0).toFixed(2)}`],
                ["GST (18%)", `Rs. ${Number(booking.invoice.gst || 0).toFixed(2)}`],
                ["Total Amount", `Rs. ${Number(booking.invoice.totalAmount || 0).toFixed(2)}`]
            ];

            autoTable(doc, {
                startY: 95,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0] },
                foot: [['Grand Total', `Rs. ${Number(booking.invoice.totalAmount || 0).toFixed(2)}`]],
                footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
            });

            doc.text("Thank you for choosing our service!", 105, (doc.lastAutoTable?.finalY || 150) + 20, null, null, "center");

            doc.save(`Invoice_${invoiceId}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Please try again or contact support.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-blue-100 text-blue-700'; // Changed to blue/neutral
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'work_completed': return 'bg-purple-100 text-purple-700'; // Distinct color
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
            </HomeLayout>
        );
    }



    const handleContactClick = (provider) => {
        setSelectedContact(provider);
        setShowContactModal(true);
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;

        try {
            const res = await deleteBooking(bookingId);
            if (res.success) {
                setBookings(prev => prev.filter(b => b._id !== bookingId));
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete booking");
        }
    };

    const handleConfirmBooking = async (bookingId) => {
        if (!window.confirm("Confirm that the provider has completed the work?")) return;

        try {
            const res = await confirmBooking(bookingId);
            if (res.success) {
                // Update local state to 'completed'
                setBookings(prev => prev.map(b =>
                    b._id === bookingId ? { ...b, status: 'completed' } : b
                ));
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error("Confirmation failed", err);
            alert("Failed to confirm booking");
        }
    };

    const BookingRow = ({ booking, onDelete, onConfirm, onContact, onViewInvoice, onRate, getStatusColor, setBookings }) => {
        const [isEditingNotes, setIsEditingNotes] = useState(false);
        const [editedNotes, setEditedNotes] = useState(booking.notes || '');

        const [isEditingDate, setIsEditingDate] = useState(false);
        const [editedDate, setEditedDate] = useState(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : '');

        const handleSaveNotes = async () => {
            try {
                const res = await updateBookingDetails(booking._id, { notes: editedNotes });
                if (res.success) {
                    setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, notes: editedNotes } : b));
                    setIsEditingNotes(false);
                } else {
                    alert(res.error);
                }
            } catch (err) {
                console.error("Failed to update notes", err);
                alert("Failed to update notes");
            }
        };

        const handleSaveDate = async () => {
            try {
                if (!editedDate) return;
                const res = await updateBookingDetails(booking._id, { scheduledDate: editedDate });
                if (res.success) {
                    setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, scheduledDate: editedDate } : b));
                    setIsEditingDate(false);
                } else {
                    alert(res.error);
                }
            } catch (err) {
                console.error("Failed to update date", err);
                alert("Failed to update date");
            }
        };

        return (
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                    <div className="flex items-center gap-3">
                        <img src={booking.service?.image || 'https://via.placeholder.com/40'} alt={booking.service?.title} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                            <p className="font-semibold text-soft-black">{booking.service?.title}</p>
                            <p className="text-sm text-gray-500">{booking.service?.category?.name}</p>
                        </div>
                    </div>
                </td>
                <td className="p-6">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-gray-700">{booking.serviceProvider?.username}</p>
                    </div>
                    <button
                        onClick={() => onContact(booking.serviceProvider)}
                        className="text-blue-600 text-sm hover:underline mt-1"
                    >
                        Contact Provider
                    </button>
                </td>
                <td className="p-6">
                    {isEditingDate ? (
                        <div className="flex flex-col gap-2">
                            <input
                                type="datetime-local"
                                value={editedDate}
                                onChange={(e) => setEditedDate(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-1">
                                <button onClick={handleSaveDate} className="p-1 px-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">Save</button>
                                <button onClick={() => { setIsEditingDate(false); setEditedDate(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : ''); }} className="p-1 px-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group/date">
                            <div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 mt-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{booking.scheduledTime}</span>
                                </div>
                            </div>
                            {booking.status === 'pending' && (
                                <button
                                    onClick={() => setIsEditingDate(true)}
                                    className="opacity-0 group-hover/date:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                                    title="Reschedule"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </td>
                <td className="p-6 max-w-xs">
                    {isEditingNotes ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleSaveNotes} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => {
                                setIsEditingNotes(false);
                                setEditedNotes(booking.notes || ''); // Revert changes
                            }} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group/notes">
                            <p className="text-gray-600 text-sm italic">{booking.notes || 'No notes'}</p>
                            {booking.status === 'pending' && (
                                <button onClick={() => setIsEditingNotes(true)} className="opacity-0 group-hover/notes:opacity-100 p-1 text-gray-500 hover:text-gray-900 rounded-full transition-opacity">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </td>
                <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.replace(/_/g, ' ')}
                    </span>
                </td>
                <td className="p-6 text-right">
                    <div className="flex flex-col items-end space-y-2">
                        {booking.status === 'work_completed' && (
                            <button
                                onClick={() => onConfirm(booking._id)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                                <CheckCircle className="w-4 h-4" /> Confirm Completion
                            </button>
                        )}
                        {booking.status === 'completed' && !booking.review && (
                            <button
                                onClick={() => onRate(booking)}
                                className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                            >
                                <Star className="w-4 h-4" /> Rate Service
                            </button>
                        )}
                        {booking.status === 'completed' && booking.invoice && (
                            <button
                                onClick={() => onViewInvoice(booking)}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                View Invoice
                            </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                            <button
                                onClick={() => onDelete(booking._id)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                Cancel Booking
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-50/30 pt-[10px] md:mt-30 px-4 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => navigate('/account')}
                            className="p-3 -ml-2 hover:bg-gray-100 p-4 bg-blue-50 text-blue-600 rounded-2xl rounded-full transition-colors text-gray-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-soft-black">My Bookings</h1>
                            <p className="text-gray-500">View and track your service appointments</p>
                        </div>
                    </div>

                    {/* Data Table View */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
                        <DataTable
                            columns={columns}
                            data={bookings}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[5, 10, 20]}
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                                        <p className="text-lg">No bookings found.</p>
                                        <button onClick={() => navigate('/services')} className="mt-2 text-blue-600 font-medium hover:underline">
                                            Browse Services
                                        </button>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>




            {/* Contact Modal */}
            {showContactModal && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-soft-black">Provider Contact</h3>
                            <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <User className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-soft-black">{selectedContact.username}</h4>
                                <p className="text-sm text-gray-500">Service Provider</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-gray-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                        <p className="font-medium text-gray-900">{selectedContact.contactNumber || selectedContact.phone || "Not available"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-gray-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                                        <p className="font-medium text-gray-900">{selectedContact.email || "Not available"}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowContactModal(false)}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {
                activeBookingForReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-soft-black">Rate Your Experience</h3>
                                <button onClick={() => setActiveBookingForReview(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Leave a Comment</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none h-32 resize-none"
                                        placeholder="How was the service provided?"
                                    ></textarea>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!reviewForm.rating) return alert("Please select a star rating");

                                        const res = await rateBooking(activeBookingForReview._id, reviewForm);
                                        if (res.success) {
                                            setBookings(prev => prev.map(b => b._id === activeBookingForReview._id ? res.booking : b));
                                            setActiveBookingForReview(null);
                                            alert("Thank you for your feedback!");
                                        } else {
                                            alert(res.error);
                                        }
                                    }}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Invoice Modal (Read Only) */}
            {activeBookingForInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-soft-black">Invoice Details</h3>
                            <button onClick={() => setActiveBookingForInvoice(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
                            {/* Left Column: Context (2 cols) */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full">
                                    <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-6">Booking Context</h4>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Service Provided</p>
                                            <p className="font-bold text-xl text-soft-black">{activeBookingForInvoice?.service?.title}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Provider Details</p>
                                            <p className="font-medium text-lg text-gray-700">{activeBookingForInvoice?.serviceProvider?.username}</p>
                                            {activeBookingForInvoice?.serviceProvider?.phone && (
                                                <p className="text-sm text-gray-500">{activeBookingForInvoice.serviceProvider.phone}</p>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Invoice Number</p>
                                            <p className="font-mono text-lg text-gray-700 tracking-widest">INV-{activeBookingForInvoice?._id?.slice(-6).toUpperCase()}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date Issued</p>
                                            <p className="text-sm text-gray-700">{new Date(activeBookingForInvoice.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Financials (3 cols) */}
                            <div className="md:col-span-3">
                                <div className="bg-white rounded-2xl h-full flex flex-col justify-center">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Base Service Price</span>
                                            <span className="font-bold text-lg">₹{activeBookingForInvoice.invoice?.servicePrice}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-600 font-medium">Visiting / Extra Fee</span>
                                            <span className="font-bold text-lg">₹{activeBookingForInvoice.invoice?.serviceCharge}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 text-gray-500">
                                            <span>GST (18%)</span>
                                            <span>₹{activeBookingForInvoice.invoice?.gst}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-6 text-2xl font-bold bg-green-50 px-6 rounded-2xl mt-6 border border-green-100">
                                            <span className="text-green-800">Total Paid</span>
                                            <span className="text-green-700">₹{activeBookingForInvoice.invoice?.totalAmount}</span>
                                        </div>

                                        <button
                                            onClick={() => downloadInvoice(activeBookingForInvoice)}
                                            className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </HomeLayout >
    );
};

export default MyBookings;
