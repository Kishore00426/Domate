import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails, getAllCategories } from '../api/services';
import { getImageUrl } from '../utils/imageUrl';

const categories = [
    {
        image: "/icons/women spa saloon makeup.png",
        id: "Salon & Spa",
        translationKey: "salonSpa"
    },
    {
        image: "/icons/cleaning.png",
        id: "Cleaning",
        translationKey: "cleaning"
    },
    {
        image: "/icons/engineer.png",
        id: "Handyman Services",
        translationKey: "handyman"
    },
    {
        image: "/icons/ac.png",
        id: "AC & Appliance Repair",
        translationKey: "acAppliance"
    },
    {
        image: "/icons/mosquito.png",
        id: "Mosquito & Safety nets",
        translationKey: "mosquito"
    },
    {
        image: "/icons/painting.png",
        id: "Painting & Waterproofing",
        translationKey: "painting"
    },
    {
        image: "/icons/disinfectant spray.png",
        id: "Disinfection Services",
        translationKey: "disinfection"
    },
    {
        image: "/icons/delhivery truck.png",
        id: "Packers & Movers",
        translationKey: "packersMovers"
    }
];

// Configuration for mapping cards to database content
const modalConfig = {
    "Salon & Spa": { type: "group", names: ["Salon", "Spa"] }, // Matches "Salon " leniently if needed
    "Handyman Services": { type: "group", names: ["Electrician", "Plumbing", "Carpenter"] },
    "AC & Appliance Repair": { type: "group", names: ["AC Services", "Appliance Service"] },
    "Painting & Waterproofing": { type: "group", names: ["Painting", "Waterproofing", "Wallpaper Service"] },
    "Cleaning": { type: "parent", name: "Cleaning" },
    "Mosquito & Safety nets": { type: "parent", name: "Mosquito & Safety Nets" },
    "Disinfection Services": { type: "parent", name: "Pest Control" },
    "Packers & Movers": { type: "parent", name: "Packers and Movers" }
};

const ServiceCategories = ({ selectedCategory, onCategorySelect }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Master list of all categories from DB (for Group strategy)
    const [allCategories, setAllCategories] = useState([]);

    // Current content to show in modal
    const [modalContent, setModalContent] = useState([]);
    const [modalTitle, setModalTitle] = useState("");
    const [modalImage, setModalImage] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch all categories on mount to have them ready for Group filtering
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const response = await getAllCategories();
                if (response.success) {
                    setAllCategories(response.categories);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchAll();
    }, []);

    const handleCategoryClick = async (category) => {
        setIsModalOpen(true);
        setLoading(true);
        setError(null);

        // Use translated title for display
        setModalTitle(t(`home.categories.items.${category.translationKey}`));

        // Set modal image from static card data
        setModalImage(category.image);

        // Use ID for logic lookup
        const config = modalConfig[category.id];

        if (!config) {
            // Fallback if no config: try to find category by id directly
            await fetchParentStrategy(category.id);
            return;
        }

        if (config.type === "group") {
            // FILTER strategy: Find categories in `allCategories` that match `config.names`
            // We use lenient matching (includes) to handle "AC Services" vs "AC" etc.
            const matches = allCategories.filter(cat =>
                config.names.some(name =>
                    cat.name.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(cat.name.toLowerCase())
                )
            );

            // Map to common display format
            const items = matches.map(cat => ({
                _id: cat._id,
                name: cat.name,
                imageUrl: cat.imageUrl,
                type: 'category', // It's a main category
                // For group items, the category itself is the filter
                navParam: `?category=${encodeURIComponent(cat.name)}`
            }));

            setModalContent(items);
            setLoading(false);

        } else if (config.type === "parent") {
            await fetchParentStrategy(config.name);
        }
    };

    const fetchParentStrategy = async (dbName) => {
        try {
            const response = await getCategoryDetails(dbName);
            if (response.success && response.category) {
                const subcats = response.category.subcategories || [];
                const items = subcats.map(sub => ({
                    _id: sub._id,
                    name: sub.name,
                    imageUrl: sub.imageUrl,
                    type: 'subcategory',
                    // For parent subcategories, we filter by category AND subcategory
                    navParam: `?category=${encodeURIComponent(dbName)}&subcategory=${encodeURIComponent(sub.name)}`
                }));
                setModalContent(items);
            } else {
                // Category might not exist or has no subcategories
                setModalContent([]);
            }
        } catch (err) {
            console.error("Error fetching category details", err);
            setModalContent([]);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (navParam) => {
        setIsModalOpen(false);
        navigate(`/services${navParam}`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent([]);
        setError(null);
    };

    return (
        <section id="service-categories" className="py-8 px-8 md:mt-5" >
            <div className="max-w-6xl mx-auto">
                <div className="my-2 mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-soft-black"> {t('home.categories.title')}</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            onClick={() => handleCategoryClick(category)}
                            className={`flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left p-3 md:p-4 bg-white rounded-2xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full gap-2 md:gap-4 ${selectedCategory === category.id ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-100'}`}
                        >
                            <div className="w-10 h-10 md:w-16 md:h-16 shrink-0 relative">
                                <div className="absolute inset-0 bg-beige rounded-full scale-0 group-hover:scale-110 transition-transform duration-300 -z-10"></div>
                                <img
                                    src={category.image}
                                    alt={category.id}
                                    className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <h3 className="text-xs md:text-base font-bold text-soft-black leading-tight group-hover:text-black">
                                {t(`home.categories.items.${category.translationKey}`)}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Category Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Category Image */}
                        <div className="relative h-32 bg-gray-100">
                            <>
                                <img
                                    src={modalImage || "/icons/default.png"}
                                    alt={modalTitle}
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <h3 className="text-xl font-bold text-white">{modalTitle}</h3>
                                </div>
                            </>

                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors rounded-full p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            {loading && (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-black"></div>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-8">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-soft-black text-white rounded-lg hover:bg-black transition-colors"
                                    >
                                        {t('home.categories.modal.close')}
                                    </button>
                                </div>
                            )}

                            {!loading && !error && (
                                <>
                                    {modalContent && modalContent.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-4">
                                            {modalContent.map((item) => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => handleItemClick(item.navParam)}
                                                    className="flex flex-col items-center gap-2 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="w-16 h-16 bg-beige/50 rounded-full flex items-center justify-center group-hover:bg-beige transition-colors aspect-square overflow-hidden">
                                                        <img
                                                            src={getImageUrl(item.imageUrl) || "/icons/default.png"}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-soft-black text-center">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 mb-4">{t('home.categories.modal.noServices')}</p>
                                            <button
                                                onClick={handleCloseModal}
                                                className="px-4 py-2 bg-soft-black text-white rounded-lg hover:bg-black transition-colors"
                                            >
                                                {t('home.categories.modal.close')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ServiceCategories;
