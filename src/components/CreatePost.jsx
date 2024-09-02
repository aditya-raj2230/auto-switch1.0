"use client";
import React, { useState } from "react";
import { storage, db } from "@/app/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc } from "firebase/firestore";
import { useAuth } from "../app/context/AuthContext";

const CreatePostForm = ({ isExpanded, onClose, onExpand }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [rentOrPool, setRentOrPool] = useState('rent');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `requests/${user.uid}/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const userDocRef = doc(db, "users", user.uid);

      await addDoc(collection(userDocRef, "requests"), {
        startDate,
        endDate,
        description,
        bidAmount,
        rentOrPool,
        imageUrl,
        createdAt: new Date(),
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
      });

      // Clear form fields
      setStartDate("");
      setEndDate("");
      setDescription("");
      setBidAmount("");
      setImageFile(null);

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error creating request:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={onExpand} className="bg-green-500 text-white py-2 px-4 rounded">
        Create Request
      </button>
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Request</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="w-full mb-4 p-2 border rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="w-full mb-4 p-2 border rounded"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full mb-4 p-2 border rounded"
              />
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Bid Amount per Day"
                className="w-full mb-4 p-2 border rounded"
              />
              <select
                value={rentOrPool}
                onChange={(e) => setRentOrPool(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
              >
                <option value="rent">Rent</option>
                <option value="pool">Pool</option>
              </select>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full mb-4 p-2 border rounded"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                {loading ? 'Posting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostForm;
