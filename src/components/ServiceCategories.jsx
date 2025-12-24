import React from 'react';

const categories = [
  {
    image: "/icons/women makeup.png",
    title: "Salon Prime"
  },
  {
    image: "/icons/house cleaning.png",
    title: "Cleaning"
  },
  {
    image: "/icons/driller &hammer.png",
    title: "Electricians & Carpenters"
  },
  {
    image: "/icons/ac.png",
    title: "AC & Appliance Repair"
  },
  {
    image: "/icons/water purifier.png",
    title: "Water Purifier Service & Fix"
  },
  {
    image: "/icons/painting.png",
    title: "Painting & Waterproofing"
  },
  {
    image: "/icons/gent's massage.png",
    title: "Men's Salon & Massage"
  },
  {
    image: "/icons/bulb & switches.png",
    title: "Smart Home Installation"
  },
  {
    image: "/icons/disinfectant.png",
    title: "Disinfection Services"
  },
  {
    image: "/icons/delhivery truck.png",
    title: "Packers & Movers"
  }
];

const ServiceCategories = () => {
  return (
    <section className="py-8 px-8 md:mt-5" >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 pl-2">
          <h2 className="text-2xl font-bold text-soft-black">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-start text-left p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full gap-4"
            >
              <div className="w-16 h-16 shrink-0 relative">
                <div className="absolute inset-0 bg-gray-50 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300 -z-10"></div>
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
