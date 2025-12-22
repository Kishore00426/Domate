import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-soft-black text-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">DoMate</h2>
                        <p className="text-gray-400 max-w-sm">Making home services reliable, affordable, and accessible for everyone.</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Social</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    © 2025 DoMate. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
