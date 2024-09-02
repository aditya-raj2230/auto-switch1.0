'use client';

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs, where, updateDoc, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "@/app/context/AuthContext";

const UserList = ({ groupId, onAddFriend, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, groupMembers]);

  const fetchGroupMembers = async () => {
    const groupRef = doc(db, "groups", groupId);
    const groupSnapshot = await getDoc(groupRef);
    if (groupSnapshot.exists()) {
      setGroupMembers(groupSnapshot.data().members);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef,
        orderBy("firstName"),
        where("firstName", ">=", searchTerm),
        where("firstName", "<=", searchTerm + "\uf8ff"),
        limit(10)
      );

      const userSnapshot = await getDocs(userQuery);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleAddFriend = async (selectedUser) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(selectedUser.id),
      });
      setGroupMembers(prevMembers => [...prevMembers, selectedUser.id]);
      onAddFriend(selectedUser);
    } catch (error) {
      console.error("Error adding friend to group:", error);
    }
  };

  const handleRemoveMember = async (selectedUser) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(selectedUser.id),
      });
      setGroupMembers(prevMembers => prevMembers.filter(memberId => memberId !== selectedUser.id));
    } catch (error) {
      console.error("Error removing friend from group:", error);
    }
  };

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
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="text-2xl font-bold mb-4 text-green-600">Add/Remove Members</div>
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
                {groupMembers.includes(user.id) ? (
                  <button
                    onClick={() => handleRemoveMember(user)}
                    className="bg-red-500 text-white px-4 py-2 mt-auto rounded hover:bg-red-700 w-full"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user)}
                    className="bg-blue-500 text-white px-4 py-2 mt-auto rounded hover:bg-blue-700 w-full"
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;
