import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, CheckCircle, Trash2, FileText, AlertCircle, User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteProviderDocument, updateProviderBio } from '../../api/providers';


const ProviderDocuments = () => {
    const { t } = useTranslation();
    const { providerDetails, setProviderDetails } = useOutletContext();
    const [loading, setLoading] = useState(false);
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
                [name]: [...(prev[name] || []), ...Array.from(files)]
            }));
        }
        e.target.value = '';
    };

    const removeSelectedFile = (type, index) => {
        setSelectedFiles(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            selectedFiles.idProof.forEach(file => formData.append('idProof', file));
            selectedFiles.addressProof.forEach(file => formData.append('addressProof', file));
            selectedFiles.certificate.forEach(file => formData.append('certificate', file));

            const response = await updateProviderBio(formData);
            if (response.success) {
                setProviderDetails(response.provider);
                setSelectedFiles({ idProof: [], addressProof: [], certificate: [] });
                alert("Documents uploaded successfully!");
            } else {
                alert(response.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload documents");
        } finally {
            setLoading(false);
        }
    };

    const renderExistingdocs = (docs, type) => {
        if (!docs || docs.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {docs.map((file, idx) => {
                    const fileName = file.split('/').pop() || `Document ${idx + 1}`;
                    return (
                        <div key={idx} className="bg-green-50 pl-3 pr-2 py-1.5 text-xs rounded-lg flex items-center gap-2 border border-green-100">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <a href={`http://localhost:5000${file}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 hover:underline max-w-[150px] truncate">
                                {fileName}
                            </a>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!window.confirm(t('dashboard.deleteDocConfirm'))) return;
                                    try {
                                        const data = await deleteProviderDocument({ type, filePath: file });
                                        if (data.success) {
                                            setProviderDetails(data.provider);
                                        } else {
                                            alert(data.error);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="ml-1 p-1 hover:bg-red-100 rounded text-green-700/50 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-soft-black mb-6">{t('dashboard.documentsVerification')}</h2>

            <form onSubmit={handleUpload} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ID Proof */}
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">ID Proof</h3>
                            <p className="text-xs text-gray-500 mt-1">Aadhaar, PAN, or Voter ID</p>
                        </div>
                        <input
                            type="file"
                            name="idProof"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-black file:text-white
                                hover:file:bg-gray-800
                            "
                        />
                        {/* Selected Files Preview */}
                        {selectedFiles.idProof.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {selectedFiles.idProof.map((f, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button type="button" onClick={() => removeSelectedFile('idProof', i)} className="text-red-500"><XIcon /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Existing Files */}
                        {renderExistingdocs(providerDetails?.documents?.filter(d => d.includes('idProof')), 'idProof')}

                    </div>

                    {/* Address Proof */}
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Address Proof</h3>
                            <p className="text-xs text-gray-500 mt-1">Electricity Bill, Rent Agreement</p>
                        </div>
                        <input
                            type="file"
                            name="addressProof"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-black file:text-white
                                hover:file:bg-gray-800
                            "
                        />
                        {selectedFiles.addressProof.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {selectedFiles.addressProof.map((f, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button type="button" onClick={() => removeSelectedFile('addressProof', i)} className="text-red-500"><XIcon /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Certificate */}
                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900">Certificates</h3>
                            <p className="text-xs text-gray-500 mt-1">Professional Certifications</p>
                        </div>
                        <input
                            type="file"
                            name="certificate"
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-black file:text-white
                                hover:file:bg-gray-800
                            "
                        />
                        {selectedFiles.certificate.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {selectedFiles.certificate.map((f, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button type="button" onClick={() => removeSelectedFile('certificate', i)} className="text-red-500"><XIcon /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading || (selectedFiles.idProof.length === 0 && selectedFiles.addressProof.length === 0 && selectedFiles.certificate.length === 0)}
                        className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    >
                        {loading ? 'Uploading...' : 'Upload Documents'}
                    </button>
                </div>
            </form>

            {/* List Existing Documents Generic Fallback if type not known, 
                or if we want to show all docs in one place */}
            <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4">Uploaded Documents</h3>
                {providerDetails?.documents && providerDetails.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {providerDetails.documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-white rounded-lg border border-gray-100">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate">{doc.split('/').pop()}</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Delete this document?")) return;
                                        await deleteProviderDocument({ filePath: doc });
                                        // Trigger reload or context update
                                        // For now assumption
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No documents found.</p>
                )}
            </div>

        </div>
    );
};

const XIcon = () => <span className="font-bold">×</span>;

export default ProviderDocuments;
