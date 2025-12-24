import React from 'react';

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

const ServiceCategories = ({ selectedCategory, onCategorySelect }) => {
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
              onClick={() => onCategorySelect && onCategorySelect(category.title)}
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
    </section>
  );
};

export default ServiceCategories;
