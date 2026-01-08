import React, { useState, useEffect } from 'react';
import HomeLayout from '../layouts/HomeLayout';

import { useNavigate } from 'react-router-dom';

import { User, AlertCircle, CheckCircle, Upload, Briefcase, MapPin, Trash2, X, Pencil, Edit2 } from 'lucide-react';
import { getMyProviderProfile, updateProviderBio, updateProviderServices, deleteProviderDocument } from '../api/providers';
import { getMe, updateProfile } from '../api/auth';
import { getProviderBookings, updateBookingStatus, completeBooking } from '../api/bookings';
import { getAllServices } from '../api/services';

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [providerDetails, setProviderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, profile, services, documents

    // New state for Services Tab
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceDescriptions, setServiceDescriptions] = useState({});
    const [bookings, setBookings] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState({
        idProof: [],
        addressProof: [],
        certificate: []
    });

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
                                    if (!window.confirm('Delete this document?')) return;
                                    try {
                                        const data = await deleteProviderDocument({ type, filePath: file });
                                        if (data.success) {
                                            setProviderDetails(data.provider);
                                        } else {
                                            alert(data.error || 'Failed to delete');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error deleting document');
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

    // State for Completion Modal
    const [activeBookingForCompletion, setActiveBookingForCompletion] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({ servicePrice: '', serviceCharge: '' });

    // UI State for Editing
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingServices, setIsEditingServices] = useState(false);
    const [isEditingDocuments, setIsEditingDocuments] = useState(false);

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
                        <CheckCircle className="w-5 h-5" /> Verified Provider
                    </div>
                );
            case 'rejected':
                return (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5" /> Application Rejected
                    </div>
                );
            default:
                return (
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5" /> Verification Pending
                    </div>
                );
        }
    };

    return (
        <HomeLayout>
            <div className="bg-grey-50 min-h-screen py-10 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:mt-18">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-soft-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-soft-black">Welcome, {user?.username}!</h1>
                                <p className="text-gray-500">Service Provider Dashboard</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {getStatusBadge()}
                            <button className="bg-soft-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                View Public Profile
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
                                        <User className="w-5 h-5" /> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'profile' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> Professional Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'services' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> My Services
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bookings')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'bookings' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> Bookings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('documents')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 hover:text-black transition-colors ${activeTab === 'documents' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Upload className="w-5 h-5" /> Documents & Verification
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {!isProfileComplete && (
                                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 text-center">
                                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-xl font-bold text-soft-black mb-2">Complete Your Registration</h2>
                                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                You need to complete your professional profile and upload verification documents to start receiving bookings.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('profile')}
                                                className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
                                            >
                                                Complete Profile Now
                                            </button>
                                        </div>
                                    )}


                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-soft-black">Professional Details</h2>
                                        {!isEditingProfile && (
                                            <button
                                                onClick={() => setIsEditingProfile(true)}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" /> Edit Details
                                            </button>
                                        )}
                                    </div>

                                    {!isEditingProfile ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                {/* Contact & Personal */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                                        <div className="space-y-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-600" /></div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                                                                    <p className="font-semibold text-soft-black">{user?.username}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gray-50 rounded-lg"><CheckCircle className="w-4 h-4 text-gray-600" /></div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                                                                    <p className="font-semibold text-soft-black">{user?.contactNumber || 'Not provided'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="w-4 h-4 text-gray-600" /></div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
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
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location Details</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Native Place</p>
                                                                <p className="font-semibold text-soft-black">{providerDetails?.nativePlace || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">Current City</p>
                                                                <p className="font-semibold text-soft-black">{providerDetails?.currentPlace || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Professional & Emergency */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Work Profile</h3>
                                                        <div className="space-y-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-gray-50 rounded-lg"><Briefcase className="w-4 h-4 text-gray-600" /></div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-0.5">Experience</p>
                                                                    <p className="font-semibold text-soft-black">{providerDetails?.experience ? `${providerDetails.experience} Years` : 'Not added'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emergency Contact</h3>
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
                                                    alert('Profile updated successfully!');
                                                } else {
                                                    alert('Failed to update profile details: ' + response.error);
                                                }
                                            } catch (err) {
                                                console.error("Error updating profile", err);
                                                alert('An error occurred while updating profile');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}>
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-sm text-gray-500">Update your information below</p>
                                                <button type="button" onClick={() => setIsEditingProfile(false)} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-soft-black mb-2">Phone Number</label>
                                                    <input
                                                        name="phone"
                                                        defaultValue={user?.contactNumber || ''}
                                                        type="tel"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                        placeholder="Enter phone number"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-soft-black mb-2">Experience (Years)</label>
                                                    <input
                                                        name="experience"
                                                        defaultValue={providerDetails?.experience}
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                        placeholder="e.g. 5"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-soft-black mb-2">Native Place</label>
                                                    <input
                                                        name="nativePlace"
                                                        defaultValue={providerDetails?.nativePlace}
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                        placeholder="City, State"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-soft-black mb-2">Current Location</label>
                                                    <input
                                                        name="currentPlace"
                                                        defaultValue={providerDetails?.currentPlace}
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                        placeholder="City, Area"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-soft-black mb-2">Street Address</label>
                                                <input
                                                    name="street"
                                                    defaultValue={user?.address?.street || providerDetails?.address}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none mb-4"
                                                    placeholder="House/Flat No, Street Name"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">City</label>
                                                        <input
                                                            name="city"
                                                            defaultValue={user?.address?.city}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="City"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">State</label>
                                                        <input
                                                            name="state"
                                                            defaultValue={user?.address?.state}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="State"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-soft-black mb-2">Pincode</label>
                                                        <input
                                                            name="postalCode"
                                                            defaultValue={user?.address?.postalCode}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="Postal Code"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-6 mt-2">
                                                <h3 className="text-lg font-semibold text-soft-black mb-4">Emergency Contact</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                                        <input
                                                            name="ec_name"
                                                            defaultValue={providerDetails?.emergencyContact?.name}
                                                            type="text"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="Contact Name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                                                        <input
                                                            name="ec_phone"
                                                            defaultValue={providerDetails?.emergencyContact?.phone}
                                                            type="tel"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="Contact Phone"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Relation</label>
                                                        <input
                                                            name="ec_relation"
                                                            defaultValue={providerDetails?.emergencyContact?.relation}
                                                            type="text"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
                                                            placeholder="e.g. Spouse"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 gap-3">
                                                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                                    Cancel
                                                </button>
                                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-soft-black">My Services</h2>
                                        {!isEditingServices && (
                                            <button
                                                onClick={() => setIsEditingServices(true)}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" /> Manage Services
                                            </button>
                                        )}
                                    </div>

                                    {!isEditingServices ? (
                                        <div className="animate-in fade-in">
                                            {selectedServices.length === 0 ? (
                                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 font-medium">No services added yet.</p>
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
                                            <p className="text-gray-500">Select the services you offer and provide details.</p>

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
                                                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Custom Description/Pricing Note</label>
                                                                                        <textarea
                                                                                            value={serviceDescriptions[service._id] || ''}
                                                                                            onChange={(e) => setServiceDescriptions(prev => ({
                                                                                                ...prev,
                                                                                                [service._id]: e.target.value
                                                                                            }))}
                                                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-black outline-none text-sm bg-white"
                                                                                            placeholder={`Describe your specific offering for ${service.title}...`}
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
                                                    Cancel
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
                                                                alert('Services updated successfully!');
                                                            } else {
                                                                alert('Failed to update services: ' + response.error);
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Error updating services');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                                >
                                                    Save Select Services
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-soft-black">Verification Documents</h2>
                                        {!isEditingDocuments && (
                                            <button
                                                onClick={() => setIsEditingDocuments(true)}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" /> Manage Documents
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 mb-6">Upload clear copies of your documents. You can upload multiple files for certificates if needed.</p>

                                    {/* Document Display Helper */}
                                    {/* Document Display Helper - REFACTORED */}
                                    {!isEditingDocuments ? (
                                        <div className="space-y-6">
                                            {['idProofs', 'addressProofs', 'certificates'].map(key => {
                                                const label = key === 'idProofs' ? 'ID Proof' : key === 'addressProofs' ? 'Address Proof' : 'Professional Certificates';
                                                const docs = providerDetails?.[key];

                                                return (
                                                    <div key={key} className="border border-gray-100 rounded-2xl p-6">
                                                        <h3 className="font-semibold text-soft-black mb-2">{label}</h3>
                                                        {docs && docs.length > 0 ? (
                                                            renderDocs(docs, key, label)
                                                        ) : (
                                                            <p className="text-gray-400 italic text-sm">No documents uploaded</p>
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
                                                    alert('Documents uploaded successfully!');
                                                } else {
                                                    alert('Failed to upload documents: ' + response.error);
                                                }
                                            } catch (err) {
                                                console.error("Error uploading documents", err);
                                                alert('Error uploading documents');
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
                                                        ID Proof
                                                        {renderDocs(providerDetails?.idProofs, 'idProofs', 'ID Proof')}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-4">Aadhaar, PAN, or Driving License</p>
                                                    <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                        <input type="file" name="idProof" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
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
                                                        Address Proof
                                                        {renderDocs(providerDetails?.addressProofs, 'addressProofs', 'Address Proof')}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-4">Utility Bill, Rental Agreement</p>
                                                    <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                        <input type="file" name="addressProof" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
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
                                                        Professional Certificates
                                                        {renderDocs(providerDetails?.certificates, 'certificates', 'Certificate')}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-4">Training certificates, awards, etc.</p>
                                                    <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                        <input type="file" name="certificate" multiple className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
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
                                                    Cancel
                                                </button>
                                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                                                    Upload Documents & Submit
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <h2 className="text-xl font-bold text-soft-black mb-6">Booking Requests</h2>

                                    {/* Pending Section */}
                                    <div className="mb-8">
                                        <h3 className="font-semibold text-lg mb-4 text-amber-600 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> Pending Requests
                                        </h3>
                                        {bookings.filter(b => b.status === 'pending').length === 0 ? (
                                            <p className="text-gray-400 text-sm italic">No pending requests.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookings.filter(b => b.status === 'pending').map(booking => (
                                                    <div key={booking._id} className="border border-amber-100 bg-amber-50 rounded-2xl p-6">
                                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-soft-black mb-1">{booking.service?.title || 'Unknown Service'}</h4>
                                                                <p className="text-sm text-gray-700 font-medium mb-1">Customer: {booking.user?.username || 'Guest'}</p>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    Date: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
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
                                                                    Accept
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
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Active Bookings Section */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4 text-green-700 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Active Bookings
                                        </h3>
                                        {bookings.filter(b => b.status === 'accepted' || b.status === 'work_completed').length === 0 ? (
                                            <p className="text-gray-400 text-sm italic">No upcoming bookings.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookings.filter(b => b.status === 'accepted')
                                                    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
                                                    .map(booking => (
                                                        <div key={booking._id} className="border border-green-100 bg-white rounded-2xl p-6 shadow-sm">
                                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                                <div>
                                                                    <h4 className="font-bold text-soft-black mb-1">{booking.service?.title}</h4>
                                                                    <p className="text-sm text-gray-700 font-medium mb-1">Customer: {booking.user?.username}</p>
                                                                    <p className="text-sm text-gray-600 mb-2">
                                                                        Date: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
                                                                        {' '}
                                                                        {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                    </p>
                                                                    <div className="mt-2 text-xs text-green-700 font-bold px-3 py-1 bg-green-50 rounded-full inline-flex items-center gap-1 border border-green-100">
                                                                        <CheckCircle className="w-3 h-3" /> {booking.status === 'in_progress' ? 'In Progress' : 'Confirmed'}
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col items-end gap-2">
                                                                    {booking.user?.phone && (
                                                                        <div className="text-right text-sm text-gray-500 mb-2">
                                                                            <p className="font-medium text-gray-700">Contact: {booking.user.phone}</p>
                                                                        </div>
                                                                    )}
                                                                    {booking.status === 'work_completed' ? (
                                                                        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-2">
                                                                            <Clock className="w-3 h-3" /> Waiting for Confirmation
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                setActiveBookingForCompletion(booking);
                                                                                setInvoiceForm({ servicePrice: '', serviceCharge: '' });
                                                                            }}
                                                                            className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md"
                                                                        >
                                                                            Complete Job
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* INVOICE MODAL */}
                {activeBookingForCompletion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-soft-black">Complete Job & Invoice</h3>
                                <button onClick={() => setActiveBookingForCompletion(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Price (₹)</label>
                                    <input
                                        type="number"
                                        value={invoiceForm.servicePrice}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, servicePrice: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none text-lg font-medium"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Charge / Extra (₹)</label>
                                    <input
                                        type="number"
                                        value={invoiceForm.serviceCharge}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceCharge: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-black outline-none text-lg font-medium"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{Number(invoiceForm.servicePrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span>Service Charge</span>
                                        <span>₹{Number(invoiceForm.serviceCharge || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center font-bold text-lg text-soft-black">
                                        <span>Total Amount</span>
                                        <span>₹{(Number(invoiceForm.servicePrice || 0) + Number(invoiceForm.serviceCharge || 0)).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!invoiceForm.servicePrice) return alert("Please enter service price");

                                        const res = await completeBooking(activeBookingForCompletion._id, {
                                            servicePrice: invoiceForm.servicePrice,
                                            serviceCharge: invoiceForm.serviceCharge || 0
                                        });

                                        if (res.success) {
                                            setBookings(prev => prev.map(b => b._id === activeBookingForCompletion._id ? { ...res.booking, service: b.service, user: b.user } : b));
                                            setActiveBookingForCompletion(null);
                                            alert("Job completed and invoice generated!");
                                        } else {
                                            alert(res.error);
                                        }
                                    }}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Generate Invoice & Complete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default ProviderDashboard;
