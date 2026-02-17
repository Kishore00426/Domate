import React from 'react';
import { useTranslation } from 'react-i18next';

const WhyChooseUs = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2
                            className="text-4xl font-bold text-soft-black leading-tight"
                            dangerouslySetInnerHTML={{ __html: t('whyChooseUs.title') }}
                        >
                        </h2>

                        <div className="space-y-6">
                            {[
                                { title: t('whyChooseUs.verifiedTitle'), desc: t('whyChooseUs.verifiedDesc') },
                                { title: t('whyChooseUs.pricingTitle'), desc: t('whyChooseUs.pricingDesc') },
                                { title: t('whyChooseUs.guaranteeTitle'), desc: t('whyChooseUs.guaranteeDesc') }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-12 h-12 bg-beige rounded-xl flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-soft-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-soft-black">{item.title}</h3>
                                        <p className="text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-[2rem] overflow-hidden">
                            {/* Placeholder for an image */}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <img src="/happycustomers.png" alt="Happy Customers" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-soft-black">4.8</div>
                                <div
                                    className="text-sm text-gray-500"
                                    dangerouslySetInnerHTML={{ __html: t('whyChooseUs.rating') }}
                                >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
