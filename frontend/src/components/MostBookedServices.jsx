import React from 'react';
import { Star } from 'lucide-react';

const bookedServices = [
    {
        image: "https://images.unsplash.com/photo-1527515673516-75c44e03c537?q=80&w=2070&auto=format&fit=crop", // Office Cleaning
        title: "Office Cleaning",
        description: "Professional cleaning for your workspace.",
        rating: "4.8 (1.2k)",
        price: "$89"
    },
    {
        image: "https://images.unsplash.com/photo-1584622024886-dac281fd7526?q=80&w=2070&auto=format&fit=crop", // Bathroom Cleaning
        title: "Intense Bathroom Cleaning",
        description: "Deep cleaning for hygiene and shine.",
        rating: "4.9 (850)",
        price: "$49"
    },
    {
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop", // Sofa Cleaning
        title: "Sofa Cleaning",
        description: "Revitalize your furniture with expert care.",
        rating: "4.7 (2.1k)",
        price: "$35"
    },
    {
        image: "https://images.unsplash.com/photo-1581578731117-104f8a7469d0?q=80&w=2070&auto=format&fit=crop", // Disinfection
        title: "Home Disinfection",
        description: "Keep your home safe and germ-free.",
        rating: "4.9 (5k+)",
        price: "$120"
    }
];

const MostBookedServices = () => {
    return (
        <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 pl-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-soft-black">Most Booked Services</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bookedServices.map((service, index) => (
                        <div
                            key={index}
                            className="group rounded-xl overflow-hidden cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden rounded-xl">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                            </div>

                            {/* Content */}
                            <div className="pt-4">
                                <h3 className="font-bold text-soft-black mb-1 text-lg">{service.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{service.description}</p>
                                <div className="text-sm font-medium text-gray-900">Starts at <span className="font-bold">{service.price}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MostBookedServices;
