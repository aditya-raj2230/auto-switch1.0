'use client';
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useRouter } from "next/navigation";

const FollowersList = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const currentUserId = user?.uid;

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const userList = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.following && u.followingf.includes(currentUserId));
        setFollowers(userList);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchFollowers();
    }
  }, [currentUserId]);

  const router = useRouter()
  const handleProfileClick = (id) => {
    router.push(`/addFriends/${id}`)
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-lg relative">
      <h1 className="text-2xl font-bold mb-6">Followers</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {followers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => handleProfileClick(user.id)}
            >
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4"
              />
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersList;
