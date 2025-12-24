import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServiceCategories from '../components/ServiceCategories';
import HowItWorks from '../components/HowItWorks';
import WhyChooseUs from '../components/WhyChooseUs';
import Footer from '../components/Footer';

const Landing = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <HowItWorks />
            <WhyChooseUs />
            <Footer />
        </>
    );
};

export default Landing;
