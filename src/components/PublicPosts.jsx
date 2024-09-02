'use client';

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

const PublicRequests = ({ groupId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "requests"), where("groupId", "==", groupId));
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching public requests: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchRequests();
    }
  }, [groupId]);

  if (loading) {
    return <p>Loading public requests...</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">Public Requests:</h2>
      {requests.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {requests.map(request => (
            <li key={request.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <p className="font-bold">{request.userName}</p>
              <p>{request.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No public requests available.</p>
      )}
    </div>
  );
};

export default PublicRequests;
