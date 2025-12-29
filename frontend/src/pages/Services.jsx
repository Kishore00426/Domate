import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import ServiceCategories from '../components/ServiceCategories';
import ServiceList from '../components/ServiceList';
import ServiceBanner from '../components/ServiceBanner';
import SubcategoryGrid from '../components/SubcategoryGrid';
import { getCategoryDetails } from '../api/services';

const Services = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [categoryDetails, setCategoryDetails] = useState(null);

    // Initial load from URL params
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const subcategoryParam = searchParams.get('subcategory');

        if (categoryParam) {
            setSelectedCategory(categoryParam);
        } else {
            setSelectedCategory(null);
            setCategoryDetails(null);
        }

        if (subcategoryParam) {
            setSelectedSubcategory(subcategoryParam);
        } else {
            setSelectedSubcategory(null);
        }
    }, [searchParams]);

    // Fetch category details when selectedCategory changes
    useEffect(() => {
        const fetchDetails = async () => {
            if (selectedCategory) {
                const response = await getCategoryDetails(selectedCategory);
                if (response.success) {
                    setCategoryDetails(response.category);
                }
            }
        };

        fetchDetails();
    }, [selectedCategory]);

    const handleCategorySelect = (categoryTitle) => {
        // Navigate adds to history, making it shareable and back-button friendly
        setSearchParams({ category: categoryTitle });
        // State updates will happen via useEffect listening to searchParams
    };

    const handleSubcategorySelect = (subcategoryName) => {
        if (selectedSubcategory === subcategoryName) {
            // Toggle off? Or keep it? Usually filters toggle off.
            // Let's just update params
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('subcategory');
            setSearchParams(newParams);
        } else {
            setSearchParams({ category: selectedCategory, subcategory: subcategoryName });
        }
    };

    return (
        <HomeLayout>
            <div className="pt-24 pb-12">

                {selectedCategory ? (
                    // Category Specific View
                    <>
                        {categoryDetails && (
                            <ServiceBanner
                                // If a subcategory is selected, find it and use its details
                                // Otherwise fall back to the main category details
                                name={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find(s => s.name === selectedSubcategory)?.name
                                        : categoryDetails.name
                                }
                                description={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find(s => s.name === selectedSubcategory)?.description
                                        : categoryDetails.description
                                }
                                imageUrl={
                                    selectedSubcategory
                                        ? categoryDetails.subcategories?.find(s => s.name === selectedSubcategory)?.imageUrl
                                        : categoryDetails.imageUrl
                                }
                            />
                        )}

                        {categoryDetails?.subcategories && categoryDetails.subcategories.length > 0 && (
                            <SubcategoryGrid
                                subcategories={categoryDetails.subcategories}
                                selectedSubcategory={selectedSubcategory}
                                onSubcategorySelect={handleSubcategorySelect}
                                categoryName={categoryDetails.name} // Pass the main category name
                            />
                        )}

                        <div className="max-w-6xl mx-auto px-6 mb-8">
                            <h2 className="text-xl font-bold text-soft-black">
                                {selectedSubcategory ? `Services for ${selectedSubcategory}` : `All ${selectedCategory} Services`}
                            </h2>
                        </div>
                    </>
                ) : (
                    // Default View
                    <>
                        <ServiceCategories
                            selectedCategory={selectedCategory}
                            onCategorySelect={handleCategorySelect}
                        />
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="border-b border-gray-200 my-4"></div>
                        </div>
                    </>
                )}

                <ServiceList selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} />
            </div>
        </HomeLayout>
    );
};

export default Services;


