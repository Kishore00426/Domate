import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import Carousel from '../components/Carousel';
import MostBookedServices from '../components/MostBookedServices';
import ServiceCategories from '../components/ServiceCategories';

const Home = () => {
    return (
        <HomeLayout>
            <Carousel />
            <ServiceCategories />
            <MostBookedServices />
            
        </HomeLayout>
    );
};

export default Home;
