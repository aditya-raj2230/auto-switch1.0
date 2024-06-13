"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import VehicleCard from "./VehicleCard";

const VehicleList = ({ userId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (userId) {
        try {
          const vehiclesRef = collection(db, "users", userId, "vehicles");
          const q = query(vehiclesRef);
          const querySnapshot = await getDocs(q);
          const vehiclesList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setVehicles(vehiclesList);
        } catch (error) {
          console.error("Error fetching vehicles:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVehicles();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (vehicles.length === 0) {
    return <div>No vehicles found.</div>;
  }

  return (
    <div className="flex flex-wrap justify-around gap-4">
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList;
