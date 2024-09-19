
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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

const UploadVehicle = ({ userId, onClose }) => {
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
    selectedGroups: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pincodeValid, setPincodeValid] = useState(true);
  const [groups, setGroups] = useState([]);
  const router = useRouter();
  const modalRef = useRef();

  useEffect(() => {
    const fetchGroups = async () => {
      const db = getFirestore();
      const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const groupDocs = await getDocs(groupsQuery);
      const groupList = groupDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
    };
    fetchGroups();
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
      setError('Invalid pincode.');
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const storage = getStorage();

    try {
      let imageUrl = '';
      if (formData.image) {
        const storageRef = ref(storage, `vehicles/${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const vehicleData = {
        type: formData.type,
        manufacturer: formData.manufacturer,
        model: formData.model,
        year: formData.year,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        imageUrl,
        ownerId: userId,
      };

      await addDoc(collection(db, 'users', userId, 'vehicles'), vehicleData);

      if (formData.addToMarketplace) {
        await addDoc(collection(db, 'marketplace'), vehicleData);
      }

      for (const groupId of formData.selectedGroups) {
        await addDoc(collection(db, 'groups', groupId, 'marketplace'), vehicleData);
      }

      setFormData({
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
        selectedGroups: [],
      });

      setLoading(false);
      onClose();  // Close the modal after submission
      router.push('/edit');
    } catch (error) {
      setError('Error adding document: ', error);
      setLoading(false);
    }
  };

  // Close modal on outside click
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="relative p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-indigo-600">Add Vehicle</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            >
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handlePincodeChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 ${
                !pincodeValid ? 'border-red-500' : ''
              }`}
              required
            />
            {!pincodeValid && <p className="text-red-500 text-xs">Invalid pincode</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="addToMarketplace"
                checked={formData.addToMarketplace}
                onChange={() => setFormData((prevData) => ({ ...prevData, addToMarketplace: !prevData.addToMarketplace }))}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Add to marketplace</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Groups</label>
            {groups.map((group) => (
              <label key={group.id} className="block">
                <input
                  type="checkbox"
                  checked={formData.selectedGroups.includes(group.id)}
                  onChange={() => handleGroupSelection(group.id)}
                  className="mr-2 leading-tight"
                />
                {group.name}
              </label>
            ))}
          </div>
          <div>
            <button
              type="submit"
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
      </div>
    </div>
  );
};

export default UploadVehicle;
