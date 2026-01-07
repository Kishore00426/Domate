import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, MapPin, User, Shield, Eye, X, Phone, Calendar, CheckCircle, Briefcase } from 'lucide-react';
import { getUsers, deleteUser } from '../../api/admin';
import { getProviderByUserId } from '../../api/providers';
import { getImageUrl } from '../../utils/imageUrl';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProviderDetails, setSelectedProviderDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            if (response.success) {
                setUsers(response.users);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await deleteUser(id);
            if (response.success) {
                setUsers(prev => prev.filter(u => u._id !== id));
            } else {
                alert(response.error || 'Failed to delete user');
            }
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setSelectedProviderDetails(null); // Reset
        setShowModal(true);

        // If user is a service provider, fetch their details
        if (user.role?.name === 'service_provider') {
            setDetailsLoading(true);
            try {
                const response = await getProviderByUserId(user._id);
                if (response.success) {
                    setSelectedProviderDetails(response.provider);
                }
            } catch (error) {
                console.error("Failed to fetch provider details:", error);
            } finally {
                setDetailsLoading(false);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setSelectedProviderDetails(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">User Management</h1>
                    <p className="text-gray-500">View and manage registered users.</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full text-sm text-soft-black"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-gray-400">Loading users...</div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-48 text-red-500">{error}</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400">No users found</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-soft-black">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-gray-500">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={getImageUrl(user.profileImage)}
                                                            alt={user.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{user.username}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${user.role?.name === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                <Shield className="w-3 h-3" /> {user.role?.name || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg md:max-w-2xl lg:max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="relative h-32 bg-gray-100">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                <User className="w-16 h-16 opacity-20" />
                            </div>
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-8 relative">
                            {/* Avatar */}
                            <div className="-mt-12 mb-4 relative inline-block">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                                        {selectedUser.profileImage ? (
                                            <img
                                                src={getImageUrl(selectedUser.profileImage)}
                                                alt={selectedUser.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-10 h-10" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-soft-black flex items-center gap-2">
                                    {selectedUser.username}
                                    {selectedUser.role?.name === 'admin' && (
                                        <Shield className="w-5 h-5 text-purple-600 fill-purple-100" />
                                    )}
                                </h2>
                                <p className="text-gray-500">{selectedUser.email}</p>
                            </div>

                            {/* Service Provider Specifics */}
                            {selectedUser.role?.name === 'service_provider' && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">

                                    {detailsLoading ? (
                                        <div className="text-sm text-gray-500 animate-pulse">Loading details...</div>
                                    ) : selectedProviderDetails ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase font-bold">Experience</p>
                                                    <p className="font-semibold text-soft-black">{selectedProviderDetails.experience || 0} Years</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs uppercase font-bold">Rating</p>
                                                    <p className="font-semibold text-soft-black flex items-center gap-1">
                                                        {selectedProviderDetails.rating || 'N/A'}
                                                        <span className="text-gray-400 font-normal">({selectedProviderDetails.totalReviews || 0})</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-gray-500 text-xs uppercase font-bold mb-2">Services Offered</p>
                                                {selectedProviderDetails.services && selectedProviderDetails.services.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProviderDetails.services.map((service, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded-lg border border-blue-100 shadow-sm">
                                                                {service.title || "Service"}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No services listed yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">No additional provider details found.</div>
                                    )}
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <Shield className="w-3 h-3" /> Role
                                    </div>
                                    <div className="font-semibold text-soft-black capitalize">
                                        {selectedUser.role?.name || 'User'}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" /> Joined
                                    </div>
                                    <div className="font-semibold text-soft-black">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 md:col-span-2">
                                    <div className="flex items-center gap-3 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <MapPin className="w-3 h-3" /> Location
                                    </div>
                                    <div className="font-semibold text-soft-black">
                                        {selectedUser.location || 'Not provided'}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 md:col-span-2">
                                    <div className="flex items-center gap-3 mb-1 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                        <span className="font-mono text-[10px]">ID</span> User ID
                                    </div>
                                    <div className="font-mono text-xs text-gray-500 truncate">
                                        {selectedUser._id}
                                    </div>
                                </div>
                            </div>

                            {/* Status (Dummy for now as usage status isn't clear) */}
                            <div className="mt-6 flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                                <div className="flex items-center gap-2 font-medium">
                                    <CheckCircle className="w-5 h-5" />
                                    Account Active
                                </div>
                                <span className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-green-100">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
