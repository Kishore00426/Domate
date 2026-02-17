import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-soft-black text-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="DoMate" className="h-8 w-auto" />
                        </div>
                        <p className="text-gray-400 max-w-sm">{t('footer.desc')}</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">{t('footer.company')}</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">{t('footer.social')}</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    © 2025 DoMate. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
