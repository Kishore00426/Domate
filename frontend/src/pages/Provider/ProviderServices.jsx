import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, AlertCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAllServices } from '../../api/services';
import { updateProviderServices } from '../../api/providers';

const ProviderServices = () => {
    const { t } = useTranslation();
    const { providerDetails, setProviderDetails } = useOutletContext();
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceDescriptions, setServiceDescriptions] = useState({});
    const [isEditingServices, setIsEditingServices] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await getAllServices();
                if (res.success) setAllServices(res.services);
            } catch (err) {
                console.error("Failed to fetch services", err);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        if (providerDetails) {
            if (providerDetails.services) {
                setSelectedServices(providerDetails.services.map(s => s._id || s));
            }
            if (providerDetails.serviceDescriptions) {
                const descriptions = {};
                providerDetails.serviceDescriptions.forEach(sd => {
                    descriptions[sd.serviceId] = sd.description;
                });
                setServiceDescriptions(descriptions);
            }
        }
    }, [providerDetails]);

    const handleServiceToggle = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleDescriptionChange = (serviceId, text) => {
        setServiceDescriptions(prev => ({
            ...prev,
            [serviceId]: text
        }));
    };

    const handleSaveServices = async () => {
        setLoading(true);
        try {
            const payload = {
                services: selectedServices,
                descriptions: Object.keys(serviceDescriptions)
                    .filter(id => selectedServices.includes(id)) // Only send descriptions for selected services
                    .map(id => ({ serviceId: id, description: serviceDescriptions[id] }))
            };

            const res = await updateProviderServices(payload);
            if (res.success) {
                setProviderDetails(res.provider);
                setIsEditingServices(false);
                alert("Services updated successfully!");
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update services");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-soft-black">{t('dashboard.myServices')}</h2>
                    <p className="text-sm text-gray-500">Manage the services you offer to customers</p>
                </div>
                {!isEditingServices ? (
                    <button
                        onClick={() => setIsEditingServices(true)}
                        className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        {t('dashboard.manageServices')}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditingServices(false)}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveServices}
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {isEditingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
                    {allServices.map(service => {
                        const isSelected = selectedServices.includes(service._id);
                        return (
                            <div
                                key={service._id}
                                className={`
                                    border rounded-2xl p-4 transition-all duration-200
                                    ${isSelected ? 'border-black bg-gray-50 ring-1 ring-black/5' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleServiceToggle(service._id)}
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <div>
                                        <h4 className="font-bold text-soft-black">{service.title}</h4>
                                        <p className="text-xs text-gray-500">{service.category?.name || 'Category'}</p>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="mt-2 animate-in slide-in-from-top-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description / Pricing Note</label>
                                        <textarea
                                            value={serviceDescriptions[service._id] || ''}
                                            onChange={(e) => handleDescriptionChange(service._id, e.target.value)}
                                            placeholder="E.g., Rs. 500 per ton, includes labor..."
                                            className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black resize-none h-20 bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {providerDetails?.services?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {providerDetails.services.map((service, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Briefcase className="w-5 h-5 text-gray-700" />
                                        </div>
                                        <h3 className="font-bold text-lg text-soft-black">{service.title}</h3>
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Description</p>
                                        <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic min-h-[60px]">
                                            {serviceDescriptions[service._id] || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 bg-gray-50/50 rounded-3xl border border-gray-100">
                            <Briefcase className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No services added yet.</p>
                            <p className="text-sm">Click "Manage Services" to start offering your skills.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProviderServices;
