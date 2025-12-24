import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import ServiceCategories from '../components/ServiceCategories';

const Services = () => {
    return (
        <HomeLayout>
            <div className="pt-24 pb-12">
                <ServiceCategories />
            </div>
        </HomeLayout>
    );
};

export default Services;
