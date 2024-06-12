'use client'
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation"; // Correct router import
import { db } from "@/app/firebase/config";
import Profile from "@/components/Profile";

const UserProfile = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter
  
  
 

  useEffect(() => {
    // Ensure userId is available before fetching users
    const userId = router.query;
    if(!userId) {
      return <></>;
    }
    if (userId) {
      fetchUsers();
    }
  }, []);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("firstName"), limit(10));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, userId: doc.data().userId, ...doc.data() });
      });
      setUsers(userList);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const fetchMoreUsers = async () => {
    if (!lastVisible) return;
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("firstName"), startAfter(lastVisible), limit(10));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, userId: doc.data().userId, ...doc.data() });
      });
      setUsers((prevUsers) => [...prevUsers, ...userList]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  const handleProfileClick = (userId) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">User Profiles</h1>
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
            onClick={() => handleProfileClick(user.id)} // Add onClick handler
          >
            <img
              src={user.profileImageUrl || '/path/to/default/image.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4"
            />
            <div>
              <p className="text-lg font-semibold text-center">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-600">{user.userId}</p> {/* Display userId */}
            </div>
          </div>
        ))}
      </div>
      {lastVisible && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={fetchMoreUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
      <Profile />
    </div>
  );
};

export default UserProfile;
