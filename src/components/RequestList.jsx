'use client'
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, getDocs, setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';

const RequestList = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const db = getFirestore();
  const router = useRouter();
  const { user } = useAuth();
  const loggedInUserId = user?.uid;

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

  const createChatRoomId = (userId1, userId2) => {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  };

  const handleSendMessage = async (request) => {
    if (!loggedInUserId) return;

    const chatRoomId = createChatRoomId(loggedInUserId, request.senderId);
    const messageTimestamp = new Date();

    const loggedInUserDetails = {
      id: loggedInUserId,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      lastMessageTimestamp: messageTimestamp,
      lastMessage: {
        senderId: loggedInUserId,
        text: '', // No initial message
        timestamp: messageTimestamp
      }
    };

    const selectedChatUser = {
      id: request.senderId,
      firstName: request.senderName.split(' ')[0],
      lastName: request.senderName.split(' ')[1] || '',
      lastMessageTimestamp: messageTimestamp,
      lastMessage: {
        senderId: loggedInUserId,
        text: '', // No initial message
        timestamp: messageTimestamp
      }
    };

    // Update both users' chat lists
    await setDoc(doc(db, `users/${loggedInUserId}/chats`, chatRoomId), selectedChatUser, { merge: true });
    await setDoc(doc(db, `users/${request.senderId}/chats`, chatRoomId), loggedInUserDetails, { merge: true });

    // Redirect to chat page
    router.push('/chat');
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-6">My Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600">No requests found.</p>
      ) : (
        <div className="space-y-6">
          {requests.map(request => (
            <div key={request.id} className="p-4 border rounded-md shadow-sm flex">
              <div className="flex-shrink-0">
                <img src={request.vehicleDetails.imageUrl} alt="Vehicle" className="rounded-lg shadow-md w-72 h-40" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  {request.vehicleDetails.manufacturer} {request.vehicleDetails.model}
                </h3>
                <p className="text-gray-600 mb-1">Year: {request.vehicleDetails.year}</p>
                <p className="text-gray-600 mb-1">Location: {request.vehicleDetails.city}, {request.vehicleDetails.state}</p>
                <p className="text-gray-600 mb-1">Start Date: {request.startDate}</p>
                <p className="text-gray-600 mb-1">End Date: {request.endDate}</p>
                <p className="text-gray-600 mb-1">Bidding Price: ${request.biddingPrice}</p>
                <div className="mt-4">
                  <p className="text-gray-600">Request ID: {request.id}</p>
                  <Link href={`/addFriends/${request.senderId}`}>
                    <p className="text-gray-600">Sender Name: {request.senderName}</p>
                    <img src={request.senderProfileImageUrl} alt="Sender" className="mt-2 rounded-full w-12 h-12" />
                  </Link>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button className="block w-full bg-green-500 text-white py-2 px-4 rounded-md mb-2 hover:bg-green-600">
                  Accept
                </button>
                <button className="block w-full bg-red-500 text-white py-2 px-4 rounded-md mb-2 hover:bg-red-600">
                  Reject
                </button>
                <button 
                  className="block w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  onClick={() => handleSendMessage(request)}
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList;