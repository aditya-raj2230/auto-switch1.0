"use client";
import React from "react";

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-4">
      <img className="w-48 h-24 object-cover" src={vehicle.imageUrl} alt="Vehicle Image" />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{vehicle.manufacturer} {vehicle.model}</div>
        <p className="text-gray-700 text-base">Type: {vehicle.type}</p>
        <p className="text-gray-700 text-base">Year: {vehicle.year}</p>
        <p className="text-gray-700 text-base">Location: {vehicle.location}</p>
      </div>
    </div>
  );
};

export default VehicleCard;
