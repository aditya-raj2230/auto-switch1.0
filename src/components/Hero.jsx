"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Carousel from "./Corousal"; // Updated Carousel component

const Hero = () => {
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUniversities, setFilteredUniversities] = useState([]);

  // Fetching universities using a free API
  useEffect(() => {
    const fetchUniversities = async () => {
      const response = await fetch(
        "http://universities.hipolabs.com/search?country=United%20States"
      );
      const data = await response.json();
      setUniversities(data);
    };
    fetchUniversities();
  }, []);

  // Filtering universities based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = universities.filter((uni) =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities([]); // Clear the list when searchTerm is empty
    }
  }, [searchTerm, universities]);

  return (
    <div className="relative flex flex-col min-h-screen">
      <section
        className="relative flex flex-col xl:flex-row justify-between items-center gap-5 m-0 h-[90vh] px-6 lg:px-12 py-8 bg-gray-50"
        style={{ zIndex: 10, paddingTop: "50px" }}
      >
        {/* Left side column: Caption and Form */}
        <div className="relative z-30 xl:w-1/3 flex flex-col items-center xl:items-start mt-0 xl:mt-8">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 text-center xl:text-left leading-tight">
            Join Your Campus Car Community
          </h1>
          <p className="text-lg font-light text-gray-600 mb-4 text-center xl:text-left max-w-md">
            Buy, sell, or rent vehicles within your campus.
          </p>

          {/* Input box and button directly under the text */}
          <div className="relative flex flex-col xl:flex-row items-center xl:items-start gap-8 mb-12">
            <input
              type="text"
              placeholder="Search your university"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ height: "40px" }}
            />

            <button
              className="bg-black text-white w-full xl:w-auto py-2 px-6 rounded-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center"
              onClick={() =>
                alert("Search community functionality to be implemented")
              }
            >
              Search
            </button>
          </div>

          {/* Dropdown suggestions */}
          {filteredUniversities.length > 0 && (
            <div className="absolute z-40 w-full bg-white shadow-lg rounded-lg border border-gray-300 max-h-40 overflow-y-auto mt-1">
              {filteredUniversities.map((uni, index) => (
                <div
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm(uni.name)}
                >
                  {uni.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Larger Image */}
        <div className="relative w-full xl:w-2/3 h-auto xl:mt-[-4rem]">
          <Image
            src="/final(1).jpg"
            alt="logo"
            layout="responsive"
            width={1000}
            height={600}
            className="rounded-lg shadow-lg object-contain mt-20"
          />
        </div>

        {/* Translucent floating boxes for decorative purposes */}
        <div className="absolute top-8 left-8 bg-blue-500 opacity-30 w-36 h-36 rounded-full blur-2xl animate-[moveAcrossScreen_10s_linear_infinite]"></div>
        <div className="absolute bottom-8 right-16 bg-yellow-500 opacity-30 w-40 h-24 rounded-full blur-2xl animate-[moveAcrossScreen_12s_linear_infinite]"></div>
        <div className="absolute bottom-1/2 right-1/2 bg-red-500 opacity-30 w-36 h-32 rounded-full blur-2xl animate-[moveAcrossScreen_15s_linear_infinite]"></div>
      </section>

      {/* Bottom Carousel */}
      <div className="relative w-full h-96 bg-gray-100 p-4">
        <Carousel />
      </div>
    </div>
  );
};

export default Hero;