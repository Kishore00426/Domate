import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
            {/* Background Decorative Blob */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-beige/40 rounded-full blur-3xl -z-10 animate-pulse delay-75"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-soft-beige/30 rounded-full blur-3xl -z-10 animate-pulse"></div>

            <div className="text-center max-w-3xl mx-auto space-y-8">
                <h1
                    className="text-5xl md:text-7xl font-bold tracking-tight text-soft-black leading-[1.1]"
                    dangerouslySetInnerHTML={{ __html: t('hero.title') }}
                >
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto font-light">
                    {t('hero.subtitle')}
                </p>

                {/* Get Started Button */}
                <div className="mt-6">
                    <Link to="/login" className="inline-block bg-soft-black text-white text-lg px-8 py-4 rounded-full font-medium hover:bg-black transition-all hover:-translate-y-1 shadow-lg active:scale-95 duration-200 cursor-pointer">
                        {t('hero.getStarted')}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
