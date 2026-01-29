import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getUserBookings, deleteBooking, rateBooking, confirmBooking, updateBookingDetails } from '../api/bookings';
import { Calendar, User, ArrowLeft, Clock, Mail, Phone, X, Star, CheckCircle, Edit2, Save } from 'lucide-react';



import DataTable from 'react-data-table-component';

// Imports at top (to be added)
import { NotesCell, DateCell } from '../components/MyBookingCells';

const MyBookings = () => {
    // ... existing state ...
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Review Modal State
    const [activeBookingForReview, setActiveBookingForReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [activeBookingForInvoice, setActiveBookingForInvoice] = useState(null);

    // Search and Export Logic
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'work_completed': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const columns = React.useMemo(() => [
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
    ], [bookings]); // Re-create if bookings change (to keep handlers fresh, though ideally handlers should be stable or generic)

    const filteredItems = bookings.filter(
        item => item.service?.title?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.serviceProvider?.username?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.status?.toLowerCase().includes(filterText.toLowerCase())
    );

    // Dynamic Import for xlsx
    const handleDownloadExcel = async () => {
        const XLSX = await import("xlsx");
        const worksheet = XLSX.utils.json_to_sheet(filteredItems.map(b => ({
            Service: b.service?.title,
            Provider: b.serviceProvider?.username,
            Date: new Date(b.scheduledDate).toLocaleDateString(),
            Time: b.scheduledTime,
            Status: b.status,
            Amount: b.invoice?.totalAmount || 'N/A'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
        XLSX.writeFile(workbook, "My_Bookings.xlsx");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("My Bookings Report", 14, 22);
        const data = filteredItems.map(b => [
            b.service?.title,
            b.serviceProvider?.username,
            new Date(b.scheduledDate).toLocaleDateString(),
            b.status,
            b.invoice?.totalAmount ? `Rs. ${b.invoice.totalAmount}` : '-'
        ]);
        autoTable(doc, {
            head: [['Service', 'Provider', 'Date', 'Status', 'Amount']],
            body: data,
            startY: 30,
        });
        doc.save('My_Bookings_Report.pdf');
    };


    const subHeaderComponentMemo = React.useMemo(() => {
        return (
            <div className="flex flex-col md:flex-row items-center justify-between w-full p-4 gap-4 bg-white">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search Service, Provider..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors">
                        Excel
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                        PDF
                    </button>
                </div>
            </div>
        );
    }, [filterText, filteredItems]);

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
                            data={filteredItems}
                            pagination
                            paginationResetDefaultPage={resetPaginationToggle}
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[5, 10, 20]}
                            customStyles={customStyles}
                            subHeader
                            subHeaderComponent={subHeaderComponentMemo}
                            persistTableHead
                            noDataComponent={
                                <div className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                                        <p className="text-lg">No bookings found {filterText && "matching your search"}.</p>
                                        {!filterText && (
                                            <button onClick={() => navigate('/services')} className="mt-2 text-blue-600 font-medium hover:underline">
                                                Browse Services
                                            </button>
                                        )}
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
