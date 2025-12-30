import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: '' // Simple security measure
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }

        try {
            // Mock Registration Logic
            console.log('Admin Register Attempt:', formData);

            // In a real app, validate secretKey on backend
            if (formData.secretKey !== 'domate-secret') {
                throw new Error('Invalid Admin Secret Key');
            }

            // Simulate success
            setTimeout(() => {
                navigate('/admin/login');
            }, 1500);

        } catch (err) {
            setError(err.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-soft-black flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-soft-black mb-1">New Admin Access</h1>
                        <p className="text-gray-500 text-xs">Create a new administrator account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-5 text-center border border-red-100 animate-in shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-soft-black focus:ring-1 focus:ring-soft-black outline-none transition-all placeholder-gray-400 text-sm text-soft-black"
                                placeholder="Full Name"
                                required
                            />
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-soft-black focus:ring-1 focus:ring-soft-black outline-none transition-all placeholder-gray-400 text-sm text-soft-black"
                                placeholder="Email Address"
                                required
                            />
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-soft-black focus:ring-1 focus:ring-soft-black outline-none transition-all placeholder-gray-400 text-sm text-soft-black"
                                    placeholder="Password"
                                    required
                                />
                                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-soft-black focus:ring-1 focus:ring-soft-black outline-none transition-all placeholder-gray-400 text-sm text-soft-black"
                                    placeholder="Confirm"
                                    required
                                />
                                <CheckSameIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                name="secretKey"
                                value={formData.secretKey}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-soft-black focus:ring-1 focus:ring-soft-black outline-none transition-all placeholder-gray-400 text-sm text-soft-black"
                                placeholder="Admin Secret Key"
                                required
                            />
                            <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-soft-black text-white py-3 rounded-xl font-bold text-base hover:bg-black transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Register Access'} <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-xs">
                            Already an admin? <Link to="/admin/login" className="text-soft-black font-semibold hover:underline">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon
const CheckSameIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
)

export default AdminRegister;
