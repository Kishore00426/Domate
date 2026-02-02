import React, { useState, useEffect, useCallback, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HomeLayout from '../layouts/HomeLayout';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle, CheckCircle, Upload, Briefcase, MapPin, Trash2, X, Pencil, Edit2, Banknote, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMyProviderProfile, updateProviderBio, updateProviderServices, deleteProviderDocument } from '../api/providers';
import { getMe, updateProfile } from '../api/auth';
import { getProviderBookings, updateBookingStatus, completeBooking, updateBookingDetailsProvider } from '../api/bookings';
import { getAllServices } from '../api/services';
import DataTable from 'react-data-table-component';
import { ProviderDateCell, ProviderStatusCell } from '../components/ProviderBookingCells';

// ... (rest of imports)

// (ProviderBookingRow can be removed or kept if I completely replaced its usage inside columns cell renderers - I am keeping it for now as a reference or if some cells still use it, but my previous step replaced the table that used it. I will define inline cells for the columns to be self-contained in the new implementation)

const ProviderDashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [providerDetails, setProviderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookingTab, setBookingTab] = useState('current'); // Booking Sub-tab State
    const [bookings, setBookings] = useState([]);

    // Services State
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceDescriptions, setServiceDescriptions] = useState({});

    // Documents State
    const [selectedFiles, setSelectedFiles] = useState({
        idProof: [],
        addressProof: [],
        certificate: []
    });

    // Invoice / Completion State
    const [activeBookingForCompletion, setActiveBookingForCompletion] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({ servicePrice: '', serviceCharge: '' });
    const [activeBookingForEdit, setActiveBookingForEdit] = useState(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    const handleUpdateStatus = async () => {
        if (!activeBookingForEdit || !statusToUpdate) return;
        try {
            const res = await updateBookingStatus(activeBookingForEdit._id, statusToUpdate);
            if (res.success) {
                updateBookingInList({ ...activeBookingForEdit, status: statusToUpdate });
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
    const [isEditing, setIsEditing] = useState(false);
    const [bioForm, setBioForm] = useState("");

    // UI State for Editing
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingServices, setIsEditingServices] = useState(false);
    const [isEditingDocuments, setIsEditingDocuments] = useState(false);

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
                paddingLeft: '16px',
                paddingRight: '16px',
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
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        }
    };

    // Helper to update booking in local state (Memoized)
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
    }), [t, i18n.language]);


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
            cell: row => <ProviderDateCell booking={row} onUpdate={updateBookingInList} />,
            width: '200px'
        },
        {
            name: t('dashboard.status'),
            selector: row => row.status,
            sortable: true,
            cell: row => <ProviderStatusCell booking={row} onUpdate={updateBookingInList} statusConfig={statusConfig} />,
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
                                onClick={() => setActiveBookingForCompletion(row)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                title="View Invoice"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            ),
            right: true
        }
    ], [providerDetails, updateBookingInList, statusConfig, t, i18n.language]);

    // Search and Export Logic
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const filteredItems = bookings.filter(b => {
        // Tab Filter
        // 'pending' maps to Overview usually, but if we are in "Current" tab in Bookings, we should probably show them or just accepted/active. 
        // Let's assume 'current' = active (accepted, arrived, in_progress, work_completed)
        // 'all' = everything.

        if (bookingTab === 'all') return true;
        if (bookingTab === 'pending') return b.status === 'pending';

        const isCurrent = ['accepted', 'in_progress', 'arrived', 'work_completed'].includes(b.status);
        // If strict 'current', show isCurrent.
        if (bookingTab === 'current' && !isCurrent) return false;

        // Search Filter
        const searchText = filterText.toLowerCase();
        return (
            (b.service?.title?.toLowerCase() || '').includes(searchText) ||
            (b.user?.username?.toLowerCase() || '').includes(searchText) ||
            (b.status?.toLowerCase() || '').includes(searchText)
        );
    });

    const handleDownloadExcel = async () => {
        const XLSX = await import("xlsx");
        const worksheet = XLSX.utils.json_to_sheet(filteredItems.map(b => ({
            [t('dashboard.service')]: b.service?.title,
            [t('dashboard.customer')]: b.user?.username,
            [t('dashboard.date')]: new Date(b.scheduledDate).toLocaleDateString(),
            [t('dashboard.status')]: b.status,
            [t('dashboard.phoneNumber')]: b.user?.phone || 'N/A',
            [t('dashboard.amountINR')]: b.invoice?.totalAmount || 'N/A'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
        XLSX.writeFile(workbook, "Provider_Bookings.xlsx");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text(t('dashboard.reportTitle'), 14, 22);
        const data = filteredItems.map(b => [
            b.service?.title,
            b.user?.username,
            new Date(b.scheduledDate).toLocaleDateString(),
            b.status,
            b.invoice?.totalAmount ? `Rs. ${b.invoice.totalAmount}` : '-'
        ]);
        autoTable(doc, {
            head: [[t('dashboard.service'), t('dashboard.customer'), t('dashboard.date'), t('dashboard.status'), t('dashboard.amountINR')]],
            body: data,
            startY: 30,
        });
        doc.save('Provider_Bookings_Report.pdf');
    };

    const subHeaderComponentMemo = React.useMemo(() => {
        return (
            <div className="flex flex-col md:flex-row items-center justify-between w-full p-4 gap-4 bg-white">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder={t('dashboard.searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors">
                        {t('dashboard.excel')}
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                        {t('dashboard.pdf')}
                    </button>
                </div>
            </div>
        );
    }, [filterText, filteredItems, t, i18n.language]);






    const downloadInvoice = (booking) => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(t('dashboard.invoiceTitle'), 105, 20, null, null, "center");

        doc.setFontSize(10);
        doc.text(`${t('dashboard.invoiceNo')}: INV-${booking._id.slice(-6).toUpperCase()}`, 14, 30);
        doc.text(`${t('dashboard.date')}: ${new Date(booking.updatedAt).toLocaleDateString()}`, 14, 35);

        doc.setFontSize(12);
        doc.text(`${t('dashboard.billTo')}:`, 14, 50);
        doc.setFontSize(10);
        doc.text(`${t('dashboard.name')}: ${booking.user?.username || 'Customer'}`, 14, 56);
        if (booking.user?.phone) doc.text(`${t('dashboard.contactPhone')}: ${booking.user.phone}`, 14, 61);

        doc.setFontSize(12);
        doc.text(`${t('dashboard.serviceDetails')}:`, 14, 75);
        doc.setFontSize(10);
        doc.text(`${t('dashboard.service')}: ${booking.service?.title}`, 14, 81);
        doc.text(`${t('dashboard.provider')}: ${booking.serviceProvider?.username || 'Provider'}`, 14, 86);

        const tableColumn = [t('dashboard.description'), t('dashboard.amountINR')];
        const tableRows = [
            [t('dashboard.baseServicePrice'), `Rs. ${booking.invoice?.servicePrice}`],
            [t('dashboard.visitingFee') + " / " + t('dashboard.extraCharges'), `Rs. ${booking.invoice?.serviceCharge}`],
            [t('dashboard.gst') + " (18%)", `Rs. ${booking.invoice?.gst}`],
            [t('dashboard.totalAmount'), `Rs. ${booking.invoice?.totalAmount}`]
        ];

        doc.autoTable({
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] },
            foot: [[t('dashboard.grandTotal'), `Rs. ${booking.invoice?.totalAmount}`]],
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
        });

        doc.text(t('dashboard.thankYou'), 105, doc.lastAutoTable.finalY + 20, null, null, "center");

        doc.save(`Invoice_${booking._id.slice(-6)}.pdf`);
    };




    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files) {
            setSelectedFiles(prev => ({
                ...prev,
                [name]: [...prev[name], ...Array.from(files)]
            }));
        }
        // Clear value to allow selecting the same file again if needed (and since we manage state now)
        e.target.value = '';
    };

    const removeSelectedFile = (type, index) => {
        setSelectedFiles(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const renderDocs = (docs, type, label) => {
        if (!docs || docs.length === 0) return null;
        return (
            <div className="mb-4 flex flex-wrap gap-2">
                {docs.map((file, idx) => {
                    const fileName = file.split('/').pop() || `Document ${idx + 1}`;
                    return (
                        <div key={idx} className="bg-gray-100 pl-4 pr-2 py-2 text-sm rounded-full flex items-center gap-2 border border-gray-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-700 max-w-[150px] truncate" title={fileName}>{fileName}</span>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!window.confirm(t('dashboard.deleteDocConfirm'))) return;
                                    try {
                                        const data = await deleteProviderDocument({ type, filePath: file });
                                        if (data.success) {
                                            setProviderDetails(data.provider);
                                        } else {
                                            alert(data.error || t('dashboard.errorDeletingDoc'));
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert(t('dashboard.errorDeletingDoc'));
                                    }
                                }}
                                className="ml-1 p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };





    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getMe();
                if (userData.user.role !== 'service_provider') {
                    navigate('/home'); // Kick out if not provider
                    return;
                }
                setUser(userData.user);

                // Fetch all available services
                try {
                    const servicesResponse = await getAllServices();
                    if (servicesResponse.success) {
                        setAllServices(servicesResponse.services);
                    }
                } catch (e) { console.error(e); }

                // Fetch provider bookings
                try {
                    const bookingsRes = await getProviderBookings();
                    if (bookingsRes.success) {
                        setBookings(bookingsRes.bookings);
                    }
                } catch (e) { console.error("Error fetching bookings", e); }

                // Fetch provider specific details
                const profileResponse = await getMyProviderProfile();
                if (profileResponse.success) {
                    const provider = profileResponse.provider;
                    setProviderDetails(provider);

                    // Initialize local state
                    if (provider.services) {
                        setSelectedServices(provider.services.map(s => s._id || s));
                    }
                    if (provider.serviceDescriptions) {
                        const descriptions = {};
                        provider.serviceDescriptions.forEach(sd => {
                            descriptions[sd.serviceId] = sd.description;
                        });
                        setServiceDescriptions(descriptions);
                    }
                }
            } catch (err) {
                console.error("Failed to load user or provider details", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const isProfileComplete = providerDetails &&
        providerDetails.phone &&
        providerDetails.address &&
        providerDetails.documents?.length > 0; // Simplified check, refine as needed

    const approvalStatus = providerDetails?.approvalStatus || 'pending';

    const getStatusBadge = () => {
        switch (approvalStatus) {
            case 'approved':
                return (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <CheckCircle className="w-5 h-5" /> {t('dashboard.verifiedProvider')}
                    </div>
                );
            case 'rejected':
                return (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5" /> {t('dashboard.applicationRejected')}
                    </div>
                );
            default:
                return (
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5" /> {t('dashboard.verificationPending')}
                    </div>
                );
        }
    };



    return (
        <HomeLayout>
            <div className="bg-grey-50 min-h-screen py-10 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-24 md:mt-18">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-soft-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-soft-black">{t('dashboard.welcome')}, {user?.username}!</h1>
                                <p className="text-gray-500">{t('dashboard.providerDashboard')}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {getStatusBadge()}
                            <button className="bg-soft-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                {t('dashboard.viewPublicProfile')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <nav className="flex flex-col">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'overview' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <User className="w-5 h-5" /> {t('dashboard.overview')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'profile' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> {t('dashboard.professionalDetails')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'services' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> {t('dashboard.myServices')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bookings')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'bookings' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> {t('dashboard.bookings')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('documents')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'documents' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Upload className="w-5 h-5" /> {t('dashboard.documentsVerification')}
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {activeTab === 'overview' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm min-h-[300px]">
                                    <h2 className="text-xl font-bold text-soft-black mb-6">{t('dashboard.overview')}</h2>

                                    {/* Pending Requests Section */}
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-lg mb-4 text-amber-600 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> {t('dashboard.pendingRequests')}
                                        </h3>

                                        {bookings.filter(b => b.status === 'pending').length > 0 ? (
                                            <div className="space-y-4">
                                                {bookings.filter(b => b.status === 'pending').map(booking => (
                                                    <div key={booking._id} className="border border-amber-100 bg-amber-50 rounded-2xl p-6">
                                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-soft-black mb-1">{booking.service?.title || 'Unknown Service'}</h4>
                                                                <p className="text-sm text-gray-700 font-medium mb-1">{t('dashboard.customer')}: {booking.user?.username || 'Guest'}</p>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {t('dashboard.date')}: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
                                                                    {' '}
                                                                    {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                </p>
                                                                {booking.notes && (
                                                                    <p className="text-sm text-gray-500 bg-white/60 p-3 rounded-lg border border-amber-100 italic">" {booking.notes} "</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm('Accept this booking?')) return;
                                                                        const res = await updateBookingStatus(booking._id, 'accepted');
                                                                        if (res.success) {
                                                                            setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'accepted' } : b));
                                                                        } else {
                                                                            alert(res.error);
                                                                        }
                                                                    }}
                                                                    className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md transition-colors"
                                                                >
                                                                    {t('dashboard.accept')}
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm('Reject this booking?')) return;
                                                                        const res = await updateBookingStatus(booking._id, 'rejected');
                                                                        if (res.success) {
                                                                            setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'rejected' } : b));
                                                                        } else {
                                                                            alert(res.error);
                                                                        }
                                                                    }}
                                                                    className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-100 border border-red-100 transition-colors"
                                                                >
                                                                    {t('dashboard.reject')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                    <AlertCircle className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="font-medium">{t('dashboard.noPendingRequests')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {
                                activeTab === 'profile' && (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-soft-black">{t('dashboard.professionalDetails')}</h2>
                                            {!isEditingProfile && (
                                                <button
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" /> {t('dashboard.editDetails')}
                                                </button>
                                            )}
                                        </div>

                                        {!isEditingProfile ? (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                    {/* Contact & Personal */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.contactInfo')}</h3>
                                                            <div className="space-y-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-600" /></div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.fullName')}</p>
                                                                        <p className="font-semibold text-soft-black">{user?.username}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-gray-50 rounded-lg"><CheckCircle className="w-4 h-4 text-gray-600" /></div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.phoneNumber')}</p>
                                                                        <p className="font-semibold text-soft-black">{user?.contactNumber || 'Not provided'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="w-4 h-4 text-gray-600" /></div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.address')}</p>
                                                                        <p className="font-medium text-soft-black leading-relaxed">
                                                                            {user?.address ? (
                                                                                <>
                                                                                    {user.address.street && <span>{user.address.street}</span>}
                                                                                    {user.address.city && <span>, {user.address.city}</span>}
                                                                                    {user.address.state && <span>, {user.address.state}</span>}
                                                                                    {user.address.postalCode && <span> - {user.address.postalCode}</span>}
                                                                                </>
                                                                            ) : <span className="text-gray-400 italic">Address not provided</span>}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.locationDetails')}</h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-1">{t('dashboard.nativePlace')}</p>
                                                                    <p className="font-semibold text-soft-black">{providerDetails?.nativePlace || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-1">{t('dashboard.currentCity')}</p>
                                                                    <p className="font-semibold text-soft-black">{providerDetails?.currentPlace || '-'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Professional & Emergency */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.workProfile')}</h3>
                                                            <div className="space-y-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-gray-50 rounded-lg"><Briefcase className="w-4 h-4 text-gray-600" /></div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.experience')}</p>
                                                                        <p className="font-semibold text-soft-black">{providerDetails?.experience ? `${providerDetails.experience} Years` : 'Not added'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.emergencyContact')}</h3>
                                                            {providerDetails?.emergencyContact?.name ? (
                                                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                                                    <p className="font-bold text-soft-black mb-1">{providerDetails.emergencyContact.name}</p>
                                                                    <p className="text-sm text-gray-600 mb-1">{providerDetails.emergencyContact.relation}</p>
                                                                    <p className="text-sm font-mono font-medium text-soft-black">{providerDetails.emergencyContact.phone}</p>
                                                                </div>
                                                            ) : <p className="text-gray-400 italic">No emergency contact added</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <form className="space-y-6" onSubmit={async (e) => {
                                                e.preventDefault();
                                                setLoading(true);
                                                try {
                                                    const formData = new FormData(e.target);

                                                    // 1. Update User Profile (Phone & Address)
                                                    // We only send if values are present to avoid overwriting with null if logic differs
                                                    const contactNumber = formData.get('phone');
                                                    const street = formData.get('street');
                                                    const city = formData.get('city');
                                                    const state = formData.get('state');
                                                    const postalCode = formData.get('postalCode');

                                                    if (contactNumber || street || city || state || postalCode) {
                                                        const uRes = await updateProfile({
                                                            phone: contactNumber,
                                                            street,
                                                            city,
                                                            state,
                                                            postalCode
                                                        });
                                                        // Optimistically update user data
                                                        if (uRes.success) setUser(uRes.user);
                                                    }

                                                    // 2. Update Provider Details
                                                    const emergencyContact = {
                                                        name: formData.get('ec_name'),
                                                        phone: formData.get('ec_phone'),
                                                        relation: formData.get('ec_relation')
                                                    };
                                                    formData.set('emergencyContact', JSON.stringify(emergencyContact));
                                                    formData.delete('ec_name');
                                                    formData.delete('ec_phone');
                                                    formData.delete('ec_relation');

                                                    const response = await updateProviderBio(formData);
                                                    if (response.success) {
                                                        setProviderDetails(response.provider);
                                                        setIsEditingProfile(false);
                                                        alert(t('dashboard.profileUpdated'));
                                                    } else {
                                                        alert(t('dashboard.failedToUpdateProfile', { error: response.error }));
                                                    }
                                                } catch (err) {
                                                    console.error("Error updating profile", err);
                                                    alert(t('dashboard.errorUpdatingProfile'));
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <p className="text-sm text-gray-500">{t('dashboard.updateInfoInstruction')}</p>
                                                    <button type="button" onClick={() => setIsEditingProfile(false)} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">{t('dashboard.cancel')}</button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.phoneNumber')}</label>
                                                        <input
                                                            name="phone"
                                                            defaultValue={user?.contactNumber || ''}
                                                            type="tel"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder={t('dashboard.enterPhoneNumber')}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.experienceYears')}</label>
                                                        <input
                                                            name="experience"
                                                            defaultValue={providerDetails?.experience}
                                                            type="text"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder={t('dashboard.eg5')}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.nativePlace')}</label>
                                                        <input
                                                            name="nativePlace"
                                                            defaultValue={providerDetails?.nativePlace}
                                                            type="text"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder={t('dashboard.cityState')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.currentLocation')}</label>
                                                        <input
                                                            name="currentPlace"
                                                            defaultValue={providerDetails?.currentPlace}
                                                            type="text"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder={t('dashboard.cityArea')}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.streetAddress')}</label>
                                                    <input
                                                        name="street"
                                                        defaultValue={user?.address?.street || providerDetails?.address}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none mb-4"
                                                        placeholder={t('dashboard.houseFlatStreet')}
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.city')}</label>
                                                            <input
                                                                name="city"
                                                                defaultValue={user?.address?.city}
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.city')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.state')}</label>
                                                            <input
                                                                name="state"
                                                                defaultValue={user?.address?.state}
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.state')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-soft-black mb-2">{t('dashboard.pincode')}</label>
                                                            <input
                                                                name="postalCode"
                                                                defaultValue={user?.address?.postalCode}
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.postalCodePlaceholder')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-6 mt-2">
                                                    <h3 className="text-lg font-semibold text-soft-black mb-4">{t('dashboard.emergencyContact')}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('dashboard.contactName')}</label>
                                                            <input
                                                                name="ec_name"
                                                                defaultValue={providerDetails?.emergencyContact?.name}
                                                                type="text"
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.contactName')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('dashboard.contactPhone')}</label>
                                                            <input
                                                                name="ec_phone"
                                                                defaultValue={providerDetails?.emergencyContact?.phone}
                                                                type="tel"
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.contactPhone')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('dashboard.relation')}</label>
                                                            <input
                                                                name="ec_relation"
                                                                defaultValue={providerDetails?.emergencyContact?.relation}
                                                                type="text"
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                                placeholder={t('dashboard.egSpouse')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4 gap-3">
                                                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                                        {t('dashboard.cancel')}
                                                    </button>
                                                    <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                                        {t('dashboard.saveChanges')}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )
                            }

                            {
                                activeTab === 'services' && (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-soft-black">{t('dashboard.myServices')}</h2>
                                            {!isEditingServices && (
                                                <button
                                                    onClick={() => setIsEditingServices(true)}
                                                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" /> {t('dashboard.manageServices')}
                                                </button>
                                            )}
                                        </div>

                                        {!isEditingServices ? (
                                            <div className="animate-in fade-in">
                                                {selectedServices.length === 0 ? (
                                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-gray-500 font-medium">{t('dashboard.noServicesAdded')}</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                        {allServices.filter(s => selectedServices.includes(s._id)).map(service => (
                                                            <div key={service._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start justify-between group hover:border-black transition-colors">
                                                                <div>
                                                                    <h4 className="font-bold text-soft-black">{service.title}</h4>
                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md mt-1 inline-block">{service.category?.name}</span>
                                                                    {serviceDescriptions[service._id] && (
                                                                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg italic text-left">
                                                                            "{serviceDescriptions[service._id]}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <p className="text-gray-500">{t('dashboard.selectServicesInstruction')}</p>

                                                <div className="space-y-8 animate-in fade-in">
                                                    {/* Group services by category */}
                                                    {Object.values(allServices.reduce((acc, service) => {
                                                        const catName = service.category?.name || 'Other';
                                                        if (!acc[catName]) acc[catName] = [];
                                                        acc[catName].push(service);
                                                        return acc;
                                                    }, {})).map((group, idx) => (
                                                        <div key={idx} className="border border-gray-100 rounded-2xl p-6">
                                                            <h3 className="font-semibold text-lg mb-4 text-soft-black">
                                                                {group[0]?.category?.name || 'Other'}
                                                            </h3>
                                                            <div className="space-y-4">
                                                                {group.map(service => {
                                                                    const isSelected = selectedServices.includes(service._id);
                                                                    return (
                                                                        <div key={service._id} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                                                                            <div className="flex items-start gap-3">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            setSelectedServices(prev => [...prev, service._id]);
                                                                                        } else {
                                                                                            setSelectedServices(prev => prev.filter(id => id !== service._id));
                                                                                        }
                                                                                    }}
                                                                                    className="mt-1 w-5 h-5 accent-black"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-medium text-soft-black">{service.title}</h4>
                                                                                    <p className="text-xs text-gray-500 mb-2">{service.category?.name}</p>

                                                                                    {isSelected && (
                                                                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('dashboard.customDescription')}</label>
                                                                                            <textarea
                                                                                                value={serviceDescriptions[service._id] || ''}
                                                                                                onChange={(e) => setServiceDescriptions(prev => ({
                                                                                                    ...prev,
                                                                                                    [service._id]: e.target.value
                                                                                                }))}
                                                                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-black outline-none text-sm bg-white"
                                                                                                placeholder={t('dashboard.describeOffering', { service: service.title })}
                                                                                                rows="2"
                                                                                            ></textarea>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-end pt-6 sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 border-t mt-4 gap-3">
                                                    <button
                                                        onClick={() => setIsEditingServices(false)}
                                                        className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        {t('dashboard.cancel')}
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            try {
                                                                // Prepare payload
                                                                const payload = {
                                                                    services: selectedServices,
                                                                    serviceDescriptions: Object.entries(serviceDescriptions)
                                                                        .filter(([id, desc]) => selectedServices.includes(id) && desc.trim())
                                                                        .map(([id, desc]) => ({ serviceId: id, description: desc }))
                                                                };

                                                                const response = await updateProviderServices(payload);
                                                                if (response.success) {
                                                                    setProviderDetails(response.provider);
                                                                    setIsEditingServices(false);
                                                                    alert(t('dashboard.servicesUpdated'));
                                                                } else {
                                                                    alert(t('dashboard.failedToUpdateServices', { error: response.error }));
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert(t('dashboard.errorUpdatingServices'));
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                                    >
                                                        {t('dashboard.saveServices')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            {
                                activeTab === 'documents' && (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-soft-black">{t('dashboard.verificationDocuments')}</h2>
                                            {!isEditingDocuments && (
                                                <button
                                                    onClick={() => setIsEditingDocuments(true)}
                                                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" /> {t('dashboard.manageDocuments')}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-500 mb-6">{t('dashboard.uploadInstruction')}</p>

                                        {/* Document Display Helper */}
                                        {/* Document Display Helper - REFACTORED */}
                                        {!isEditingDocuments ? (
                                            <div className="space-y-6">
                                                {['idProofs', 'addressProofs', 'certificates'].map(key => {
                                                    const label = key === 'idProofs' ? t('dashboard.idProof') : key === 'addressProofs' ? t('dashboard.addressProof') : t('dashboard.certificates');
                                                    const docs = providerDetails?.[key];

                                                    return (
                                                        <div key={key} className="border border-gray-100 rounded-2xl p-6">
                                                            <h3 className="font-semibold text-soft-black mb-2">{label}</h3>
                                                            {docs && docs.length > 0 ? (
                                                                renderDocs(docs, key, label)
                                                            ) : (
                                                                <p className="text-gray-400 italic text-sm">{t('dashboard.noDocuments')}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                setLoading(true);
                                                try {
                                                    const formData = new FormData(e.target);
                                                    formData.delete('idProof');
                                                    formData.delete('addressProof');
                                                    formData.delete('certificate');

                                                    selectedFiles.idProof.forEach(file => formData.append('idProof', file));
                                                    selectedFiles.addressProof.forEach(file => formData.append('addressProof', file));
                                                    selectedFiles.certificate.forEach(file => formData.append('certificate', file));

                                                    const response = await updateProviderBio(formData);
                                                    if (response.success) {
                                                        setProviderDetails(response.provider);
                                                        setSelectedFiles({ idProof: [], addressProof: [], certificate: [] });
                                                        setIsEditingDocuments(false);
                                                        alert(t('dashboard.docsUploadedSuccess'));
                                                    } else {
                                                        alert(t('dashboard.failedToUploadDocs', { error: response.error }));
                                                    }
                                                } catch (err) {
                                                    console.error("Error uploading documents", err);
                                                    alert(t('dashboard.errorUploadingDocs'));
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}>
                                                {/* Hidden fields to preserve bio data */}
                                                <input type="hidden" name="phone" value={providerDetails?.phone || ''} />
                                                <input type="hidden" name="street" value={providerDetails?.address || ''} />
                                                <input type="hidden" name="experience" value={providerDetails?.experience || ''} />
                                                <input type="hidden" name="nativePlace" value={providerDetails?.nativePlace || ''} />
                                                <input type="hidden" name="currentPlace" value={providerDetails?.currentPlace || ''} />
                                                <input type="hidden" name="emergencyContact" value={JSON.stringify(providerDetails?.emergencyContact || {})} />

                                                <div className="space-y-6">
                                                    {/* ID Proof Input */}
                                                    <div className="border border-gray-200 rounded-2xl p-6">
                                                        <h3 className="font-semibold text-soft-black mb-2 flex items-center justify-between">
                                                            {t('dashboard.idProof')}
                                                            {renderDocs(providerDetails?.idProofs, 'idProofs', t('dashboard.idProof'))}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mb-4">{t('dashboard.idProofHint')}</p>
                                                        <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                            <input type="file" name="idProof" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <span className="text-sm font-medium text-gray-600 block">{t('dashboard.clickToUpload')}</span>
                                                        </label>
                                                        {selectedFiles.idProof.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {selectedFiles.idProof.map((file, i) => (
                                                                    <div key={i} className="bg-gray-100 pl-4 pr-2 py-2 text-sm rounded-full flex items-center gap-2 border border-gray-200">
                                                                        <span className="font-medium text-gray-700 max-w-[150px] truncate" title={file.name}>{file.name}</span>
                                                                        <button type="button" onClick={() => removeSelectedFile('idProof', i)} className="ml-1 p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Address Proof Input */}
                                                    <div className="border border-gray-200 rounded-2xl p-6">
                                                        <h3 className="font-semibold text-soft-black mb-2 flex items-center justify-between">
                                                            {t('dashboard.addressProof')}
                                                            {renderDocs(providerDetails?.addressProofs, 'addressProofs', t('dashboard.addressProof'))}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mb-4">{t('dashboard.addressProofHint')}</p>
                                                        <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                            <input type="file" name="addressProof" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <span className="text-sm font-medium text-gray-600 block">{t('dashboard.clickToUpload')}</span>
                                                        </label>
                                                        {selectedFiles.addressProof.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {selectedFiles.addressProof.map((file, i) => (
                                                                    <div key={i} className="bg-gray-100 pl-4 pr-2 py-2 text-sm rounded-full flex items-center gap-2 border border-gray-200">
                                                                        <span className="font-medium text-gray-700 max-w-[150px] truncate" title={file.name}>{file.name}</span>
                                                                        <button type="button" onClick={() => removeSelectedFile('addressProof', i)} className="ml-1 p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Certificates Input */}
                                                    <div className="border border-gray-200 rounded-2xl p-6">
                                                        <h3 className="font-semibold text-soft-black mb-2 flex items-center justify-between">
                                                            {t('dashboard.certificates')}
                                                            {renderDocs(providerDetails?.certificates, 'certificates', t('dashboard.certificates'))}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mb-4">{t('dashboard.certificatesHint')}</p>
                                                        <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                            <input type="file" name="certificate" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <span className="text-sm font-medium text-gray-600 block">{t('dashboard.clickToUpload')}</span>
                                                        </label>
                                                        {selectedFiles.certificate.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {selectedFiles.certificate.map((file, i) => (
                                                                    <div key={i} className="bg-gray-100 pl-4 pr-2 py-2 text-sm rounded-full flex items-center gap-2 border border-gray-200">
                                                                        <span className="font-medium text-gray-700 max-w-[150px] truncate" title={file.name}>{file.name}</span>
                                                                        <button type="button" onClick={() => removeSelectedFile('certificate', i)} className="ml-1 p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>

                                                <div className="flex justify-end pt-4 gap-3">
                                                    <button type="button" onClick={() => setIsEditingDocuments(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                                        {t('dashboard.cancel')}
                                                    </button>
                                                    <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                                        {t('dashboard.uploadAndSubmit')}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                    </div>
                                )
                            }

                            {
                                activeTab === 'bookings' && (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-soft-black">{t('dashboard.myBookings')}</h2>

                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setBookingTab('pending')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bookingTab === 'pending' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {t('dashboard.tabPending')}
                                                </button>
                                                <button
                                                    onClick={() => setBookingTab('current')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bookingTab === 'current' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {t('dashboard.tabActive')}
                                                </button>
                                                <button
                                                    onClick={() => setBookingTab('all')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${bookingTab === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {t('dashboard.tabAll')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Active Bookings Section */}
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
                                            <DataTable
                                                columns={columns}
                                                data={filteredItems}
                                                pagination
                                                paginationResetDefaultPage={resetPaginationToggle}
                                                paginationPerPage={10}
                                                paginationRowsPerPageOptions={[5, 10, 20]}
                                                defaultSortFieldId="date"
                                                defaultSortAsc={false}
                                                customStyles={customStyles}
                                                subHeader
                                                subHeaderComponent={subHeaderComponentMemo}
                                                persistTableHead
                                                noDataComponent={
                                                    <div className="p-12 text-center text-gray-400">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Briefcase className="w-12 h-12 mb-3 text-gray-300" />
                                                            <p className="text-lg">{t('dashboard.noBookingsFound', { type: bookingTab })}</p>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </div>

                                    </div>

                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Edit Modal */}
            {activeBookingForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-soft-black">{t('dashboard.updateStatus')}</h3>
                            <button onClick={() => setActiveBookingForEdit(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">{t('dashboard.currentStatus')}</label>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[activeBookingForEdit.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                    {statusConfig[activeBookingForEdit.status]?.label || activeBookingForEdit.status}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">{t('dashboard.newStatus')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['pending', 'accepted', 'arrived', 'in_progress', 'work_completed', 'cancelled', 'rejected'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusToUpdate(s)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${statusToUpdate === s
                                                ? 'bg-black text-white border-black shadow-md scale-105'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {statusConfig[s]?.label || s.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateStatus}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                {t('dashboard.updateStatus')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVOICE MODAL (Create or View) */}
            {
                activeBookingForCompletion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-soft-black">
                                    {activeBookingForCompletion.status === 'completed' ? t('dashboard.invoiceDetails') : t('dashboard.completeJobInvoice')}
                                </h3>
                                <button onClick={() => { setActiveBookingForCompletion(null); setInvoiceForm({ servicePrice: '', serviceCharge: '' }); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
                                {/* Left Column: Context (2 cols) */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full">
                                        <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-6">{t('dashboard.bookingContext')}</h4>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('dashboard.serviceProvided')}</p>
                                                <p className="font-bold text-xl text-soft-black">{activeBookingForCompletion?.service?.title}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('dashboard.customerDetails')}</p>
                                                <p className="font-medium text-lg text-gray-700">{activeBookingForCompletion?.user?.username}</p>
                                                {activeBookingForCompletion?.user?.phone && <p className="text-sm text-gray-500">{activeBookingForCompletion.user.phone}</p>}
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('dashboard.invoiceNumber')}</p>
                                                <p className="font-mono text-lg text-gray-700 tracking-widest">INV-{activeBookingForCompletion?._id?.slice(-6).toUpperCase()}</p>
                                            </div>

                                            {activeBookingForCompletion.status === 'completed' && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('dashboard.dateIssued')}</p>
                                                    <p className="text-sm text-gray-700">{new Date(activeBookingForCompletion.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Financials (3 cols) */}
                                <div className="md:col-span-3">
                                    {activeBookingForCompletion.status === 'completed' ? (
                                        // READ ONLY VIEW
                                        <div className="bg-white rounded-2xl h-full flex flex-col justify-center">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                    <span className="text-gray-600 font-medium">{t('dashboard.baseServicePrice')}</span>
                                                    <span className="font-bold text-lg">₹{activeBookingForCompletion.invoice?.servicePrice}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                    <span className="text-gray-600 font-medium">{t('dashboard.visitingFee')}</span>
                                                    <span className="font-bold text-lg">₹{activeBookingForCompletion.invoice?.serviceCharge}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3 border-b border-gray-100 text-gray-500">
                                                    <span>{t('dashboard.gst')}</span>
                                                    <span>₹{activeBookingForCompletion.invoice?.gst}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-6 text-2xl font-bold bg-green-50 px-6 rounded-2xl mt-6 border border-green-100">
                                                    <span className="text-green-800">{t('dashboard.totalPaid')}</span>
                                                    <span className="text-green-700">₹{activeBookingForCompletion.invoice?.totalAmount}</span>
                                                </div>

                                                <button
                                                    onClick={() => downloadInvoice(activeBookingForCompletion)}
                                                    className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Upload className="w-4 h-4 rotate-180" /> {t('dashboard.downloadPdf')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // EDITABLE VIEW (For Generation)
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">{t('dashboard.baseServicePrice')} (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={invoiceForm.servicePrice}
                                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, servicePrice: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none text-lg font-bold"
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                                        {
                                                            ['electrician', 'plumber', 'carpenter'].some(c => activeBookingForCompletion?.service?.category?.name?.toLowerCase().includes(c))
                                                                ? t('dashboard.visitingFee')
                                                                : t('dashboard.extraCharges')
                                                        }
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={invoiceForm.serviceCharge}
                                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceCharge: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none text-lg font-bold"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">{t('dashboard.paymentSummary')}</h4>
                                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                                    <span>{t('dashboard.subtotal')}</span>
                                                    <span>₹{Number(invoiceForm.servicePrice || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                                    <span>{t('dashboard.extraCharges')}</span>
                                                    <span>₹{Number(invoiceForm.serviceCharge || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                                    <span>{t('dashboard.gst')}</span>
                                                    <span>₹{((Number(invoiceForm.servicePrice || 0) + Number(invoiceForm.serviceCharge || 0)) * 0.18).toFixed(2)}</span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center font-bold text-2xl text-soft-black">
                                                    <span>{t('dashboard.total')}</span>
                                                    <span>₹{((Number(invoiceForm.servicePrice || 0) + Number(invoiceForm.serviceCharge || 0)) * 1.18).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    if (!invoiceForm.servicePrice) return alert(t('dashboard.enterServicePrice'));

                                                    const res = await completeBooking(activeBookingForCompletion._id, {
                                                        servicePrice: invoiceForm.servicePrice,
                                                        serviceCharge: invoiceForm.serviceCharge || 0
                                                    });

                                                    if (res.success) {
                                                        setBookings(prev => prev.map(b => b._id === activeBookingForCompletion._id ? { ...res.booking, service: b.service, user: b.user } : b));
                                                        setActiveBookingForCompletion(null);
                                                        alert(t('dashboard.jobCompleted'));
                                                    } else {
                                                        alert(res.error);
                                                    }
                                                }}
                                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <span>{t('dashboard.generateInvoice')}</span>
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </HomeLayout>
    );
};

export default ProviderDashboard;
