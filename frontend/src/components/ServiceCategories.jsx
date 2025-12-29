import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const categories = [
  {
    image: "/icons/women spa saloon makeup.png",
    title: "Salon & Spa"
  },
  {
    image: "/icons/cleaning.png",
    title: "Cleaning"
  },
  {
    image: "/icons/engineer.png",
    title: "Handyman Services"
  },
  {
    image: "/icons/ac.png",
    title: "AC & Appliance Repair"
  },
  {
    image: "/icons/mosquito.png",
    title: "Mosquito & Safety nets"
  },
  {
    image: "/icons/painting.png",
    title: "Painting & Waterproofing"
  },
  {
    image: "/icons/disinfectant spray.png",
    title: "Disinfection Services"
  },
  {
    image: "/icons/delhivery truck.png",
    title: "Packers & Movers"
  }
];

const handymanSubcategories = [
  { id: 'electrician', title: 'Electrician', image: '/icons/electrician.png' }, // Ensure these icons exist or use placeholders
  { id: 'plumber', title: 'Plumber', image: '/icons/plumber.png' },
  { id: 'carpenter', title: 'Carpenter', image: '/icons/carpenter.png' }
];

const ServiceCategories = ({ selectedCategory, onCategorySelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryTitle) => {
    if (categoryTitle === 'Handyman Services') {
      setIsModalOpen(true);
    } else {
      if (onCategorySelect) {
        onCategorySelect(categoryTitle);
      } else {
        // Navigate or default behavior if needed
      }
    }
  };

  const handleSubcategoryClick = (subcategoryTitle) => {
    setIsModalOpen(false);
    navigate(`/services?category=Handyman Services&subcategory=${subcategoryTitle}`);
  };

  return (
    <section className="py-8 px-8 md:mt-5" >
      <div className="max-w-6xl mx-auto">
        <div className="my-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-soft-black"> What are you looking for?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.title)}
              className={`flex flex-row items-center justify-start text-left p-4 bg-white rounded-2xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full gap-4 ${selectedCategory === category.title ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-100'}`}
            >
              <div className="w-16 h-16 shrink-0 relative">
                <div className="absolute inset-0 bg-beige rounded-full scale-0 group-hover:scale-110 transition-transform duration-300 -z-10"></div>
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-base font-bold text-soft-black leading-tight group-hover:text-black">
                {category.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Handyman Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with Category Image */}
            <div className="relative h-32 bg-gray-100">
              {/* Dynamically find Handyman category image or fallback */}
              <img
                src={
                  categories.find(c => c.title === 'Handyman Services')?.image ||
                  "/icons/engineer.png"
                }
                alt="Handyman Services"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-white">Handyman Services</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-3 gap-4">
              {handymanSubcategories.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSubcategoryClick(sub.title)}
                  className="flex flex-col items-center gap-2 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-beige/50 rounded-full flex items-center justify-center group-hover:bg-beige transition-colors aspect-square overflow-hidden p-3">
                    {/* Placeholder icon if image fails or generic icon */}
                    <img src={sub.image} alt={sub.title} className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-soft-black text-center">{sub.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceCategories;
