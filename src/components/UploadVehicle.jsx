'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const validatePincode = async (pincode) => {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const data = await response.json();
  return data[0].Status === 'Success';
};

const UploadVehicle = ({ userId }) => {
  const [formData, setFormData] = useState({
    type: 'car',
    manufacturer: '',
    model: '',
    year: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    image: null,
    addToMarketplace: false,
    putForSale: false,
    price: '',
    selectedGroups: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pincodeValid, setPincodeValid] = useState(true);
  const [groups, setGroups] = useState([]);
  const [userFullName, setUserFullName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchGroupsAndUser = async () => {
      const db = getFirestore();

      // Fetch user's full name
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserFullName(`${userDoc.data().firstName} ${userDoc.data().lastName}`);
      }

      // Fetch groups where user is a member
      const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const groupDocs = await getDocs(groupsQuery);
      const groupList = groupDocs.docs.map(doc => ({ id: doc.id, groupName: doc.data().name, ...doc.data() }));
      setGroups(groupList);
    };
    fetchGroupsAndUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        image: e.target.files[0],
      }));
    }
  };

  const handlePincodeChange = async (e) => {
    const { value } = e.target;
    if (/^\d+$/.test(value)) {
      setFormData((prevData) => ({
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

  const handleGroupSelection = (groupId) => {
    setFormData((prevData) => {
      const selectedGroups = prevData.selectedGroups.includes(groupId)
        ? prevData.selectedGroups.filter(id => id !== groupId)
        : [...prevData.selectedGroups, groupId];
      return { ...prevData, selectedGroups };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!pincodeValid) {
      setError('Invalid Pincode');
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const storage = getStorage();

      // Upload image to Firebase Storage
      let imageUrl = null;
      if (formData.image) {
        const storageRef = ref(storage, `vehicles/${userId}/${formData.image.name}`);
        const snapshot = await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Add vehicle details to Firestore
      const vehicleData = {
        ...formData,
        userId,
        imageUrl,
        userFullName,
      };
      await addDoc(collection(db, 'vehicles'), vehicleData);
      
      router.push('/marketplace');
    } catch (error) {
      setError('Error uploading vehicle');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Upload Your Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="block font-semibold mb-1">Vehicle Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              {indianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block font-semibold mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handlePincodeChange}
              className={`w-full p-2 border border-gray-300 rounded ${pincodeValid ? '' : 'border-red-500'}`}
              required
            />
            {!pincodeValid && (
              <span className="text-red-500 text-sm">Invalid Pincode</span>
            )}
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="block font-semibold mb-1">Vehicle Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="form-group mt-4">
          <label className="block font-semibold mb-1">Select Groups to Share With</label>
          <div className="grid grid-cols-2 gap-2">
            {groups.length > 0 ? (
              groups.map(group => (
                <label key={group.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={group.id}
                    checked={formData.selectedGroups.includes(group.id)}
                    onChange={() => handleGroupSelection(group.id)}
                    className="form-checkbox"
                  />
                  <span className="ml-2">{group.groupName}</span>
                </label>
              ))
            ) : (
              <p>No groups found</p>
            )}
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="addToMarketplace"
              checked={formData.addToMarketplace}
              onChange={(e) => setFormData({ ...formData, addToMarketplace: e.target.checked })}
              className="form-checkbox"
            />
            <span className="ml-2">Add to Marketplace</span>
          </label>
        </div>

        {formData.addToMarketplace && (
          <div className="form-group mt-4">
            <label className="block font-semibold mb-1">Price (in INR)</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-4">{error}</div>
        )}

        <button
          type="submit"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Vehicle'}
        </button>
      </form>
    </div>
  );
};

export default UploadVehicle;
