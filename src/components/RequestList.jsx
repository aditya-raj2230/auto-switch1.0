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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-green-600 mb-4">My Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600 text-center">No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map(request => (
            <div key={request.id} className="p-2 border rounded-md shadow-sm flex flex-col">
              <div className="flex-shrink-0 mb-2">
                <img src={request.vehicleDetails.imageUrl} alt="Vehicle" className="rounded-lg shadow-md w-full h-32 object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-green-700 mb-1">
                  {request.vehicleDetails.manufacturer} {request.vehicleDetails.model}
                </h3>
                <p className="text-gray-600 text-sm mb-1">Year: {request.vehicleDetails.year}</p>
                <p className="text-gray-600 text-sm mb-1">Location: {request.vehicleDetails.city}, {request.vehicleDetails.state}</p>
                <p className="text-gray-600 text-sm mb-1">Start Date: {request.startDate}</p>
                <p className="text-gray-600 text-sm mb-1">End Date: {request.endDate}</p>
                <p className="text-gray-600 text-sm mb-1">Bidding Price: ${request.biddingPrice}</p>
                <div className="mt-2">
                  <p className="text-gray-600 text-sm">Request ID: {request.id}</p>
                  <Link href={`/addFriends/${request.senderId}`} passHref>
                    <div className="text-gray-600 flex items-center cursor-pointer text-sm">
                      Sender: {request.senderName}
                    </div>
                  </Link>
                </div>
              </div>
              <div className="mt-2 flex-shrink-0 flex flex-col space-y-2">
                <button className="w-full bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 text-sm">
                  Reject
                </button>
                <button 
                  className="w-full bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 text-sm"
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
