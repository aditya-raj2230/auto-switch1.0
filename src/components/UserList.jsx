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
      let firstNameQuery;
      let displayNameQuery;

      if (searchTerm) {
        firstNameQuery = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          limit(10)
        );

        displayNameQuery = query(
          usersRef,
          orderBy("displayName_upperCase"),
          where("displayName_upperCase", ">=", searchTerm.toUpperCase()),
          where("displayName_upperCase", "<=", searchTerm.toUpperCase() + "\uf8ff"),
          limit(10)
        );
      } else {
        firstNameQuery = query(usersRef, orderBy("firstName"), limit(10));
        displayNameQuery = query(usersRef, orderBy("displayName_upperCase"), limit(10));
      }

      const [firstNameSnapshot, displayNameSnapshot] = await Promise.all([
        getDocs(firstNameQuery),
        getDocs(displayNameQuery),
      ]);

      const firstNameUserList = [];
      firstNameSnapshot.forEach((doc) => {
        firstNameUserList.push({ id: doc.id, ...doc.data() });
      });

      const displayNameUserList = [];
      displayNameSnapshot.forEach((doc) => {
        displayNameUserList.push({ id: doc.id, ...doc.data() });
      });

      // Combine the lists and remove duplicates
      const combinedUserList = [...firstNameUserList, ...displayNameUserList];
      const uniqueUserList = Array.from(new Set(combinedUserList.map(user => user.id)))
        .map(id => combinedUserList.find(user => user.id === id));

      // Filter out the logged-in user from the list
      const filteredUsers = uniqueUserList.filter((user) => user.id !== userId);
      setUsers(filteredUsers);
      setLastVisible(firstNameSnapshot.docs[firstNameSnapshot.docs.length - 1]);
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
      let firstNameQuery;
      let displayNameQuery;

      if (searchTerm) {
        firstNameQuery = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          startAfter(lastVisible),
          limit(10)
        );

        displayNameQuery = query(
          usersRef,
          orderBy("displayName_upperCase"),
          where("displayName_upperCase", ">=", searchTerm.toUpperCase()),
          where("displayName_upperCase", "<=", searchTerm.toUpperCase() + "\uf8ff"),
          startAfter(lastVisible),
          limit(10)
        );
      } else {
        firstNameQuery = query(usersRef, orderBy("firstName"), startAfter(lastVisible), limit(10));
        displayNameQuery = query(usersRef, orderBy("displayName_upperCase"), startAfter(lastVisible), limit(10));
      }

      const [firstNameSnapshot, displayNameSnapshot] = await Promise.all([
        getDocs(firstNameQuery),
        getDocs(displayNameQuery),
      ]);

      const firstNameUserList = [];
      firstNameSnapshot.forEach((doc) => {
        firstNameUserList.push({ id: doc.id, ...doc.data() });
      });

      const displayNameUserList = [];
      displayNameSnapshot.forEach((doc) => {
        displayNameUserList.push({ id: doc.id, ...doc.data() });
      });

      // Combine the lists and remove duplicates
      const combinedUserList = [...firstNameUserList, ...displayNameUserList];
      const uniqueUserList = Array.from(new Set(combinedUserList.map(user => user.id)))
        .map(id => combinedUserList.find(user => user.id === id));

      const filteredUsers = uniqueUserList.filter((user) => user.id !== userId);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(firstNameSnapshot.docs[firstNameSnapshot.docs.length - 1]);
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
          placeholder="Search by first name or display name..."
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
