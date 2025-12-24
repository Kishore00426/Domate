import React from 'react';
import { Link } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';

const Cart = () => {
    return (
        <HomeLayout>
            <div className="pt-10 px-4">
                <div className="max-w-6xl mx-auto">


                    <div className="bg-white rounded-3xl shadow-xl p-8 mt-20 text-center">
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-soft-black mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added any services yet.</p>
                        <Link to="/home" className="inline-block bg-soft-black text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-transform active:scale-95 duration-200 shadow-lg">
                            Browse Services
                        </Link>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
};

export default Cart;
