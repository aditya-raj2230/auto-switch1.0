'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { auth, storage } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import UserList from "@/components/UserList";


const CreateGroup = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [friendEmails, setFriendEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = ref(storage, `groupImages/${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);
    setGroupImageUrl(imageUrl);
  };

  const handleAddFriend = (email) => {
    setFriendEmails((prevEmails) => [...prevEmails, email]);
  };

  const handleCreateGroup = async () => {
    if (!groupName || !groupDescription || !groupImageUrl) {
      alert("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      const groupsCollection = collection(db, "groups");

      await addDoc(groupsCollection, {
        name: groupName,
        description: groupDescription,
        imageUrl: groupImageUrl,
        admin: userId,
        friends: friendEmails,
        members: [userId, ...friendEmails],
      });

      alert("Group created successfully!");
      router.push("/explore");
    } catch (error) {
      console.error("Error creating group: ", error);
      alert("Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Group</h1>
      <div className="mb-4">
        <label className="block text-gray-700">Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Group Description</label>
        <textarea
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Group Image</label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>
      {groupImageUrl && (
        <div className="mb-4">
          <img src={groupImageUrl} alt="Group" className="w-full h-64 object-cover rounded-md" />
        </div>
      )}
      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)} // Open the modal
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
        >
          Add Members
        </button>
      </div>
      <button
        onClick={handleCreateGroup}
        className={`w-full bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Group"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Select Friends</h2>
            <UserList handleAddFriend={handleAddFriend} />
            <button
              onClick={() => setShowModal(false)} // Close the modal
              className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroup;
