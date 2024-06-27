// components/RightFeed.js
'use client';
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

const RightFeed = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, orderBy("firstName"), limit(5));
      const snapshot = await getDocs(usersQuery);

      const userList = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleProfileClick = (userId) => {
    router.push(`/addFriends/${userId}`);
  };

  const handleViewMore = () => {
    router.push(`/addFriends`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-80 h-auto overflow-y-auto">
        <div className="text-2xl font-bold mb-4 text-green-600">Discover</div>
    {loading ? (
      <div>Loading...</div>
    ) : (
      <>
        <ul className="space-y-4">
          {users.slice(0, 5).map((user) => (
            <li
              key={user.id}
              onClick={() => handleProfileClick(user.id)}
              className="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              )}
              <div className="ml-4">
                <h2 className="text-md font-bold">
                  {user.firstName} {user.lastName}
                </h2>
              </div>
            </li>
          ))}
        </ul>
        {users.length > 4 && (
          <div className="text-center mt-4">
            <button
              onClick={handleViewMore}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-800"
            >
              View More
            </button>
          </div>
        )}
      </>
    )}
  </div>
  );
};

export default RightFeed;
