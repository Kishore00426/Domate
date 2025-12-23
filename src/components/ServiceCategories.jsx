import React from 'react';

const categories = [
  {
    image: "https://cdn-icons-png.flaticon.com/512/4807/4807695.png", // Salon (3D/High Quality)
    title: "Salon Prime"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/9563/9563066.png", // Cleaning (3D Vacuum)
    title: "Cleaning"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/8919/8919213.png", // Electrician (3D Tools)
    title: "Electricians & Carpenters"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/4213/4213502.png", // AC Repair (3D AC)
    title: "AC & Appliance Repair"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png", // Water Purifier (3D Water)
    title: "Native Water Purifier"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/9384/9384892.png", // Painting (3D Roller)
    title: "Painting & Waterproofing"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/6569/6569259.png", // Men's Salon (3D Barber)
    title: "Men's Salon & Massage"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/3659/3659898.png", // Smart Home (3D Home)
    title: "Smart Home Installation"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/2913/2913494.png", // Disinfection (3D Spray)
    title: "Disinfection Services"
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/6786/6786378.png", // Packers (3D Box/Truck)
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
              className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full"
            >
              <div className="w-20 h-20 mb-4 relative">
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
