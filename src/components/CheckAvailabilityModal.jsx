'use client';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { getFirestore, collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../app/context/AuthContext'; // Adjust to your auth context path

const CheckAvailabilityModal = ({ vehicleDetails, onRequestSend, onClose,userId }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [biddingPrice, setBiddingPrice] = useState('');
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

  const handleRequestSend = async () => {
    if (!userData) {
      console.error('User data not available');
      return;
    }

    if (!biddingPrice) {
      console.error('Bidding price is required');
      return;
    }

    const requestData = {
      senderId: userId,
      senderName: userData.firstName,
      senderProfileImageUrl: userData.profileImageUrl,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      biddingPrice,
      vehicleDetails,
    };

    try {
      await addDoc(collection(db, 'users', vehicleDetails.ownerId, 'requests'), requestData);
      console.log('Request sent: ', requestData);
      onRequestSend(requestData);
      onClose(); // Close the modal once the request is sent
    } catch (error) {
      console.error('Error adding request: ', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Check Availability"
      ariaHideApp={false}
      className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-6 max-h-full"
      overlayClassName="fixed inset-0 mt-10 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-600">Check Availability</h2>
        <div className="space-y-4">
          <div className="">
            <p className="text-lg font-medium text-green-700">
              {vehicleDetails.manufacturer} {vehicleDetails.model}
            </p>
            <p className="text-gray-600">{vehicleDetails.year}</p>
            <p className="text-gray-600">
              {vehicleDetails.city} {vehicleDetails.state}
            </p>
            <img
              src={vehicleDetails.imageUrl}
              alt="Vehicle"
              className="mt-2 rounded-lg shadow-md w-72 h-40"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={format(endDate, 'yyyy-MM-dd')}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="biddingPrice" className="block text-sm font-medium text-gray-700">
              Bidding Price
            </label>
            <input
              type="number"
              id="biddingPrice"
              name="biddingPrice"
              value={biddingPrice}
              onChange={(e) => setBiddingPrice(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              required
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleRequestSend}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Send Request
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckAvailabilityModal;
