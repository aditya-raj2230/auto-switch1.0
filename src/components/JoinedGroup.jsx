'use client';

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";

const GroupsYouHaveJoined = ({ onSelectGroup }) => { // Add onSelectGroup prop
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (user) {
        try {
          const groupsQuery = query(collection(db, "groups"), where("members", "array-contains", user.uid));
          const groupSnapshot = await getDocs(groupsQuery);
          const userGroups = groupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setGroups(userGroups);
        } catch (error) {
          console.error("Error fetching user groups:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserGroups();
  }, [user]);

  if (loading) {
    return <div>Loading groups...</div>;
  }

  if (groups.length === 0) {
    return <div>No groups found</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-green-600">Groups You Have Joined</h2>
      <ul className="space-y-2">
        {/* Add 'All' option */}
        <li
          className="bg-gray-100 p-2 rounded-md shadow-sm cursor-pointer"
          onClick={() => onSelectGroup(null)} // Passing null resets to all vehicles
        >
          <h3 className="text-lg font-semibold">All Vehicles</h3>
        </li>
        {groups.map((group) => (
          <li
            key={group.id}
            className="bg-gray-100 p-2 rounded-md shadow-sm cursor-pointer"
            onClick={() => onSelectGroup(group.id)} // Passing selected group ID
          >
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-sm text-gray-600">{group.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupsYouHaveJoined;
