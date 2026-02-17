import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../api/auth';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const isProvider = role === 'service_provider';

    const [step, setStep] = useState(1);
    const [showAddress, setShowAddress] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Address (User)
        doorNo: '',
        street: '',
        town: '',
        district: '',
        state: '',
        country: 'India',
        pincode: '',
        // Provider Specific
        serviceCategory: '',
        workLocation: '',
        workPincode: '',
        radius: '',
        agreedToTerms: false,
        experience: '',
        // Files (stored as objects or dummy for now)
        idProof: null,
        addressProof: null,
        profilePhoto: null,
        certificates: null
    });
    const [errors, setErrors] = useState({});

    // Reset step if role changes
    useEffect(() => {
        setStep(1);
        setErrors({});
    }, [role]);

    const unionTerritories = [
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal"
    ];

    const serviceCategories = ["Cleaning", "Plumbing", "Electrical", "Painting", "Moving"];
    const workLocations = ["Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad"];

    const validateStep1 = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = t('register.errors.nameRequired');
        if (!formData.mobile) tempErrors.mobile = t('register.errors.mobileRequired');
        else if (!/^\d{10}$/.test(formData.mobile)) tempErrors.mobile = t('register.errors.mobileInvalid');

        if (!formData.email) {
            tempErrors.email = t('register.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = t('register.errors.emailInvalid');
        }

        if (!formData.password) {
            tempErrors.password = t('register.errors.passwordRequired');
        } else if (formData.password.length < 6) {
            tempErrors.password = t('register.errors.passwordLength');
        }

        if (formData.confirmPassword !== formData.password) {
            tempErrors.confirmPassword = t('register.errors.passwordMatch');
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validateStep2 = () => {
        let tempErrors = {};
        if (!formData.serviceCategory) tempErrors.serviceCategory = t('register.serviceCategory') + ' is required'; // TODO: proper key
        if (!formData.experience) tempErrors.experience = t('register.experience') + ' is required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validateStep3 = () => {
        let tempErrors = {};
        if (!formData.workLocation) tempErrors.workLocation = t('register.workCity') + ' is required';
        if (!formData.pincode) tempErrors.pincode = t('register.pincode') + ' is required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validateStep4 = () => {
        let tempErrors = {};
        if (!formData.idProof) tempErrors.idProof = t('register.idProof') + ' is required';
        if (!formData.addressProof) tempErrors.addressProof = t('register.addressProof') + ' is required';
        if (!formData.profilePhoto) tempErrors.profilePhoto = t('register.profilePhoto') + ' is required';
        if (!formData.agreedToTerms) tempErrors.agreedToTerms = t('register.errors.agreeTerms');
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);

            }
        }
        // Other steps removed for provider
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = false;

        // Both User and Provider now just need Step 1 validation
        if (validateStep1()) isValid = true;

        if (isValid) {
            try {
                // Map frontend fields to backend requirements
                // Map frontend fields to backend requirements
                const payload = {
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    mobile: formData.mobile
                };
                // ... rest of submit


                const data = await register(payload);
                console.log('Registered successfully', data);
                // Optionally auto-login or redirect to login
                navigate('/login?registered=true');
            } catch (err) {
                console.error("Registration failed", err);
                let errorMessage = 'Registration failed. Please try again.';

                if (err.code === 'ERR_NETWORK') {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                }

                setErrors({ ...errors, form: errorMessage });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4 transition-all duration-500">
            <div className={`bg-white rounded-3xl shadow-xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-300 transition-all ease-in-out ${showAddress && !isProvider ? 'max-w-4xl' : 'max-w-md'}`}>
                <Link to="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-soft-black transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>

                <form onSubmit={handleSubmit}>
                    {errors.form && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{errors.form}</div>}
                    <div className={`flex flex-col ${showAddress && !isProvider ? 'md:flex-row' : ''} transition-all duration-500 ease-in-out items-center`}>
                        {/* Main Form Content */}
                        <div className={`p-6 md:p-8 w-full ${showAddress && !isProvider ? 'md:w-1/2' : 'w-full'} transition-all duration-500`}>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-soft-black mb-2">
                                    {isProvider ? t('register.providerTitle') : t('register.title')}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {isProvider ? t('register.providerSubtitle') : t('register.subtitle')}
                                </p>
                            </div>


                            {(step === 1) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.fullName')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t('register.fullName')}
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.name ? 'border-red-500' : ''}`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.mobile')}</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.mobile ? 'border-red-500' : ''}`}
                                        />
                                        {errors.mobile && <p className="text-red-500 text-xs mt-1 ml-1">{errors.mobile}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.email')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder={t('register.email')}
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.password ? 'border-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-soft-black"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.confirmPassword')}</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-soft-black"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                                    </div>

                                    {!isProvider && !showAddress && (
                                        <div className="flex justify-end mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddress(true)}
                                                className="text-xs font-semibold text-soft-black hover:underline flex items-center gap-1 transition-all"
                                            >
                                                {t('register.addAddress')}
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}


                            {isProvider && step === 2 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.serviceCategory')}</label>
                                        <div className="relative">
                                            <select
                                                name="serviceCategory"
                                                value={formData.serviceCategory}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white text-sm text-black appearance-none ${errors.serviceCategory ? 'border-red-500' : ''}`}
                                            >
                                                <option value="">{t('dashboard.selectServicesInstruction')}</option>
                                                {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                        {errors.serviceCategory && <p className="text-red-500 text-xs mt-1 ml-1">{errors.serviceCategory}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.experience')}</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            placeholder="e.g. 2"
                                            min="0"
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.experience ? 'border-red-500' : ''}`}
                                        />
                                        {errors.experience && <p className="text-red-500 text-xs mt-1 ml-1">{errors.experience}</p>}
                                    </div>
                                </div>
                            )}


                            {isProvider && step === 3 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.workCity')}</label>
                                        <div className="relative">
                                            <select
                                                name="workLocation"
                                                value={formData.workLocation}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white text-sm text-black appearance-none ${errors.workLocation ? 'border-red-500' : ''}`}
                                            >
                                                <option value="">{t('dashboard.city')}</option>
                                                {workLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                        {errors.workLocation && <p className="text-red-500 text-xs mt-1 ml-1">{errors.workLocation}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.pincode')}</label>
                                        <input
                                            type="text"
                                            name="workPincode"
                                            value={formData.workPincode}
                                            onChange={handleChange}
                                            placeholder="e.g. 600001"
                                            className={`w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black ${errors.pincode ? 'border-red-500' : ''}`}
                                        />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.pincode}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.radius')} <span className="text-gray-400 font-normal">{t('register.optional')}</span></label>
                                        <input
                                            type="number"
                                            name="radius"
                                            value={formData.radius}
                                            onChange={handleChange}
                                            placeholder="e.g. 10"
                                            className="w-full px-4 py-2.5 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-sm text-black"
                                        />
                                    </div>
                                </div>
                            )}


                            {isProvider && step === 4 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.idProof')}</label>
                                        <input
                                            type="file"
                                            name="idProof"
                                            onChange={handleChange}
                                            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-soft-black hover:file:bg-gray-200 ${errors.idProof ? 'border-red-500' : ''}`}
                                        />
                                        {errors.idProof && <p className="text-red-500 text-xs mt-1 ml-1">{errors.idProof}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.addressProof')}</label>
                                        <input
                                            type="file"
                                            name="addressProof"
                                            onChange={handleChange}
                                            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-soft-black hover:file:bg-gray-200 ${errors.addressProof ? 'border-red-500' : ''}`}
                                        />
                                        {errors.addressProof && <p className="text-red-500 text-xs mt-1 ml-1">{errors.addressProof}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.profilePhoto')}</label>
                                        <input
                                            type="file"
                                            name="profilePhoto"
                                            onChange={handleChange}
                                            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-soft-black hover:file:bg-gray-200 ${errors.profilePhoto ? 'border-red-500' : ''}`}
                                        />
                                        {errors.profilePhoto && <p className="text-red-500 text-xs mt-1 ml-1">{errors.profilePhoto}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.certificates')} <span className="text-gray-400 font-normal">{t('register.optional')}</span></label>
                                        <input
                                            type="file"
                                            name="certificates"
                                            onChange={handleChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-soft-black hover:file:bg-gray-200"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="agreedToTerms"
                                                checked={formData.agreedToTerms}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded text-soft-black focus:ring-soft-black"
                                            />
                                            <span className="text-xs text-gray-600">{t('register.agreeTerms')}</span>
                                        </label>
                                        {errors.agreedToTerms && <p className="text-red-500 text-xs mt-1 ml-1">{errors.agreedToTerms}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-3">

                                <button
                                    type="submit"
                                    className="w-full bg-soft-black text-white py-3 rounded-xl font-bold text-base hover:bg-black transition-transform active:scale-95 duration-200 shadow-lg cursor-pointer"
                                >
                                    {isProvider ? t('register.registerProfessional') : t('register.register')}
                                </button>
                            </div>

                            <div className="mt-6 text-center text-xs text-gray-500">
                                {t('register.alreadyHaveAccount')} {' '}
                                <Link to={isProvider ? "/login?role=service_provider" : "/login"} className="font-bold text-lg text-soft-black hover:underline"> &nbsp;{t('register.login')}</Link>
                            </div>
                        </div>



                        {showAddress && !isProvider && (
                            <>
                                <div className="hidden md:block w-px bg-black my-10 opacity-20 h-4/5 self-center"></div>
                                <div className="md:hidden h-px bg-black opacity-20 w-4/5 mx-auto my-4"></div>

                                <div className="transition-all duration-500 ease-in-out overflow-hidden max-h-[1000px] opacity-100 p-6 md:w-1/2 md:max-h-full md:p-8">
                                    <div className="h-full flex flex-col justify-center space-y-3">
                                        <h3 className="text-lg font-bold text-soft-black mb-2">{t('dashboard.address')}</h3>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-1">
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.houseFlatStreet')}</label>
                                                <input
                                                    type="text"
                                                    name="doorNo"
                                                    value={formData.doorNo}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.pincode')}</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.streetAddress')}</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.city')}</label>
                                                <input
                                                    type="text"
                                                    name="town"
                                                    value={formData.town}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.city')}</label>
                                                <input
                                                    type="text"
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('dashboard.state')}</label>
                                                <select
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 rounded-lg border border-black focus:border-soft-black outline-none transition-all bg-white text-sm appearance-none text-black"
                                                >
                                                    <option value="">{t('dashboard.state')}</option>
                                                    <optgroup label="Union Territories">
                                                        {unionTerritories.map(ut => <option key={ut} value={ut}>{ut}</option>)}
                                                    </optgroup>
                                                    <optgroup label="States">
                                                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-soft-black mb-1">{t('register.country')}</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.country}
                                                    readOnly
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 outline-none cursor-not-allowed text-sm"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowAddress(false)}
                                            className="text-xs text-red-500 hover:underline mt-2 self-end"
                                        >
                                            {t('register.removeAddress')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div >
        </div >
    );
};

export default Register;   
