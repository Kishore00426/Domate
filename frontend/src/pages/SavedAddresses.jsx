import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../api/address';
import { MapPin, Plus, Edit, Trash, ArrowLeft } from 'lucide-react';

const SavedAddresses = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India' // Default & Locked to India
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await getAddresses();
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAddress(editingId, formData);
            } else {
                await addAddress(formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ street: '', city: '', state: '', postalCode: '', country: 'India' });
            fetchAddresses();
        } catch (error) {
            console.error("Failed to save address", error);
            alert("Failed to save address: " + (error.response?.data?.error || error.message));
        }
    };

    const handleEditClick = (addr) => {
        setFormData({
            street: addr.street,
            city: addr.city,
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || 'India'
        });
        setEditingId(addr._id);
        setShowForm(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddress(id);
                fetchAddresses();
            } catch (error) {
                console.error("Failed to delete address", error);
            }
        }
    };

    return (
        <HomeLayout>
            <div className="pt-[100px] px-4 pb-20 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/account')}
                    className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-soft-black">Saved Addresses</h1>
                        <p className="text-gray-500">Manage your delivery and service locations</p>
                    </div>
                </div>

                {showForm ? (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 animate-in slide-in-from-top-4 duration-200">
                        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                        required
                                        placeholder="Flat / House No / Street Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                        required
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="Zip Code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        disabled
                                    >
                                        <option value="India">India</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Currently serving only in some parts of India.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingId(null); }}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/20"
                                >
                                    {editingId ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setFormData({ street: '', city: '', state: '', postalCode: '', country: 'India' });
                            setEditingId(null);
                            setShowForm(true);
                        }}
                        className="w-full mb-8 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                        <div key={addr._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                            <div className="pr-10">
                                <h3 className="font-semibold text-lg text-soft-black mb-1">{addr.street}</h3>
                                <p className="text-gray-500">{addr.city}, {addr.state}</p>
                                <p className="text-gray-500">{addr.postalCode}</p>
                                <p className="text-sm font-medium text-gray-400 mt-2 uppercase tracking-wide">{addr.country}</p>
                            </div>
                            <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditClick(addr)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(addr._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && addresses.length === 0 && !showForm && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-gray-50/50 rounded-3xl border border-gray-100">
                            <MapPin className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-lg">No addresses saved yet.</p>
                            <p className="text-sm">Add an address to make checkout faster.</p>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
};

export default SavedAddresses;
