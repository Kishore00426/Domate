import React from 'react';
import HomeLayout from '../layouts/HomeLayout';
import ServiceCategories from '../components/ServiceCategories';
import ServiceList from '../components/ServiceList';

const Services = () => {
    const [selectedCategory, setSelectedCategory] = React.useState(null);

    const handleCategorySelect = (categoryTitle) => {
        // Toggle: if clicking same category, unselect it
        if (selectedCategory === categoryTitle) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryTitle);
        }
    };

    return (
        <HomeLayout>
            <div className="pt-24 pb-12">
                <ServiceCategories
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                />

                {/* Visual Separator */}
                <div className="max-w-6xl mx-auto px-6">
                    <div className="border-b border-gray-200 my-4"></div>
                </div>

                <ServiceList selectedCategory={selectedCategory} />
            </div>
        </HomeLayout>
    );
};

export default Services;
