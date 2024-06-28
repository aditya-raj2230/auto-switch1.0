'use client'
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config"; // Update with your Firebase config

const Marketplace = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch vehicles data from Firestore
    const fetchVehicles = async () => {
      try {
        const marketplaceCollection = db.collection("marketplace");
        const snapshot = await marketplaceCollection.get();
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehiclesData);
        setFilteredVehicles(vehiclesData); // Initially show all vehicles
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  // Handle search term change
  useEffect(() => {
    const filteredResults = vehicles.filter(
      (vehicle) =>
        vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filteredResults);
  }, [searchTerm, vehicles]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Vehicle Marketplace</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by manufacturer or model..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={vehicle.imageUrl} alt="Vehicle" className="h-48 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{vehicle.manufacturer}</h2>
              <p className="text-gray-600">{vehicle.model}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
