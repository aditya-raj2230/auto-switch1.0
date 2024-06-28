'use client';
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/app/firebase/config";
import CheckAvailabilityModal from "../../components/CheckAvailabilityModal"; // Import the CheckAvailabilityModal component
import { useAuth } from "../context/AuthContext";

const Marketplace = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // State to manage selected vehicle for modal
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [searchTerm, setSearchTerm] = useState(""); // State to manage search term
  const [selectedCity, setSelectedCity] = useState(""); // State to manage selected city filter
  const [vehicleType, setVehicleType] = useState(""); // State to manage vehicle type filter
  const [cities, setCities] = useState([]); // State to store available cities
  const {user} = useAuth()
  const userId=user.uid

  useEffect(() => {
    const fetchMarketplaceVehicles = async () => {
      try {
        const vehiclesCollection = collection(db, "marketplace");
        const vehicleSnapshot = await getDocs(vehiclesCollection);
        const vehicleList = await Promise.all(
          vehicleSnapshot.docs.map(async (doc) => {
            const vehicleData = doc.data();
            if (vehicleData.imageUrl) {
              const imageUrl = await getDownloadURL(ref(storage, vehicleData.imageUrl));
              return { id: doc.id, ...vehicleData, imageUrl };
            }
            return { id: doc.id, ...vehicleData };
          })
        );
        setVehicles(vehicleList);

        // Extract unique cities from vehicleList for the filter
        const uniqueCities = [...new Set(vehicleList.map(vehicle => vehicle.city))];
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching marketplace vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceVehicles();
  }, []);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true); // Open modal when a vehicle is clicked
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close modal
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleVehicleTypeChange = (e) => {
    setVehicleType(e.target.value);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearchTerm = vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "" || vehicle.city === selectedCity;
    const matchesVehicleType = vehicleType === "" || vehicle.type === vehicleType;
    return matchesSearchTerm && matchesCity && matchesVehicleType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      <div className="p-4 mx-auto max-w-3xl">
        <div className="flex flex-col md:flex-row md:justify-between mb-4 items-center">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by model or manufacturer"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <img
              src="/magnifying-glass.png" // Replace with your search icon path
              alt="Search"
              className="absolute left-3 top-2.5 w-5 h-5"
            />
          </div>
          <div className="relative w-full md:w-1/4 mb-4 md:mb-0">
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <img
              src="/filter.png" // Replace with your filter icon path
              alt="Filter"
              className="absolute left-3 top-2.5 w-5 h-5"
            />
          </div>
          <div className="relative w-full md:w-1/4">
            <select
              value={vehicleType}
              onChange={handleVehicleTypeChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">All Types</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
            <img
              src={`${vehicleType==="bike"?"/bike.png":"/car(2).png"}`} // Replace with your type icon path
              alt="Type"
              className="absolute left-3 top-2.5 w-5 h-5"
            />
          </div>
        </div>

        {!modalOpen && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Marketplace</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 bg-white rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:bg-green-100 hover:scale-105"
                >
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.manufacturer} ${vehicle.model}`}
                    className="w-full h-40 object-cover rounded-lg mb-2 cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)} // Handle click event
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {vehicle.manufacturer} {vehicle.model}
                  </h3>
                  <h5 className="font-semibold text-sm mb-2 text-gray-600">{vehicle.city} {vehicle.state}</h5>
                  <button
                    className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-green-700"
                    onClick={() => handleVehicleClick(vehicle)} // Handle click event
                  >
                    Check Availability
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal component */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <CheckAvailabilityModal
                vehicleDetails={selectedVehicle}
                onRequestSend={handleCloseModal} // Handle request send
                onClose={handleCloseModal} // Close modal
                userId={userId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
