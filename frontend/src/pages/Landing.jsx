import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServiceCategories from '../components/ServiceCategories';
import HowItWorks from '../components/HowItWorks';
import WhyChooseUs from '../components/WhyChooseUs';
import Footer from '../components/Footer';
import GoToTop from '../components/GoToTop';
import { fetchServices } from '../store/servicesSlice';

const Landing = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch services from database
        dispatch(fetchServices());
    }, [dispatch]);

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
