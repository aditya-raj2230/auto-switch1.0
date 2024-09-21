"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const Hero = () => {
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUniversities, setFilteredUniversities] = useState([]);

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
            Buy, sell, or rent vehicles securely within your campus.
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

      {/* Security and Signup Section */}
      <section className="relative w-full bg-white py-12 px-6 lg:px-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Security is Our Priority
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl text-center mb-8">
          We ensure that your transactions and personal data are encrypted and
          secure. Join a trusted platform to connect with your university's
          community confidently.
        </p>
        <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={() => window.location.href = "/auth/signup"}
          >
            Sign Up
          </button>
          <button
            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition duration-300"
            onClick={() => window.location.href = "/auth/login"}
          >
            Login
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-12 px-6 lg:px-12 bg-gray-50 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Why Choose Our Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Secure Connections</h3>
            <p className="text-gray-600">
              All communication between users is encrypted, ensuring your data
              stays safe and private.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Community-Driven</h3>
            <p className="text-gray-600">
              Connect with people from your university and build meaningful
              relationships within a trusted network.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Easy Onboarding</h3>
            <p className="text-gray-600">
              Getting started is quick and easy, with a seamless sign-up
              experience to get you connected fast.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative w-full bg-gray-100 py-12 px-6 lg:px-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Stay Updated
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl text-center mb-8">
          Subscribe to our newsletter to receive updates on new features,
          community events, and exclusive offers.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 w-full sm:w-auto text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
};

export default Hero;
