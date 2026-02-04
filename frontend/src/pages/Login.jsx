import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../api/auth';

const Login = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'user';
    const isProvider = role === 'service_provider';

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        let tempErrors = {};
        if (!formData.email) {
            tempErrors.email = t('login.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = t('login.errors.emailInvalid');
        }

        if (!formData.password) {
            tempErrors.password = t('login.errors.passwordRequired');
        } else if (formData.password.length < 6) {
            tempErrors.password = t('login.errors.passwordLength');
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const data = await login({ email: formData.email, password: formData.password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'service_provider') {
                    navigate('/provider/dashboard');
                } else {
                    navigate('/home');
                }
            } catch (err) {
                console.error("Login failed", err);
                let errorMessage = t('login.errors.loginFailed');

                if (err.code === 'ERR_NETWORK') {
                    errorMessage = t('login.errors.networkError');
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                }

                setErrors({ ...errors, form: errorMessage });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <div className="min-h-screen bg-beige flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">


                <div className="absolute top-4 right-14 p-2 z-10">
                    <button
                        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}
                        className="text-sm font-bold text-gray-400 hover:text-soft-black transition-colors uppercase"
                    >
                        {i18n.language === 'en' ? 'TA' : 'EN'}
                    </button>
                </div>

                <Link to="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-soft-black transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>

                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-soft-black mb-2">{t('login.welcome')}</h2>
                        <p className="text-gray-500">{t('login.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.form && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errors.form}</div>}
                        <div>
                            <label className="block text-sm font-semibold text-soft-black mb-2">{t('login.emailLabel')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('login.emailPlaceholder')}
                                className={`w-full px-4 py-3 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-soft-black ${errors.email ? 'border-red-500' : ''}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-soft-black mb-2">{t('login.passwordLabel')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t('login.passwordPlaceholder')}
                                    className={`w-full px-4 py-3 rounded-xl border border-black focus:border-soft-black focus:ring-0 outline-none transition-all bg-white placeholder-gray-400 text-soft-black ${errors.password ? 'border-red-500' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-soft-black"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                        </div>

                        <button type="submit" className="w-full bg-soft-black text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-transform active:scale-95 duration-200 shadow-lg mt-4 cursor-pointer">
                            {t('login.loginButton')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        {t('login.noAccount')} {' '}
                        <Link to={isProvider ? "/register?role=service_provider" : "/register"} className="font-bold text-soft-black hover:underline">{t('login.signUp')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
