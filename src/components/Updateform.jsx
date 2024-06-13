"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/app/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import EditForm from "./EditForm";

const UpdateForm = ({ userId, vehicleId, onClose }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedVehicle, setUpdatedVehicle]=useState(false)
  const router = useRouter();

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (userId) {
        try {
          const vehicleDoc = doc(db, "users", userId, "vehicles", vehicleId);
          const vehicleSnapshot = await getDoc(vehicleDoc);
          if (vehicleSnapshot.exists()) {
            setVehicleData(vehicleSnapshot.data());
          } else {
            console.log("No such vehicle document!");
          }
        } catch (error) {
          console.error("Error fetching vehicle data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchVehicleData();
  }, [userId, vehicleId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setVehicleData((prevData) => ({ ...prevData, image: e.target.files[0] }));
  };

  const handleSaveChanges = async () => {
    let imageUrl = '';
    if (vehicleData.image) {
      const storageRef = ref(storage, `vehicles/${vehicleData.image.name}`);
      await uploadBytes(storageRef, vehicleData.image);
      imageUrl = await getDownloadURL(storageRef);
      vehicleData.profileImageUrl = imageUrl;
    }

    const vehicleDoc = doc(db, "users", userId, "vehicles", vehicleId);
    try {
      await updateDoc(vehicleDoc, vehicleData);
      alert("Vehicle updated successfully!");
      router.push('/edit');
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle.");
    }
    setUpdatedVehicle(true)
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    { !updatedVehicle?   <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold mb-6">Update Vehicle</h2>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
            name="type"
            value={vehicleData.type}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            </select>
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
            type="text"
            name="manufacturer"
            value={vehicleData.manufacturer}
            onChange={handleInputChange}
            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
            type="text"
            name="model"
            value={vehicleData.model}
            onChange={handleInputChange}
            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
            type="text"
            name="year"
            value={vehicleData.year}
            onChange={handleInputChange}
            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
            type="text"
            name="location"
            value={vehicleData.location}
            onChange={handleInputChange}
            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
            type="file"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
        </div>
        <div className="flex justify-end space-x-4">
            <button
            onClick={handleSaveChanges}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
            Save Changes
            </button>
            <button
            onClick={()=>{router.push('/edit')}}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
            Cancel
            </button>
        </div>
        </div>:<EditForm/>}
    </div>
  );
};

export default UpdateForm;
