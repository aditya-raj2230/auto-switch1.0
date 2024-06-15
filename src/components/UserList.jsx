// components/UserList.js
'use client'
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useFollow } from "../app/context/FollowContext"; // Import the FollowContext
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import { useRouter } from "next/navigation";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { followingList, setFollowingList } = useFollow(); // Use FollowContext
  const { user } = useAuth();
  const userId = user?.uid;
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [userId, searchTerm]);

  const handleProfileClick = (userId) => {
    router.push(`/addFriends/${userId}`);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      let q;
      if (searchTerm) {
        q = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          limit(10)
        );
      } else {
        q = query(usersRef, orderBy("firstName"), limit(10));
      }
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      // Filter out the logged-in user from the list
      const filteredUsers = userList.filter((user) => user.id !== userId);
      setUsers(filteredUsers);
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
      let q;
      if (searchTerm) {
        q = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          startAfter(lastVisible),
          limit(10)
        );
      } else {
        q = query(usersRef, orderBy("firstName"), startAfter(lastVisible), limit(10));
      }
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      const filteredUsers = userList.filter((user) => user.id !== userId);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by first name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => handleProfileClick(user.id)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4"></div>
                )}
                <h2 className="text-xl font-bold text-center">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 text-center">{user.bio}</p>
              </li>
            ))}
          </ul>
          {lastVisible && (
            <div className="text-center mt-6">
              <button
                onClick={fetchMoreUsers}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-800"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserList;
