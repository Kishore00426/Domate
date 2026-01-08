import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import HomeLayout from '../layouts/HomeLayout';

const MyPlans = () => {
    const navigate = useNavigate();

    return (
        <HomeLayout>
            <div className="pt-[100px] px-4 pb-20 max-w-4xl mx-auto">
                <div className="sticky top-24 z-10 mb-6">
                    <button
                        onClick={() => navigate('/account')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-soft-black">My Plans</h1>
                                <p className="text-gray-500 mt-1">View and manage your subscription plans</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-soft-black mb-2">No Active Plans</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            You don't have any active subscription plans at the moment. Explore our services to find a plan that suits your needs.
                        </p>
                        <button
                            onClick={() => navigate('/services')}
                            className="mt-6 bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            Explore Services
                        </button>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default MyPlans;
