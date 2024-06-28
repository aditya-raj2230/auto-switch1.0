'use client'
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';


const RequestList = ({userId}) => {
  const [requests, setRequests] = useState([]);
 
  
  const db = getFirestore();

  useEffect(() => {
    const fetchRequests = async () => {
      if (userId) {
        const q = query(collection(db, 'users', userId, 'requests'));
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(requestsData);
      }
    };

    fetchRequests();
  }, [userId, db]);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-6">My Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600">No requests found.</p>
      ) : (
        <div className="space-y-6">
          {requests.map(request => (
            <div key={request.id} className="p-4 border rounded-md shadow-sm">
              <h3 className="text-xl font-bold text-green-700 mb-2">
                {request.vehicleDetails.manufacturer} {request.vehicleDetails.model}
              </h3>
              <p className="text-gray-600 mb-1">Year: {request.vehicleDetails.year}</p>
              <p className="text-gray-600 mb-1">Location: {request.vehicleDetails.city}, {request.vehicleDetails.state}</p>
              <p className="text-gray-600 mb-1">Start Date: {request.startDate}</p>
              <p className="text-gray-600 mb-1">End Date: {request.endDate}</p>
              <p className="text-gray-600 mb-1">Bidding Price: ${request.biddingPrice}</p>
              <img src={request.vehicleDetails.imageUrl} alt="Vehicle" className="mt-2 rounded-lg shadow-md w-72 h-40" />
              <div className="mt-4">
                <p className="text-gray-600">Request ID: {request.id}</p>
                <p className="text-gray-600">Sender Name: {request.senderName}</p>
                <img src={request.senderProfileImageUrl} alt="Sender" className="mt-2 rounded-full w-12 h-12" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList;
