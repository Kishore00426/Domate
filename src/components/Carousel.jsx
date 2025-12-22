import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: 'https://plus.unsplash.com/premium_photo-1667509213002-f15f1c9eaac8?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Expert Home Services',
        subtitle: 'From cleaning to repairs, we have you covered.'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1606570424625-6fcfae3b1259?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Festive Season begins',
        subtitle: 'We are here to make your festive season a healthy & memorable one.'
    },
    {
        id: 3,
        image: 'https://plus.unsplash.com/premium_photo-1678766819153-b3f7307c5127?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Skilled Electricians',
        subtitle: 'Safe and reliable electrical repairs.'
    }
];

const Carousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[600px] w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear transform scale-105"
                        style={{ backgroundImage: `url(${slide.image})`, transform: index === current ? 'scale(110%)' : 'scale(100%)' }}
                    ></div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            {slide.subtitle}
                        </p>
                        <Link
                            to="/register"
                            className="bg-white text-soft-black px-8 py-3 rounded-full font-bold hover:bg-beige transition-colors shadow-xl animate-in fade-in zoom-in duration-500 delay-200"
                        >
                            Book Now
                        </Link>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
