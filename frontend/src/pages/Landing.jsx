import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServiceCategories from '../components/ServiceCategories';
import HowItWorks from '../components/HowItWorks';
import WhyChooseUs from '../components/WhyChooseUs';
import Footer from '../components/Footer';
import GoToTop from '../components/GoToTop';

const Landing = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <HowItWorks />
            <WhyChooseUs />
            <Footer />
            <GoToTop />
        </>
    );
};

export default Landing;
