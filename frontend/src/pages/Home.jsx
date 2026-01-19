import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import Carousel from '../components/Carousel';
import CleanHomeServices from '../components/CleanHomeServices';
import ServiceCategories from '../components/ServiceCategories';
import OurExperts from '../components/OurExperts';

const Home = () => {
    return (
        <HomeLayout>
            <Carousel />
            <ServiceCategories />
            <CleanHomeServices />
            <OurExperts />
        </HomeLayout>
    );
};

export default Home;
