"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/app/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import EditForm from "./EditForm";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const UpdateForm = ({ userId, vehicleId, onClose }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pincodeValid, setPincodeValid] = useState(true);
  const [updatedVehicle, setUpdatedVehicle] = useState(false);
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

  const validatePincode = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        setPincodeValid(true);
      } else {
        setPincodeValid(false);
      }
    } catch (error) {
      console.error("Error validating pincode:", error);
      setPincodeValid(false);
    }
  };

  const handlePincodeChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      setVehicleData((prevData) => ({ ...prevData, pincode: value }));
      if (value.length === 6) {
        validatePincode(value);
      } else {
        setPincodeValid(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!pincodeValid) {
      alert("Invalid Pincode");
      return;
    }
  
    // Check if all required fields are filled
    const requiredFields = ["type", "manufacturer", "model", "year", "addressLine1", "addressLine2", "city", "state", "pincode"];
    for (const field of requiredFields) {
      if (!vehicleData[field]) {
        alert(`Please fill out the ${field} field.`);
        return;
      }
    }
  
    let imageUrl = vehicleData.imageUrl; // Use existing imageUrl if available
  
    if (vehicleData.image instanceof File) {
      // Image has been updated, upload new image to Firebase Storage
      const storageRef = ref(storage, `vehicles/${vehicleData.image.name}`);
      await uploadBytes(storageRef, vehicleData.image);
      imageUrl = await getDownloadURL(storageRef);
    }
  
    // Update Firestore document with updated data including imageUrl
    const vehicleDoc = doc(db, "users", userId, "vehicles", vehicleId);
    try {
      await updateDoc(vehicleDoc, {
        type: vehicleData.type,
        manufacturer: vehicleData.manufacturer,
        model: vehicleData.model,
        year: vehicleData.year,
        addressLine1: vehicleData.addressLine1,
        addressLine2: vehicleData.addressLine2,
        city: vehicleData.city,
        state: vehicleData.state,
        pincode: vehicleData.pincode,
        imageUrl: imageUrl,
      });
  
      alert("Vehicle updated successfully!");
      setUpdatedVehicle(true);
      onClose(); // Call onClose to close the modal or form
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle.");
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!updatedVehicle ? (
        <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold mb-6">Update Vehicle</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={vehicleData.type}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
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
              required
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
              required
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
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={vehicleData.addressLine1}
              onChange={handleInputChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={vehicleData.addressLine2}
              onChange={handleInputChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={vehicleData.city}
              onChange={handleInputChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              name="state"
              value={vehicleData.state}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={vehicleData.pincode}
              onChange={handlePincodeChange}
              className={`mt-2 block w-full px-3 py-2 border ${pincodeValid ? 'border-gray-300' : 'border-red-500'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {!pincodeValid && (
              <p className="mt-1 text-xs text-red-500">Please enter a valid 6-digit pincode.</p>
            )}
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
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <EditForm />
      )}
    </div>
  );
};

export default UpdateForm;
