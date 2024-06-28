'use client';
import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useFollow } from "../app/context/FollowContext"; // Import the FollowContext
import { Router } from "next/router";
import { useRouter } from "next/navigation";

const FollowingList = () => {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const { user } = useAuth();
  const { followingList, setFollowingList } = useFollow();
  const currentUserId = user?.uid;

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      setLoading(true);
      try {
        const userDoc = doc(db, "users", currentUserId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const followingIds = userSnapshot.data().following || [];
          const usersCollection = collection(db, "users");
          const usersSnapshot = await getDocs(usersCollection);
          const userList = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(u => followingIds.includes(u.id));
          setFollowingUsers(userList);
          setFollowingList(followingIds); // Ensure the followingList context is updated
        }
      } catch (error) {
        console.error("Error fetching following users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchFollowingUsers();
    }
  }, [currentUserId]);

  const handleFollow = async (targetUserId) => {
    if (followLoading) return; // Prevent multiple requests
    setFollowLoading(true);

    const isFollowing = followingList.includes(targetUserId);
    const userDocRef = doc(db, "users", currentUserId);
    const targetUserDocRef = doc(db, "users", targetUserId);

    // Optimistic UI update
    setFollowingList((prevList) =>
      isFollowing ? prevList.filter((id) => id !== targetUserId) : [...prevList, targetUserId]
    );

    try {
      await updateDoc(userDocRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
        followingCount: increment(isFollowing ? -1 : 1),
      });

      await updateDoc(targetUserDocRef, {
        followers: isFollowing ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
        followerCount: increment(isFollowing ? -1 : 1),
      });
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Revert the optimistic update if the request fails
      setFollowingList((prevList) =>
        isFollowing ? [...prevList, targetUserId] : prevList.filter((id) => id !== targetUserId)
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const router = useRouter()
  const handleProfileClick = (id) => {
    router.push(`/addFriends/${id}`)
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-lg relative">
      <h1 className="text-2xl font-bold mb-6">Following</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {followingUsers.map((user) => (
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
                <button
                  className={`${followingList.includes(user.id) ? "bg-gray-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-gray-800" : "bg-indigo-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-indigo-800"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(user.id);
                  }}
                >
                  {followingList.includes(user.id) ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingList;
