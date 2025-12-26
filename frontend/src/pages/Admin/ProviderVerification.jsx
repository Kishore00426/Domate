import React, { useState } from 'react';
import { Search, Eye, Check, X, Filter } from 'lucide-react';

const ProviderVerification = () => {
    // Mock Data simulating pending providers
    const [pendingProviders, setPendingProviders] = useState([
        { id: 1, name: 'Rajesh Kumar', category: 'Plumbing', location: 'Chennai', appliedDate: '2024-12-25', status: 'Pending' },
        { id: 2, name: 'Anita Singh', category: 'Salon at Home', location: 'Bangalore', appliedDate: '2024-12-24', status: 'Pending' },
        { id: 3, name: 'Suresh Electric', category: 'Electrical', location: 'Mumbai', appliedDate: '2024-12-23', status: 'Pending' }
    ]);

    const [selectedProvider, setSelectedProvider] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAction = (id, action) => {
        // Here we would call the API to update status
        console.log(`Provider ${id} was ${action}ed`);
        setPendingProviders(pendingProviders.filter(p => p.id !== id));
        setSelectedProvider(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-soft-black">Provider Verification</h1>
                    <p className="text-gray-500">Review and approve service provider applications.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-soft-black outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Applied Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingProviders.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                pendingProviders
                                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((provider) => (
                                        <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-soft-black">{provider.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">{provider.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{provider.location}</td>
                                            <td className="px-6 py-4 text-gray-500">{provider.appliedDate}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedProvider(provider)}
                                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" /> View & Process
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No pending verifications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedProvider && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-soft-black">Application Details</h3>
                            <button onClick={() => setSelectedProvider(null)} className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applicant</h4>
                                    <p className="text-lg font-semibold text-soft-black">{selectedProvider.name}</p>
                                    <p className="text-sm text-gray-500">mob: 9876543210</p>
                                    <p className="text-sm text-gray-500">email: test@example.com</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Info</h4>
                                    <p className="font-medium">{selectedProvider.category}</p>
                                    <p className="text-sm text-gray-500">Exp: 4 Years</p>
                                    <p className="text-sm text-gray-500">Loc: {selectedProvider.location}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-soft-black border-b pb-2">Submitted Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="border rounded-xl p-4 bg-gray-50 text-center">
                                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">ID Proof Preview</div>
                                        <p className="text-xs font-medium">Aadhaar Card.pdf</p>
                                        <button className="text-indigo-600 text-xs mt-1 hover:underline">View</button>
                                    </div>
                                    <div className="border rounded-xl p-4 bg-gray-50 text-center">
                                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">Address Proof Preview</div>
                                        <p className="text-xs font-medium">Electricity Bill.jpg</p>
                                        <button className="text-indigo-600 text-xs mt-1 hover:underline">View</button>
                                    </div>
                                    <div className="border rounded-xl p-4 bg-gray-50 text-center">
                                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-xs">Profile Photo</div>
                                        <p className="text-xs font-medium">photo.jpg</p>
                                        <button className="text-indigo-600 text-xs mt-1 hover:underline">View</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
                            <button
                                onClick={() => handleAction(selectedProvider.id, 'reject')}
                                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(selectedProvider.id, 'approve')}
                                className="px-5 py-2.5 rounded-xl bg-soft-black text-white font-bold hover:bg-black transition-transform active:scale-95 shadow-lg flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderVerification;
