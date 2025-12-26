import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, MoreVertical, FileText, X, Upload, Save, AlertCircle } from 'lucide-react';
import { getServices, createService, updateService, deleteService, getCategories } from '../../api/admin';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        duration: '',
        description: '',
        image: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servRes, catRes] = await Promise.all([getServices(), getCategories()]);
            setServices(servRes.success ? servRes.services : []);
            setCategories(catRes.success ? catRes.categories : []);
            setError(null);
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({
                name: item.name,
                category: item.category ? item.category._id : '',
                price: item.price || '',
                duration: item.duration || '',
                description: item.description || '',
                image: null
            });
        } else {
            setFormData({
                name: '',
                category: categories.length > 0 ? categories[0]._id : '',
                price: '',
                duration: '',
                description: '',
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', category: '', price: '', duration: '', description: '', image: null });
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('duration', formData.duration);
            data.append('description', formData.description);
            if (formData.image) data.append('image', formData.image);

            let response;
            if (editingItem) {
                response = await updateService(editingItem._id, data);
            } else {
                response = await createService(data);
            }

            if (response.success) {
                fetchData();
                handleCloseModal();
            } else {
                setError(response.error || 'Operation failed');
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteService(id);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete service');
        }
    };

    const getCategoryName = (catId) => {
        if (!catId) return 'N/A';
        // catId can be populated object or string id
        const id = typeof catId === 'object' ? catId._id : catId;
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : 'Unknown';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">Service Management</h1>
                    <p className="text-gray-500">Manage all services offered on the platform.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-soft-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Add New Service
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-soft-black outline-none bg-white text-gray-600">
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                        <Filter className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    {loading && services.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Service Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {services.map((service) => (
                                    <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-soft-black flex items-center gap-3">
                                            {service.image ? (
                                                <img src={service.image} alt={service.name} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                            )}
                                            {service.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{getCategoryName(service.category)}</td>
                                        <td className="px-6 py-4 font-semibold text-soft-black">₹{service.price}</td>
                                        <td className="px-6 py-4 text-gray-500">{service.duration}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(service)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(service._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-soft-black">
                                {editingItem ? 'Edit' : 'Create'} Service
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-soft-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all"
                                    placeholder="e.g. AC Foam Jet Service"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all"
                                        placeholder="599"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all"
                                    placeholder="e.g. 45 mins"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none"
                                    placeholder="Service details..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleInputChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Upload className="w-5 h-5" />
                                        <span className="text-xs">{formData.image ? formData.image.name : 'Click to upload image'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="bg-soft-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 shadow-md flex items-center gap-2">
                                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
