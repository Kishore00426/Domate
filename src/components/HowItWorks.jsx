import React from 'react';

const HowItWorks = () => {
    return (
        <section className="py-24 bg-white/60">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-soft-black text-center mb-16">How it Works</h2>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                    {[
                        { step: '1', title: 'Choose a Service', desc: 'Select from our wide range of premium home services.' },
                        { step: '2', title: 'Book an Appointment', desc: 'Pick a convenient date and time slot.' },
                        { step: '3', title: 'Relax', desc: 'Our professional arrives and gets the job done.' }
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl font-bold text-soft-black border-4 border-white ring-1 ring-gray-100">
                                {item.step}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-soft-black mb-2">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
