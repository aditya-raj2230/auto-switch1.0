'use client';
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/app/firebase/config";
import CheckAvailabilityModal from "../../components/CheckAvailabilityModal";
import { useAuth } from "../context/AuthContext";
import GroupsYouHaveJoined from "../../components/JoinedGroup";

const Marketplace = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null); 
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedCity, setSelectedCity] = useState(""); 
  const [vehicleType, setVehicleType] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const { user } = useAuth();
  const userId = user.uid;

  useEffect(() => {
    const fetchMarketplaceVehicles = async () => {
      try {
        let vehiclesQuery;
        if (selectedGroupId) {
          vehiclesQuery = collection(db, 'groups', selectedGroupId, 'marketplace');
        } else {
          vehiclesQuery = collection(db, "marketplace");
        }

        const vehicleSnapshot = await getDocs(vehiclesQuery);
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

        const uniqueCities = [...new Set(vehicleList.map((vehicle) => vehicle.city))];
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching marketplace vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceVehicles();
  }, [selectedGroupId]);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true); 
  };

  const handleCloseModal = () => {
    setModalOpen(false); 
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

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearchTerm =
      vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "" || vehicle.city === selectedCity;
    const matchesVehicleType = vehicleType === "" || vehicle.type === vehicleType;
    return matchesSearchTerm && matchesCity && matchesVehicleType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row mt-10 mb-20 bg-white">
      {/* Groups You've Joined */}
      <div className="w-full md:w-1/3 p-4 bg-white">
        
          <GroupsYouHaveJoined onSelectGroup={setSelectedGroupId} />
      
      </div>

      {/* Vehicle Listings */}
      <div className="overflow-y-auto w-full md:w-2/3 p-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="p-4 mx-auto max-w-3xl bg-white">
          <div className="flex flex-col md:flex-row md:justify-between mb-4 items-center gap-6">
            <div className="relative w-full md:w-1/3 ">
              <input
                type="text"
                placeholder="Search by model or manufacturer"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 pl-10 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ height: "40px" }}
              />
              <img
                src="/magnifying-glass.png"
                alt="Search"
                className="absolute left-3 top-2.5 w-5 h-5"
              />
            </div>
            <div className="relative w-full md:w-1/4">
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full p-2 pl-10 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ height: "40px" }}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <img
                src="/filter.png"
                alt="Filter"
                className="absolute left-3 top-2.5 w-5 h-5"
              />
            </div>
            <div className="relative w-full md:w-1/4">
              <select
                value={vehicleType}
                onChange={handleVehicleTypeChange}
                className="w-full p-2 pl-10 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{ height: "40px" }}
              >
                <option value="">All Types</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
              <img
                src={`${vehicleType === "bike" ? "/bike.png" : "/car(2).png"}`}
                alt="Type"
                className="absolute left-3 top-2.5 w-5 h-5"
              />
            </div>
          </div>

          {!modalOpen && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-center text-black-300">Marketplace</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-4 bg-white rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:bg-orange-100 hover:scale-105 cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    {/* Image section */}
                    <img src={vehicle.imageUrl} alt={vehicle.model} className="w-full h-40 object-cover rounded-t-lg" />

                    {/* Vehicle details */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">{vehicle.manufacturer} {vehicle.model}</h3>
                      <div className="flex items-center mt-2">
                       
                        <p className="text-gray-600">{vehicle.city}</p>
                      </div>

                      {/* Redundant Visit Profile Button */}
                      <button className="mt-4 w-full bg-black text-white py-2 rounded-lg">Visit Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {modalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <CheckAvailabilityModal
                  vehicleDetails={selectedVehicle}
                  onRequestSend={handleCloseModal}
                  onClose={handleCloseModal}
                  userId={userId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
