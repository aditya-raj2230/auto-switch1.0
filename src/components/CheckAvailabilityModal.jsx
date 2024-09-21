'use client';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../app/context/AuthContext'; // Adjust to your auth context path

const VehicleDetailsModal = ({ vehicleDetails, onClose, userId }) => {
  const [userData, setUserData] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log('User data fetched: ', userDoc.data());
          } else {
            console.error('User document not found');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      }
    };
    fetchUserData();
  }, [userId, db]);

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Vehicle Details"
      ariaHideApp={false}
      className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-6 max-h-full"
      overlayClassName="fixed inset-0 mt-10 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-600">Vehicle Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-lg font-medium text-green-700">
              {vehicleDetails.manufacturer} {vehicleDetails.model}
            </p>
            <p className="text-gray-600">{vehicleDetails.year}</p>
            <p className="text-gray-600">
              Location: {vehicleDetails.city}, {vehicleDetails.state}
            </p>
            <p className="text-gray-600">Price: ${vehicleDetails.price}</p>
            <p className="text-gray-600">Uploaded by: {vehicleDetails.ownerId}</p>
            <img
              src={vehicleDetails.imageUrl}
              alt="Vehicle"
              className="mt-2 rounded-lg shadow-md w-72 h-40"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => console.log('Message button clicked')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Message Seller
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleDetailsModal;
