import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Folder, FolderPlus, X, Upload, Save, AlertCircle } from 'lucide-react';
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory
} from '../../api/admin';

const CategoryManagement = () => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // If null, it's create mode
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '', // For subcategories
        image: null // File object
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cats, subCats] = await Promise.all([getCategories(), getSubcategories()]);
            setCategories(cats.success ? cats.categories : []);
            setSubcategories(subCats.success ? subCats.subcategories : []);
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
                description: item.description || '',
                category: item.category || item.parentCategory || '',
                image: null
            });
        } else {
            setFormData({
                name: '',
                description: '',
                category: categories.length > 0 ? categories[0]._id : '',
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', description: '', category: '', image: null });
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
        setLoading(true); // Show loading state on button ideally

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            if (formData.image) data.append('image', formData.image);

            if (activeTab === 'subcategories') {
                if (formData.category) data.append('category', formData.category);
            }

            let response;
            if (activeTab === 'categories') {
                if (editingItem) {
                    response = await updateCategory(editingItem._id, data);
                } else {
                    response = await createCategory(data);
                }
            } else {
                if (editingItem) {
                    response = await updateSubcategory(editingItem._id, data);
                } else {
                    response = await createSubcategory(data);
                }
            }

            if (response.success) {
                fetchData(); // Refresh list
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
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            if (activeTab === 'categories') {
                await deleteCategory(id);
            } else {
                await deleteSubcategory(id);
            }
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete item');
        }
    };

    // Helper to find category name for display in subcategory table
    const getCategoryName = (catId) => {
        const cat = categories.find(c => c._id === catId);
        return cat ? cat.name : 'Unknown';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">Category Management</h1>
                    <p className="text-gray-500">Manage service categories and subcategories.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-soft-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Add New {activeTab === 'categories' ? 'Category' : 'Subcategory'}
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 flex gap-6">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'categories' ? 'text-soft-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" /> Categories
                    </div>
                    {activeTab === 'categories' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-soft-black rounded-t-full"></span>}
                </button>
                <button
                    onClick={() => setActiveTab('subcategories')}
                    className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'subcategories' ? 'text-soft-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4" /> Subcategories
                    </div>
                    {activeTab === 'subcategories' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-soft-black rounded-t-full"></span>}
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm text-soft-black"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading && categories.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    {activeTab === 'subcategories' && <th className="px-6 py-4">Parent Category</th>}
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'categories' ? (
                                    categories.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-soft-black flex items-center gap-3">
                                                {item.image ? (
                                                    <img src={`http://localhost:4000${item.image}`} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">N/A</div>
                                                )}
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{item.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    subcategories.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-soft-black flex items-center gap-3">
                                                {item.image ? (
                                                    <img src={`http://localhost:4000${item.image}`} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">N/A</div>
                                                )}
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{item.description}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{getCategoryName(item.category || item.parentCategory)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                                {editingItem ? 'Edit' : 'Create'} {activeTab === 'categories' ? 'Category' : 'Subcategory'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-soft-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all text-soft-black"
                                    placeholder="e.g. Plumbing"
                                    required
                                />
                            </div>

                            {activeTab === 'subcategories' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all bg-white text-soft-black"
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
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

export default CategoryManagement;
