'use client';
import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useFollow } from "../app/context/FollowContext"; // Import the FollowContext

const UserList = ({ userId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGray, setIsGray] = useState(false);
  const { user } = useAuth();
  const { followingList, setFollowingList } = useFollow();
  const currentUserId = user?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.id !== userId);
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowingList = async () => {
      if (currentUserId) {
        try {
          const userDoc = doc(db, "users", currentUserId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setFollowingList(userSnapshot.data().following || []);
          }
        } catch (error) {
          console.error("Error fetching following list:", error);
        }
      }
    };

    fetchUsers();
    fetchFollowingList();
  }, [userId, currentUserId, setFollowingList]);

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

  const handleProfileClick = (id) => {
    // Implement profile click logic
  };

  const handleCopy = () => {
    const urlInput = document.getElementById("urlInput");
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    alert("URL copied to clipboard");
    setShowModal(false);
    setIsGray(true);
    setTimeout(() => {
      setIsGray(false);
    }, 5000);
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-lg relative">
      <h1 className="text-2xl font-bold mb-6">Add Friends</h1>
      <button
        className={`px-4 py-2 rounded-lg absolute right-8 top-6 ${isGray ? "bg-gray-600 hover:bg-gray-800" : "bg-indigo-600 hover:bg-indigo-800"} text-white`}
        onClick={() => setShowModal(true)}
      >
        Invite Friend
      </button>
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">Share this URL with friends:</p>
            <input
              type="text"
              id="urlInput"
              value="https://auto-switch1-0.vercel.app/profile"
              readOnly
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg mr-2 hover:bg-green-800"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
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
    </div>
  );
};

export default UserList;
