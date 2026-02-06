import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, CheckCircle, MapPin, Briefcase, Pencil, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '../../api/auth';
import { updateProviderBio } from '../../api/providers';

const ProviderProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, providerDetails, setProviderDetails } = useOutletContext();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => navigate('/provider/dashboard')}
                        className="p-2 md:p-0 bg-gray-100 md:bg-transparent rounded-full md:rounded-none hover:bg-gray-200 transition-colors md:hidden"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-soft-black">{t('dashboard.professionalDetails')}</h2>
                </div>
                {!isEditingProfile && (
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <Pencil className="w-4 h-4" /> {t('dashboard.editDetails')}
                    </button>
                )}
            </div>

            {!isEditingProfile ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Contact & Personal */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.contactInfo')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-600" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.fullName')}</p>
                                            <p className="font-semibold text-soft-black">{user.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg"><CheckCircle className="w-4 h-4 text-gray-600" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.phoneNumber')}</p>
                                            <p className="font-semibold text-soft-black">{user.contactNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg"><MapPin className="w-4 h-4 text-gray-600" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.address')}</p>
                                            <p className="font-medium text-soft-black leading-relaxed">
                                                {user.address ? (
                                                    <>
                                                        {user.address.street && <span>{user.address.street}</span>}
                                                        {user.address.city && <span>, {user.address.city}</span>}
                                                        {user.address.state && <span>, {user.address.state}</span>}
                                                        {user.address.postalCode && <span> - {user.address.postalCode}</span>}
                                                    </>
                                                ) : <span className="text-gray-400 italic">Address not provided</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.locationDetails')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.nativePlace')}</p>
                                        <p className="font-semibold text-soft-black">{providerDetails?.nativePlace || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.currentCity')}</p>
                                        <p className="font-semibold text-soft-black">{providerDetails?.currentPlace || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional & Emergency */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.workProfile')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg"><Briefcase className="w-4 h-4 text-gray-600" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">{t('dashboard.experience')}</p>
                                            <p className="font-semibold text-soft-black">{providerDetails?.experience ? `${providerDetails.experience} Years` : 'Not added'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg"><User className="w-4 h-4 text-gray-600" /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Consult Fee (Base)</p>
                                            <p className="font-semibold text-soft-black">Rs. {providerDetails?.consultFee || '0'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dashboard.emergencyContact')}</h3>
                                {providerDetails?.emergencyContact?.name ? (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="font-bold text-soft-black mb-1">{providerDetails.emergencyContact.name}</p>
                                        <p className="text-sm text-gray-600 mb-1">{providerDetails.emergencyContact.relation}</p>
                                        <p className="text-sm font-mono font-medium text-soft-black">{providerDetails.emergencyContact.phone}</p>
                                    </div>
                                ) : <p className="text-gray-400 italic">No emergency contact added</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    try {
                        const formData = new FormData(e.target);

                        // 1. Update User Profile (Phone & Address)
                        const contactNumber = formData.get('phone');
                        const street = formData.get('street');
                        const city = formData.get('city');
                        const state = formData.get('state');
                        const postalCode = formData.get('postalCode');

                        if (contactNumber || street || city || state || postalCode) {
                            await updateProfile({
                                phone: contactNumber,
                                street,
                                city,
                                state,
                                postalCode
                            });
                            // Note: We'd ideally reload user data here, but ProviderLayout handles the main user state
                            // For now, we assume success and let Layout re-fetch or rely on reload. 
                            // Or better: update context if possible (User state is in Layout).
                            // We can add a function to context to reload user.
                        }

                        // 2. Update Provider Details
                        const emergencyContact = {
                            name: formData.get('ec_name'),
                            phone: formData.get('ec_phone'),
                            relation: formData.get('ec_relation')
                        };
                        formData.set('emergencyContact', JSON.stringify(emergencyContact));
                        formData.delete('ec_name');
                        formData.delete('ec_phone');
                        formData.delete('ec_relation');

                        const response = await updateProviderBio(formData);
                        if (response.success) {
                            setProviderDetails(response.provider);
                            setIsEditingProfile(false);
                            // Optionally reload page to sync User updates if Context update is hard
                            window.location.reload();
                        } else {
                            alert(response.error);
                        }
                    } catch (err) {
                        console.error(err);
                        alert(t('dashboard.updateError'));
                    } finally {
                        setLoading(false);
                    }
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2">Personal Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.phoneNumber')}</label>
                                <input name="phone" defaultValue={user.contactNumber} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Enter phone number" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.streetAddress')}</label>
                                    <input name="street" defaultValue={user.address?.street} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.city')}</label>
                                    <input name="city" defaultValue={user.address?.city} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.state')}</label>
                                    <input name="state" defaultValue={user.address?.state} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.zipCode')}</label>
                                    <input name="postalCode" defaultValue={user.address?.postalCode} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2">Professional Information</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.experience')} (Years)</label>
                                    <input name="experience" type="number" defaultValue={providerDetails?.experience} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consult Fee (Rs)</label>
                                    <input name="consultFee" type="number" defaultValue={providerDetails?.consultFee} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.nativePlace')}</label>
                                    <input name="nativePlace" defaultValue={providerDetails?.nativePlace} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.currentCity')}</label>
                                    <input name="currentPlace" defaultValue={providerDetails?.currentPlace} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
                                <h4 className="text-sm font-bold text-red-800 uppercase">Emergency Contact</h4>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('dashboard.name')}</label>
                                    <input name="ec_name" defaultValue={providerDetails?.emergencyContact?.name} className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Relation</label>
                                        <input name="ec_relation" defaultValue={providerDetails?.emergencyContact?.relation} className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('dashboard.phoneNumber')}</label>
                                        <input name="ec_phone" defaultValue={providerDetails?.emergencyContact?.phone} className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProviderProfile;
