'use client'
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const UserList = ({ onAddFriend, onClose }) => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const userId = user?.uid;
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      let userQuery;

      if (searchTerm) {
        userQuery = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          limit(10)
        );
      } else {
        userQuery = query(usersRef, orderBy("firstName"), limit(10));
      }

      const userSnapshot = await getDocs(userQuery);
      const userList = [];

      userSnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });

      const filteredUsers = userList.filter((user) => user.id !== userId);
      setUsers(filteredUsers);
      setLastVisible(userSnapshot.docs[userSnapshot.docs.length - 1]);
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
      let nextQuery;

      if (searchTerm) {
        nextQuery = query(
          usersRef,
          orderBy("firstName"),
          where("firstName", ">=", searchTerm),
          where("firstName", "<=", searchTerm + "\uf8ff"),
          startAfter(lastVisible),
          limit(10)
        );
      } else {
        nextQuery = query(usersRef, orderBy("firstName"), startAfter(lastVisible), limit(10));
      }

      const nextSnapshot = await getDocs(nextQuery);
      const nextUserList = [];

      nextSnapshot.forEach((doc) => {
        nextUserList.push({ id: doc.id, ...doc.data() });
      });

      const filteredUsers = nextUserList.filter((user) => user.id !== userId);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(nextSnapshot.docs[nextSnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  // Handler to close the modal on outside click
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-background") {
      onClose();
    }
  };

  return (
    <div
      id="modal-background"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[800px] overflow-y-auto"
        style={{ width: "600px", height: "800px" }}
      >
        <div className="text-2xl font-bold mb-4 text-green-600">Discover</div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by first name or display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-green-500 rounded-lg focus:outline-none focus:border-green-300"
          />
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="border border-green-200 rounded-lg p-4 flex flex-col justify-between items-center cursor-pointer hover:shadow-md hover:border-4 hover:border-green-300 overflow-hidden"
                >
                  <div className="flex flex-col items-center mb-4">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
                    )}
                    <h2 className="text-lg font-bold text-black truncate text-center">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600 truncate text-center">{user.bio}</p>
                  </div>
                  <button
                    onClick={() => onAddFriend(user)}
                    className="bg-blue-500 text-white px-4 py-2 mt-auto rounded hover:bg-blue-700 w-full"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
            {lastVisible && (
              <div className="text-center mt-6">
                <button
                  onClick={fetchMoreUsers}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;
