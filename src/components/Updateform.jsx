"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
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

const validatePincode = async (pincode) => {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const data = await response.json();
  return data[0].Status === 'Success';
};

const UpdateForm = ({ userId, vehicleId }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pincodeValid, setPincodeValid] = useState(true);
  const [updatedVehicle, setUpdatedVehicle] = useState(false);
  const [inMarketplace, setInMarketplace] = useState(false); // Track if vehicle is in marketplace
  const router = useRouter();

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (userId) {
        try {
          const vehicleDoc = doc(db, "users", userId, "vehicles", vehicleId);
          const vehicleSnapshot = await getDoc(vehicleDoc);
          if (vehicleSnapshot.exists()) {
            setVehicleData(vehicleSnapshot.data());
            // Check if vehicle is in marketplace
            const marketplaceDoc = doc(db, "marketplace", vehicleId);
            const marketplaceSnapshot = await getDoc(marketplaceDoc);
            setInMarketplace(marketplaceSnapshot.exists());
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

  const handlePincodeChange = async (e) => {
    const { value } = e.target;
    if (/^\d+$/.test(value)) {
      setVehicleData((prevData) => ({
        ...prevData,
        pincode: value,
      }));

      if (value.length === 6) {
        const isValid = await validatePincode(value);
        setPincodeValid(isValid);
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

      // If addToMarketplace is checked, update the marketplace collection
      if (vehicleData.addToMarketplace && !inMarketplace) {
        const marketplaceDoc = doc(db, "marketplace", vehicleId);
        await setDoc(marketplaceDoc, {
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
          ownerId: userId,
        });
      } else if (!vehicleData.addToMarketplace && inMarketplace) {
        const marketplaceDoc = doc(db, "marketplace", vehicleId);
        await deleteDoc(marketplaceDoc);
      }

      alert("Vehicle updated successfully!");
      setUpdatedVehicle(true);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle.");
    }
  };

  const handleCancel = () => {
    setUpdatedVehicle(false); // Reset updatedVehicle state
  };

  // Function to handle checkbox change (for adding/removing from marketplace)
  const handleCheckboxChange = async (e) => {
    const { checked } = e.target;

    if (checked && !inMarketplace) {
      // Add to marketplace
      const marketplaceDoc = doc(db, "marketplace", vehicleId);
      try {
        await setDoc(marketplaceDoc, {
          type: vehicleData.type,
          manufacturer: vehicleData.manufacturer,
          model: vehicleData.model,
          year: vehicleData.year,
          addressLine1: vehicleData.addressLine1,
          addressLine2: vehicleData.addressLine2,
          city: vehicleData.city,
          state: vehicleData.state,
          pincode: vehicleData.pincode,
          imageUrl: vehicleData.imageUrl,
          ownerId: userId,
        });
        setInMarketplace(true);
        alert("Added to marketplace!");
      } catch (error) {
        console.error("Error adding to marketplace:", error);
        alert("Failed to add to marketplace.");
      }
    } else if (!checked && inMarketplace) {
      // Remove from marketplace
      const marketplaceDoc = doc(db, "marketplace", vehicleId);
      try {
        await deleteDoc(marketplaceDoc);
        setInMarketplace(false);
        alert("Removed from marketplace!");
      } catch (error) {
        console.error("Error removing from marketplace:", error);
        alert("Failed to remove from marketplace.");
      }
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
              type="number"
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
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            {!pincodeValid && (
              <p className="text-red-500 text-xs mt-1">Invalid Pincode</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              id="addToMarketplace"
              name="addToMarketplace"
              type="checkbox"
              checked={vehicleData.addToMarketplace || inMarketplace}
              onChange={handleCheckboxChange} // Updated to handleCheckboxChange
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="addToMarketplace" className="ml-2 block text-sm text-gray-900">
              Add to Marketplace
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSaveChanges}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold">Update Successful</h2>
          <button
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateForm;

