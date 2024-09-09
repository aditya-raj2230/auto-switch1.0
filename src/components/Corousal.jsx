"use client";

import { useState, useEffect } from "react";

const cars = [
  {
    id: 1,
    name: "Tesla Model S",
    description: "An electric luxury sedan with cutting-edge technology.",
    imageUrl: "/philippe-toupet-bMgsIepVv_Q-unsplash.jpg", // Replace with your own images
  },
  {
    id: 2,
    name: "BMW X5",
    description: "A versatile and powerful SUV with a comfortable ride.",
    imageUrl: "/philippe-toupet-bMgsIepVv_Q-unsplash.jpg", // Replace with your own images
  },
  {
    id: 3,
    name: "Audi R8",
    description: "A high-performance sports car with a sleek design.",
    imageUrl: "/philippe-toupet-bMgsIepVv_Q-unsplash.jpg", // Replace with your own images
  },
];

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % cars.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="relative flex justify-center items-center h-72 overflow-hidden">
      {cars.map((car, index) => {
        const isActive = index === activeIndex;
        const isPrev = index === (activeIndex - 1 + cars.length) % cars.length;
        const isNext = index === (activeIndex + 1) % cars.length;

        return (
          <div
            key={car.id}
            className={`absolute flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${
              isActive
                ? "transform scale-105 z-20" // Center image bigger
                : isPrev || isNext
                ? "transform scale-90 translate-x-[-100%] z-10 opacity-100" // Previous and next images
                : "transform scale-75 translate-x-[200%] z-0 opacity-50" // Other images far away with reduced opacity
            }`}
          >
            <img
              src={car.imageUrl}
              alt={car.name}
              className="w-48 h-28 rounded-lg shadow-md"
            />
            <h3 className="text-md font-bold mt-2">{car.name}</h3>
            <p className="text-xs text-gray-600">{car.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Carousel;
