import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

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

  // Fetch groups and user's full name
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
      const groupList = groupDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
    };
    fetchGroupsAndUser();
  }, [userId]);

  // Mock pincode validation function (replace this with actual API call if needed)
  const validatePincode = async (pincode) => {
    // This is a simple mock that checks if the pincode is 6 digits long
    return /^\d{6}$/.test(pincode);
  };

  // Handle form data changes
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

  // Handle form submission
// Handle form submission
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

    // Prepare vehicle data without the image
    const { image, ...restFormData } = formData;
    const vehicleData = {
      ...restFormData, // Exclude image here
      userId,
      userFullName,
      createdAt: serverTimestamp(),
    };

    // Upload image to Firebase Storage if an image is provided
    if (image) {
      // Use the specified path format 'vehicles/${image.name}'
      const storageRef = ref(storage, `vehicles/${image.name}`);
      const snapshot = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(snapshot.ref);  // Get the image URL

      // Include the imageUrl in the vehicleData
      vehicleData.imageUrl = imageUrl;
    }

    // Function to add vehicle to the group's marketplace
    const addToGroupMarketplace = async (groupId) => {
      const groupMarketplaceRef = collection(db, 'groups', groupId, 'marketplace');
      // Add vehicle to the group's marketplace subcollection
      await addDoc(groupMarketplaceRef, vehicleData);
    };

    // Upload to selected groups
    if (formData.selectedGroups.length > 0) {
      for (const groupId of formData.selectedGroups) {
        await addToGroupMarketplace(groupId);
      }
    }

    // Upload to global marketplace if checked
    if (formData.addToMarketplace) {
      const marketplaceRef = collection(db, 'marketplace');
      await addDoc(marketplaceRef, vehicleData);
    }

    // If the vehicle is put for sale, upload it to a 'vehiclesForSale' collection
    if (formData.putForSale && formData.price) {
      const forSaleData = { ...vehicleData, price: formData.price };
      const forSaleRef = collection(db, 'vehiclesForSale');
      await addDoc(forSaleRef, forSaleData);
    }

    router.push('/marketPlace');
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
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Type */}
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

          {/* Manufacturer, Model, Year */}
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
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Address */}
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
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Pincode */}
          <div className="form-group">
            <label className="block font-semibold mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handlePincodeChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            {!pincodeValid && (
              <span className="text-red-500 text-sm">Invalid Pincode</span>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="block font-semibold mb-1">Upload Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Group Selection */}
        <div className="form-group">
          <label className="block font-semibold mb-1">Select Groups</label>
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id}>
                <input
                  type="checkbox"
                  value={group.id}
                  checked={formData.selectedGroups.includes(group.id)}
                  onChange={() => handleGroupSelection(group.id)}
                />
                <label className="ml-2">{group.name}</label>
              </div>
            ))
          ) : (
            <p>No groups available</p>
          )}
        </div>

        {/* Add to Marketplace */}
        <div className="form-group">
          <label className="block font-semibold mb-1">Add to Marketplace</label>
          <input
            type="checkbox"
            name="addToMarketplace"
            checked={formData.addToMarketplace}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                addToMarketplace: e.target.checked,
              }))
            }
          />
        </div>

        {/* Put for Sale */}
        <div className="form-group">
          <label className="block font-semibold mb-1">Put for Sale</label>
          <input
            type="checkbox"
            name="putForSale"
            checked={formData.putForSale}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                putForSale: e.target.checked,
              }))
            }
          />
        </div>

        {/* Price (for sale) */}
        {formData.putForSale && (
          <div className="form-group">
            <label className="block font-semibold mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required={formData.putForSale}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Vehicle'}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default UploadVehicle;
