import React, { useState, useEffect } from 'react';
import HomeLayout from '../layouts/HomeLayout';
import { getMe } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle, CheckCircle, Upload, Briefcase, MapPin } from 'lucide-react';
import { getMyProviderProfile, updateProviderBio, updateProviderServices } from '../api/providers';
import { getProviderBookings, updateBookingStatus } from '../api/bookings';
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
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'overview' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <User className="w-5 h-5" /> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'profile' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> Professional Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'services' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> My Services
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bookings')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'bookings' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
                                    >
                                        <Briefcase className="w-5 h-5" /> Bookings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('documents')}
                                        className={`px-6 py-4 text-left font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors ${activeTab === 'documents' ? 'bg-black text-white hover:bg-black' : 'text-gray-600'}`}
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

                                    {/* Stats from backend */}
                                    {isProfileComplete && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Bookings</h3>
                                                <p className="text-3xl font-bold text-soft-black">0</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                                <h3 className="text-gray-500 text-sm font-medium mb-1">Earnings</h3>
                                                <p className="text-3xl font-bold text-soft-black">₹0</p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                                <h3 className="text-gray-500 text-sm font-medium mb-1">Rating</h3>
                                                <p className="text-3xl font-bold text-soft-black">
                                                    {providerDetails?.rating || 0}
                                                    <span className="text-sm font-normal text-gray-400 ml-1">
                                                        ({providerDetails?.totalReviews || 0} reviews)
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <h2 className="text-xl font-bold text-soft-black mb-6">Professional Details</h2>
                                    <form className="space-y-6" onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        try {
                                            const formData = new FormData(e.target);
                                            // Handle emergency contact manually as it needs to be JSON
                                            const emergencyContact = {
                                                name: formData.get('ec_name'),
                                                phone: formData.get('ec_phone'),
                                                relation: formData.get('ec_relation')
                                            };
                                            formData.set('emergencyContact', JSON.stringify(emergencyContact));

                                            // Remove individual EC fields to clean up
                                            formData.delete('ec_name');
                                            formData.delete('ec_phone');
                                            formData.delete('ec_relation');

                                            const response = await updateProviderBio(formData);
                                            if (response.success) {
                                                setProviderDetails(response.provider);
                                                alert('Profile updated successfully!');
                                            } else {
                                                alert('Failed to update profile: ' + response.error);
                                            }
                                        } catch (err) {
                                            console.error("Error updating profile", err);
                                            alert('An error occurred while updating profile');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-soft-black mb-2">Phone Number</label>
                                                <input
                                                    name="phone"
                                                    defaultValue={providerDetails?.phone}
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
                                            <label className="block text-sm font-semibold text-soft-black mb-2">Address</label>
                                            <textarea
                                                name="address"
                                                defaultValue={providerDetails?.address}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none h-24 resize-none"
                                                placeholder="Full residential address"
                                            ></textarea>
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
                                                        placeholder="e.g. Spouse, Father"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                                                Save Details
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <h2 className="text-xl font-bold text-soft-black mb-6">My Services</h2>
                                    <p className="text-gray-500 mb-6">Select the services you offer and provide a custom description for each.</p>

                                    <div className="space-y-8">
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

                                    <div className="flex justify-end pt-6 sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 border-t mt-4">
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
                                            Save Services
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="bg-white p-8 rounded-3xl shadow-sm">
                                    <h2 className="text-xl font-bold text-soft-black mb-6">Verification Documents</h2>
                                    <p className="text-gray-500 mb-6">Upload clear copies of your documents. You can upload multiple files for certificates if needed.</p>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        try {
                                            const formData = new FormData(e.target);
                                            // Append existing data to not overwrite bio with empty
                                            // Note: Backend might need logic to partial update, or we send everything.
                                            // The backend controller for updateProviderBio takes bio fields + files.
                                            // If we only send files, we might wipe bio fields if not careful?
                                            // Controller code: updateData = { phone: req.body.phone ... }
                                            // It uses req.body.phone directly. If undefined, it might set to undefined.
                                            // So we must include current bio data in this form submission too!
                                            // Hidden inputs are easiest way.

                                            const response = await updateProviderBio(formData);
                                            if (response.success) {
                                                setProviderDetails(response.provider);
                                                alert('Documents uploaded successfully! Status is pending verification.');
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
                                        <input type="hidden" name="address" value={providerDetails?.address || ''} />
                                        <input type="hidden" name="experience" value={providerDetails?.experience || ''} />
                                        <input type="hidden" name="nativePlace" value={providerDetails?.nativePlace || ''} />
                                        <input type="hidden" name="currentPlace" value={providerDetails?.currentPlace || ''} />
                                        <input type="hidden" name="emergencyContact" value={JSON.stringify(providerDetails?.emergencyContact || {})} />

                                        <div className="space-y-6">
                                            {/* ID Proof */}
                                            <div className="border border-gray-200 rounded-2xl p-6">
                                                <h3 className="font-semibold text-soft-black mb-2">ID Proof</h3>
                                                <p className="text-xs text-gray-500 mb-4">Aadhaar, PAN, or Driving License</p>

                                                {providerDetails?.idProofs?.length > 0 && (
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {providerDetails.idProofs.map((file, idx) => (
                                                            <div key={idx} className="bg-gray-100 px-3 py-1 text-xs rounded-full flex items-center gap-2">
                                                                <CheckCircle className="w-3 h-3 text-green-600" /> Document {idx + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <input type="file" name="idProof" multiple className="hidden" accept="image/*,.pdf" />
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
                                                    <span className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</span>
                                                </label>
                                            </div>

                                            {/* Address Proof */}
                                            <div className="border border-gray-200 rounded-2xl p-6">
                                                <h3 className="font-semibold text-soft-black mb-2">Address Proof</h3>
                                                <p className="text-xs text-gray-500 mb-4">Utility Bill, Rental Agreement</p>

                                                {providerDetails?.addressProofs?.length > 0 && (
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {providerDetails.addressProofs.map((file, idx) => (
                                                            <div key={idx} className="bg-gray-100 px-3 py-1 text-xs rounded-full flex items-center gap-2">
                                                                <CheckCircle className="w-3 h-3 text-green-600" /> Document {idx + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <input type="file" name="addressProof" multiple className="hidden" accept="image/*,.pdf" />
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
                                                </label>
                                            </div>

                                            {/* Certificates */}
                                            <div className="border border-gray-200 rounded-2xl p-6">
                                                <h3 className="font-semibold text-soft-black mb-2">Professional Certificates</h3>
                                                <p className="text-xs text-gray-500 mb-4">Training certificates, awards, etc.</p>

                                                {providerDetails?.certificates?.length > 0 && (
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {providerDetails.certificates.map((file, idx) => (
                                                            <div key={idx} className="bg-gray-100 px-3 py-1 text-xs rounded-full flex items-center gap-2">
                                                                <CheckCircle className="w-3 h-3 text-green-600" /> Document {idx + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <label className="block border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <input type="file" name="certificate" multiple className="hidden" accept="image/*,.pdf" />
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm font-medium text-gray-600 block">Click to upload files</span>
                                                </label>
                                            </div>

                                            <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors w-full shadow-lg">
                                                Upload Documents & Submit
                                            </button>
                                        </div>
                                    </form>
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

                                    {/* Upcoming Section */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4 text-green-700 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Upcoming Schedule
                                        </h3>
                                        {bookings.filter(b => b.status === 'accepted').length === 0 ? (
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
                                                                        <CheckCircle className="w-3 h-3" /> Confirmed
                                                                    </div>
                                                                </div>
                                                                {/* Contact Info (if available in schema/populate) */}
                                                                {booking.user?.email && (
                                                                    <div className="text-right text-sm text-gray-500">
                                                                        <p>Contact: {booking.user.email}</p>
                                                                        {booking.user?.phone && (
                                                                            <p className="font-medium text-gray-700">{booking.user.phone}</p>
                                                                        )}
                                                                    </div>
                                                                )}
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
            </div>
        </HomeLayout>
    );
};

export default ProviderDashboard;
