import React, { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, AlertCircle, Calendar, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getPendingProviders, verifyProvider } from '../../api/admin';

const ProviderVerification = () => {
    const [pendingProviders, setPendingProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await getPendingProviders();
            if (response.success) {
                setPendingProviders(response.providers);
            } else {
                setError('Failed to fetch providers');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading providers');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this provider?`)) return;

        setActionLoading(true);
        try {
            // Updated to ensure we send 'approved' or 'rejected' which is likely what the backend expects, 
            // or 'approve'/'reject' mapped to status. 
            // Assuming backend endpoint expects action string.
            const response = await verifyProvider(id, action);
            if (response.success) {
                // Remove from list
                setPendingProviders(prev => prev.filter(p => p._id !== id));
                setSelectedProvider(null);
            } else {
                alert(response.error || 'Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div>
                <h1 className="text-2xl font-bold text-soft-black">Provider Verification</h1>
                <p className="text-gray-500">Review and approve service provider applications.</p>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">Loading pending applications...</div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
                    ) : pendingProviders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FileText className="w-12 h-12 mb-2 opacity-20" />
                            <p>No pending verifications</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Provider Name</th>
                                    <th className="px-6 py-4">Service Category</th>
                                    <th className="px-6 py-4">Submitted Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingProviders.map((provider) => (
                                    <tr key={provider._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-soft-black">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                                    {provider.user?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{provider.user?.username}</div>
                                                    <div className="text-xs text-gray-500">{provider.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                                                {provider.services?.[0]?.category?.name || provider.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(provider.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedProvider(provider)}
                                                className="text-soft-black hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-gray-200 hover:border-gray-300"
                                            >
                                                View & Process
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Verification Modal */}
            {selectedProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-soft-black">Application Details</h2>
                                <p className="text-gray-500 text-xs">Review provider information carefully</p>
                            </div>
                            <button onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-soft-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                            {/* Personal Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-soft-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                                    {selectedProvider.user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-soft-black">{selectedProvider.user?.username}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedProvider.user?.email}</div>
                                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedProvider.phone || 'N/A'}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="w-3 h-3" /> {selectedProvider.location || 'Location not provided'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Service Category</p>
                                    <p className="font-semibold text-soft-black">{selectedProvider.services?.[0]?.category?.name || selectedProvider.category || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Experience</p>
                                    <p className="font-semibold text-soft-black">{selectedProvider.experience ? `${selectedProvider.experience} Years` : 'N/A'}</p>
                                </div>
                            </div>


                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <p className="text-xs text-gray-500 uppercase font-bold">Uploaded Documents</p>
                                </div>
                                <div className="space-y-4">
                                    {/* Certificates */}
                                    {selectedProvider.certificates?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-2">Certificates</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProvider.certificates.map((doc, index) => (
                                                    <a
                                                        key={`cert-${index}`}
                                                        href={`http://localhost:4000${doc}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 text-sm text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        <FileText className="w-3 h-3" /> Certificate {index + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ID Proofs */}
                                    {selectedProvider.idProofs?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-2">ID Proofs</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProvider.idProofs.map((doc, index) => (
                                                    <a
                                                        key={`id-${index}`}
                                                        href={`http://localhost:4000${doc}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 text-sm text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        <FileText className="w-3 h-3" /> ID Proof {index + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Proofs */}
                                    {selectedProvider.addressProofs?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-2">Address Proofs</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProvider.addressProofs.map((doc, index) => (
                                                    <a
                                                        key={`addr-${index}`}
                                                        href={`http://localhost:4000${doc}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 text-sm text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        <FileText className="w-3 h-3" /> Address Proof {index + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!selectedProvider.certificates?.length && !selectedProvider.idProofs?.length && !selectedProvider.addressProofs?.length) && (
                                        <p className="text-sm text-gray-400 italic">No documents uploaded.</p>
                                    )}
                                </div>
                            </div>


                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => handleAction(selectedProvider._id, 'reject')}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Reject App
                            </button>
                            <button
                                onClick={() => handleAction(selectedProvider._id, 'approve')}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-soft-black text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" /> Approve Provider
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default ProviderVerification;
