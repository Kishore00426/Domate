import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, MoreVertical, FileText, X, Upload, Save, AlertCircle, Check } from 'lucide-react';
import { getServices, createService, updateService, deleteService, getCategories, getSubcategories } from '../../api/admin';
import { getImageUrl } from '../../utils/imageUrl';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Inline Edit State
    const [inlineEdit, setInlineEdit] = useState({ id: null, field: null, value: '' });
    const [inlineLoading, setInlineLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subcategory: '',
        price: '',
        detailedDescription: '',
        whatIsCovered: '',
        whatIsNotCovered: '',
        requiredEquipment: '',
        serviceProcess: '',
        warranty: '',
        serviceProcess: '',
        warranty: '',
        commissionRate: '', // New field
        image: null
    });
    const [removeImage, setRemoveImage] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servRes, catRes, subCatRes] = await Promise.all([getServices(), getCategories(), getSubcategories()]);
            setServices(servRes.success ? servRes.services : []);
            setCategories(catRes.success ? catRes.categories : []);
            setSubcategories(subCatRes.success ? subCatRes.subcategories : []);
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
                title: item.title,
                category: item.category ? item.category._id : '',
                subcategory: item.subcategory ? item.subcategory._id : '',
                price: item.price || '',
                detailedDescription: item.detailedDescription || '',
                whatIsCovered: item.whatIsCovered ? item.whatIsCovered.join(', ') : '',
                whatIsNotCovered: item.whatIsNotCovered ? item.whatIsNotCovered.join(', ') : '',
                requiredEquipment: item.requiredEquipment ? item.requiredEquipment.join(', ') : '',
                serviceProcess: item.serviceProcess ? item.serviceProcess.join(', ') : '',
                serviceProcess: item.serviceProcess ? item.serviceProcess.join(', ') : '',
                warranty: item.warranty || '',
                commissionRate: item.commissionRate || '', // New field
                image: null
            });
        } else {
            setFormData({
                title: '',
                category: categories.length > 0 ? categories[0]._id : '',
                subcategory: '',
                price: '',
                detailedDescription: '',
                whatIsCovered: '',
                whatIsNotCovered: '',
                requiredEquipment: '',
                serviceProcess: '',
                serviceProcess: '',
                warranty: '',
                commissionRate: '', // New field
                image: null
            });
        }
        setRemoveImage(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            title: '', category: '', subcategory: '', price: '',
            detailedDescription: '', whatIsCovered: '', whatIsNotCovered: '',
            requiredEquipment: '', serviceProcess: '', warranty: '', commissionRate: '', image: null
        });
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
            setRemoveImage(false);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            if (formData.subcategory) data.append('subcategory', formData.subcategory);
            data.append('price', formData.price);
            data.append('detailedDescription', formData.detailedDescription);

            // Direct append of comma-separated strings (Backend will handle parsing)
            data.append('whatIsCovered', formData.whatIsCovered);
            data.append('whatIsNotCovered', formData.whatIsNotCovered);
            data.append('requiredEquipment', formData.requiredEquipment);
            data.append('serviceProcess', formData.serviceProcess);
            data.append('commissionRate', formData.commissionRate); // New field

            data.append('warranty', formData.warranty);

            if (formData.image) {
                data.append('image', formData.image);
            } else if (removeImage) {
                data.append('removeImage', 'true');
            }

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

    // Inline Edit Functions
    const startInlineEdit = (item, field) => {
        let value = item[field];
        if (field === 'category') {
            value = typeof item.category === 'object' ? item.category._id : item.category;
        } else if (field === 'subcategory') {
            value = typeof item.subcategory === 'object' ? item.subcategory._id : item.subcategory;
            // Handle case where subcategory might be undefined/null
            if (!value) value = '';
        }
        setInlineEdit({
            id: item._id,
            field: field,
            value: value
        });
    };

    const cancelInlineEdit = () => {
        setInlineEdit({ id: null, field: null, value: '' });
    };

    const saveInlineEdit = async () => {
        if (!inlineEdit.id) return;
        setInlineLoading(true);

        try {
            const service = services.find(s => s._id === inlineEdit.id);
            if (!service) return;

            const data = new FormData();

            // Determine the new values
            let newTitle = service.title;
            let newPrice = service.price;
            let newCategory = typeof service.category === 'object' ? service.category?._id : service.category;
            let newSubcategory = typeof service.subcategory === 'object' ? service.subcategory?._id : service.subcategory;

            // Update with inline edit value
            if (inlineEdit.field === 'title') newTitle = inlineEdit.value;
            if (inlineEdit.field === 'price') newPrice = inlineEdit.value;
            if (inlineEdit.field === 'commissionRate') data.append('commissionRate', inlineEdit.value); // Handle commissionRate

            if (inlineEdit.field === 'category') {
                newCategory = inlineEdit.value;
                // If category changes, we should ideally clear subcategory or let backend handle it.
                // For now, we'll keep the existing subcategory logic but strictly it might not belong to the new category.
                // A safer approach for inline edit of category is to reset subcategory if it doesn't match, 
                // but checking that here is complex. We will send it as is.
            }
            if (inlineEdit.field === 'subcategory') newSubcategory = inlineEdit.value;

            // Append fields (Single Source of Truth)
            data.append('title', newTitle);
            data.append('price', newPrice);
            if (newCategory) data.append('category', newCategory);
            // Only append subcategory if it has a value
            if (newSubcategory) data.append('subcategory', newSubcategory);

            // Append other required fields that might be cleared if missing (though updateService usually does partial updates, 
            // the backend code looks like it spreads req.body, so we should be safe to only send what changed ideally, 
            // BUT the backend also seems to re-parse array fields if provided.
            // To be safe and avoid side effects of "missing" fields in a PUT request (depending on backend implementation),
            // let's send the preserved values for the other complex fields.

            data.append('detailedDescription', service.detailedDescription || '');
            data.append('whatIsCovered', service.whatIsCovered ? service.whatIsCovered.join(', ') : '');
            data.append('whatIsNotCovered', service.whatIsNotCovered ? service.whatIsNotCovered.join(', ') : '');
            data.append('requiredEquipment', service.requiredEquipment ? service.requiredEquipment.join(', ') : '');
            data.append('serviceProcess', service.serviceProcess ? service.serviceProcess.join(', ') : '');
            data.append('warranty', service.warranty || '');

            const response = await updateService(inlineEdit.id, data);

            if (response.success) {
                // Update local state optimistically
                setServices(prev => prev.map(s => {
                    if (s._id === inlineEdit.id) {
                        // We need to be careful with Category/Subcategory objects vs IDs in local state
                        // If we changed category, we might want to refetch or manually construct the object if possible.
                        // For string fields (title, price), it's easy.
                        // For Category, we have the ID, we can try to find the object from 'categories' state.

                        let updatedS = { ...s };
                        if (inlineEdit.field === 'title') updatedS.title = inlineEdit.value;
                        if (inlineEdit.field === 'price') updatedS.price = inlineEdit.value;
                        if (inlineEdit.field === 'commissionRate') updatedS.commissionRate = inlineEdit.value;


                        if (inlineEdit.field === 'category') {
                            const newCatObj = categories.find(c => c._id === inlineEdit.value);
                            updatedS.category = newCatObj || inlineEdit.value;
                        }
                        if (inlineEdit.field === 'subcategory') {
                            // Find subcategory object from all categories? 
                            // We have 'categories' which contains 'subcategories' array.
                            let newSubObj = null;
                            categories.forEach(c => {
                                if (c.subcategories) {
                                    const found = c.subcategories.find(sub => sub._id === inlineEdit.value);
                                    if (found) newSubObj = found;
                                }
                            });
                            updatedS.subcategory = newSubObj || inlineEdit.value;
                        }
                        return updatedS;
                    }
                    return s;
                }));
                setInlineEdit({ id: null, field: null, value: '' });
                // Optional: fetchData(); // Uncomment if optimistic updates verify to be problematic
            } else {
                alert(response.error || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            alert('Update failed');
        } finally {
            setInlineLoading(false);
        }
    };


    const getCategoryName = (catId) => {
        if (!catId) return 'N/A';
        // catId can be populated object or string id
        const id = typeof catId === 'object' ? catId._id : catId;
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : 'Unknown';
    };

    // Filter services based on search term and selected category
    const filteredServices = services.filter(service => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = service.title?.toLowerCase().includes(searchLower) ||
            getCategoryName(service.category).toLowerCase().includes(searchLower);
        const matchesCategory = !selectedCategory ||
            (typeof service.category === 'object' ? service.category._id : service.category) === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm text-soft-black"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-soft-black outline-none bg-white text-soft-black"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
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
                                    <th className="px-6 py-4">Service Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Subcategory</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Commission %</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredServices.map((service) => (
                                    <tr key={service._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-soft-black flex items-center gap-3">
                                            {service.imageUrl ? (
                                                <img src={getImageUrl(service.imageUrl)} alt={service.title} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                            )}
                                            {inlineEdit.id === service._id && inlineEdit.field === 'title' ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={inlineEdit.value}
                                                        onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                        className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:border-soft-black outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={saveInlineEdit} disabled={inlineLoading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelInlineEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    onClick={() => startInlineEdit(service, 'title')}
                                                    className="cursor-pointer hover:underline decoration-dashed underline-offset-4"
                                                    title="Click to edit title"
                                                >
                                                    {service.title}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {inlineEdit.id === service._id && inlineEdit.field === 'category' ? (
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={inlineEdit.value}
                                                        onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                        className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:border-soft-black outline-none bg-white"
                                                        autoFocus
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={saveInlineEdit} disabled={inlineLoading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelInlineEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    onClick={() => startInlineEdit(service, 'category')}
                                                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                                    title="Click to edit category"
                                                >
                                                    {getCategoryName(service.category)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {inlineEdit.id === service._id && inlineEdit.field === 'subcategory' ? (
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={inlineEdit.value}
                                                        onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                        className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:border-soft-black outline-none bg-white"
                                                        autoFocus
                                                    >
                                                        <option value="">Select Subcategory</option>
                                                        {categories.find(c => c._id === (typeof service.category === 'object' ? service.category._id : service.category))?.subcategories?.map(sub => (
                                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={saveInlineEdit} disabled={inlineLoading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelInlineEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    onClick={() => startInlineEdit(service, 'subcategory')}
                                                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors min-w-[20px] inline-block h-6"
                                                    title="Click to edit subcategory"
                                                >
                                                    {service.subcategory ? (typeof service.subcategory === 'object' ? service.subcategory.name : 'Unknown') : '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-soft-black">
                                            {inlineEdit.id === service._id && inlineEdit.field === 'price' ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={inlineEdit.value}
                                                        onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:border-soft-black outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={saveInlineEdit} disabled={inlineLoading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelInlineEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => startInlineEdit(service, 'price')}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 -ml-1 rounded px-2 w-fit transition-colors"
                                                    title="Click to edit price"
                                                >
                                                    ₹{service.price}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-soft-black">
                                            {inlineEdit.id === service._id && inlineEdit.field === 'commissionRate' ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={inlineEdit.value}
                                                        onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:border-soft-black outline-none"
                                                        autoFocus
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <button onClick={saveInlineEdit} disabled={inlineLoading} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelInlineEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => startInlineEdit(service, 'commissionRate')}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 -ml-1 rounded px-2 w-fit transition-colors"
                                                    title="Click to edit commission rate"
                                                >
                                                    {service.commissionRate || 0}%
                                                </div>
                                            )}
                                        </td>
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
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <h2 className="text-xl font-bold text-soft-black">
                                {editingItem ? 'Edit' : 'Create'} Service
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-soft-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-0">
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column: Basic Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all text-soft-black"
                                                placeholder="e.g. AC Foam Jet Service"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    // Reset subcategory when category changes
                                                    setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }));
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all bg-white text-soft-black"
                                                required
                                            >
                                                <option value="" disabled>Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                            <select
                                                name="subcategory"
                                                value={formData.subcategory}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all bg-white text-soft-black disabled:bg-gray-50 disabled:text-gray-400"
                                                disabled={!formData.category}
                                            >
                                                <option value="">Select Subcategory (Optional)</option>
                                                {/* Filter subcategories based on selected category */}
                                                {categories.find(c => c._id === formData.category)?.subcategories?.map(sub => (
                                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                ))}
                                            </select>
                                            {!formData.category && <p className="text-xs text-gray-400 mt-1">Select a category first.</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all text-soft-black"
                                                    placeholder="599"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                                                <input
                                                    type="text"
                                                    name="warranty"
                                                    value={formData.warranty}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all text-soft-black"
                                                    placeholder="e.g. 30 Days"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                                                <input
                                                    type="number"
                                                    name="commissionRate"
                                                    value={formData.commissionRate}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all text-soft-black"
                                                    placeholder="e.g. 10"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Required Equipment</label>
                                            <textarea
                                                name="requiredEquipment"
                                                value={formData.requiredEquipment}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                                placeholder="Ladder, Water connection, etc. (Separate by comma)"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Separate each item with a comma.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Process</label>
                                            <textarea
                                                name="serviceProcess"
                                                value={formData.serviceProcess}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                                placeholder="Step 1, Step 2, Step 3 (Separate by comma)"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Separate steps with a comma.</p>
                                        </div>
                                    </div>

                                    {/* Right Column: Details & Media */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">Service Details</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="detailedDescription"
                                                value={formData.detailedDescription}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                                placeholder="Full description of what the service entails..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">What is Covered</label>
                                            <textarea
                                                name="whatIsCovered"
                                                value={formData.whatIsCovered}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                                placeholder="Inspection, Repairs, Cleanup (Separate by comma)"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Separate points with a comma.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">What is NOT Covered</label>
                                            <textarea
                                                name="whatIsNotCovered"
                                                value={formData.whatIsNotCovered}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none transition-all resize-none text-soft-black"
                                                placeholder="Spare parts, External damage (Separate by comma)"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Separate points with a comma.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>

                                            {editingItem && editingItem.imageUrl && !removeImage && !formData.image && (
                                                <div className="mb-3 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <img
                                                        src={getImageUrl(editingItem.imageUrl)}
                                                        alt="Current"
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-soft-black">Current Image</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRemoveImage(true)}
                                                            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 mt-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Remove Image
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group ${removeImage ? 'bg-red-50/50 border-red-200' : ''}`}>
                                                <input
                                                    type="file"
                                                    name="image"
                                                    onChange={handleInputChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    accept="image/*"
                                                />
                                                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-soft-black transition-colors">
                                                    <Upload className={`w-8 h-8 text-gray-400 group-hover:text-soft-black ${removeImage ? 'text-red-400' : ''}`} />
                                                    <span className="text-xs font-medium">
                                                        {formData.image
                                                            ? formData.image.name
                                                            : removeImage
                                                                ? 'Image removed. Click to upload replacement.'
                                                                : 'Click to upload image'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
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
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
