import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import {
    getPrivileges,
    createPrivilege,
    updatePrivilege,
    deletePrivilege,
    getRolePrivileges,
    assignRolePrivileges
} from '../../api/admin';

const PrivilegeManagement = () => {
    const [privileges, setPrivileges] = useState([]);
    const [roles, setRoles] = useState(['admin', 'user', 'provider']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(5); // Show 5 items per page for testing pagination

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingPrivilege, setEditingPrivilege] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    // Role-Privilege Assignment states  
    const [selectedRole, setSelectedRole] = useState('admin');
    const [rolePrivileges, setRolePrivileges] = useState([]);
    const [selectedPrivileges, setSelectedPrivileges] = useState([]);
    const [assignmentLoading, setAssignmentLoading] = useState(false);

    useEffect(() => {
        fetchPrivileges();
    }, [currentPage]); // Re-fetch when page changes

    useEffect(() => {
        if (selectedRole) {
            fetchRolePrivileges(selectedRole);
        }
    }, [selectedRole]);

    const fetchPrivileges = async () => {
        try {
            setLoading(true);
            const data = await getPrivileges({ page: currentPage, limit: itemsPerPage });
            if (data.success) {
                setPrivileges(data.privileges);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            } else {
                setError(data.error || 'Failed to fetch privileges');
            }
        } catch (err) {
            setError('Error fetching privileges: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const fetchRolePrivileges = async (roleName) => {
        try {
            setAssignmentLoading(true);
            const data = await getRolePrivileges(roleName);
            if (data.success) {
                setRolePrivileges(data.privileges || []);
                setSelectedPrivileges(data.privileges.map(p => p._id) || []);
            }
        } catch (err) {
            console.error('Error fetching role privileges:', err);
        } finally {
            setAssignmentLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            let data;
            if (editingPrivilege) {
                data = await updatePrivilege(editingPrivilege._id, formData);
            } else {
                data = await createPrivilege(formData);
            }

            if (data.success) {
                setSuccessMessage(editingPrivilege ? 'Privilege updated successfully!' : 'Privilege created successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                fetchPrivileges();
                closeModal();
            } else {
                setError(data.error || 'Operation failed');
            }
        } catch (err) {
            setError('Error: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this privilege?')) return;

        try {
            const data = await deletePrivilege(id);
            if (data.success) {
                setSuccessMessage('Privilege deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                fetchPrivileges();
            } else {
                setError(data.error || 'Delete failed');
            }
        } catch (err) {
            setError('Error deleting privilege: ' + err.message);
        }
    };

    const handleAssignPrivileges = async () => {
        try {
            setAssignmentLoading(true);
            const data = await assignRolePrivileges(selectedRole, selectedPrivileges);

            if (data.success) {
                setSuccessMessage(`Privileges updated for ${selectedRole} role!`);
                setTimeout(() => setSuccessMessage(''), 3000);
                fetchRolePrivileges(selectedRole);
            } else {
                setError(data.error || 'Assignment failed');
            }
        } catch (err) {
            setError('Error assigning privileges: ' + err.message);
        } finally {
            setAssignmentLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingPrivilege(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (privilege) => {
        setEditingPrivilege(privilege);
        setFormData({ name: privilege.name, description: privilege.description || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPrivilege(null);
        setFormData({ name: '', description: '' });
    };

    const togglePrivilege = (privilegeId) => {
        setSelectedPrivileges(prev =>
            prev.includes(privilegeId)
                ? prev.filter(id => id !== privilegeId)
                : [...prev, privilegeId]
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">Privileges Management</h1>
                    <p className="text-gray-500">Manage system privileges and role assignments</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-soft-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Privilege
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
                    <X className="w-5 h-5" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Privileges Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    <h2 className="text-lg font-bold text-soft-black mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        All Privileges
                    </h2>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500 flex-grow">Loading privileges...</div>
                    ) : privileges.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 flex-grow">No privileges found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto flex-grow">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Description</th>
                                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {privileges.map((privilege) => (
                                            <tr key={privilege._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-2 text-sm font-medium text-soft-black">{privilege.name}</td>
                                                <td className="py-3 px-2 text-sm text-gray-600">{privilege.description || '-'}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(privilege)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(privilege._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page <span className="font-semibold text-soft-black">{currentPage}</span> of <span className="font-semibold text-soft-black">{totalPages}</span>
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Role-Privilege Assignment */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    <h2 className="text-lg font-bold text-soft-black mb-4">Role-Privilege Assignment</h2>

                    <div className="space-y-4 flex flex-col flex-grow">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Privileges Checkboxes */}
                        <div className="flex-grow flex flex-col min-h-0">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Privileges</label>
                            {assignmentLoading ? (
                                <div className="text-center py-4 text-gray-500 flex-grow flex items-center justify-center">Loading...</div>
                            ) : (
                                <div className="space-y-2 flex-grow overflow-y-auto border border-gray-200 rounded-xl p-4">
                                    {privileges.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No privileges available</p>
                                    ) : (
                                        privileges.map((privilege) => (
                                            <label
                                                key={privilege._id}
                                                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition select-none"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPrivileges.includes(privilege._id)}
                                                    onChange={() => togglePrivilege(privilege._id)}
                                                    className="w-5 h-5 mt-0.5 accent-soft-black flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-soft-black truncate">{privilege.name}</div>
                                                    {privilege.description && (
                                                        <div className="text-xs text-gray-500 mt-0.5 truncate">{privilege.description}</div>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="mt-auto pt-2">
                            <button
                                onClick={handleAssignPrivileges}
                                disabled={assignmentLoading}
                                className="w-full bg-soft-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {assignmentLoading ? 'Saving...' : 'Save Privileges'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-soft-black">
                                {editingPrivilege ? 'Edit Privilege' : 'Create Privilege'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Privilege Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black"
                                    placeholder="e.g., manage_users"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-soft-black outline-none text-soft-black resize-none"
                                    rows="3"
                                    placeholder="Brief description of this privilege"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-soft-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black transition-transform active:scale-95 shadow-lg"
                                >
                                    {editingPrivilege ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivilegeManagement;
