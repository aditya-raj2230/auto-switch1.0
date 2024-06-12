'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditForm = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [isEditing, setIsEditing] = useState({
    name: false,
    firstName: false,
    lastName: false,
    bio: false,
  });

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);
            setProfileImageUrl(data.profileImageUrl);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleInputChange = (e, field) => {
    setUserData((prevData) => ({ ...prevData, [field]: e.target.value }));
  };

  const handleEditToggle = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = ref(storage, `profileImages/${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);

    setProfileImageUrl(imageUrl);

    if (userId) {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { profileImageUrl: imageUrl });
      // Fetch the updated data again
      const updatedUserSnapshot = await getDoc(userDoc);
      if (updatedUserSnapshot.exists()) {
        const updatedData = updatedUserSnapshot.data();
        setUserData(updatedData);
        setProfileImageUrl(updatedData.profileImageUrl);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (userId) {
      const userDoc = doc(db, "users", userId);
      try {
        // Update user data
        await updateDoc(userDoc, userData);
        alert("Profile updated successfully!");
        router.push('/');
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md m-10 p-6">
      <div className="flex items-center relative mb-4">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" className="w-96 h-96 rounded-full mr-6" />
        ) : (
          <div className="w-96 h-96 rounded-full bg-gray-300 mr-6 flex items-center justify-center text-gray-500 text-xl">
            <span>+</span>
          </div>
        )}
        <input
          type="file"
          onChange={handleImageUpload}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer absolute bottom-10 right-10 transform translate-x-1/4 translate-y-1/4"
        >
          +
        </label>
      </div>
      {['name', 'firstName', 'lastName', 'bio'].map((field) => (
        <div className="mb-4" key={field}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)}:</h2>
            <button
              className="text-sm text-blue-500 focus:outline-none"
              onClick={() => handleEditToggle(field)}
            >
              Edit
            </button>
          </div>
          {!isEditing[field] && <p className="text-gray-600">{userData[field]}</p>}
          {isEditing[field] && (
            <input
              type={field === 'bio' ? 'textarea' : 'text'}
              value={userData[field] || ''}
              onChange={(e) => handleInputChange(e, field)}
              onBlur={() => handleEditToggle(field)}
              autoFocus
              className="mt-2 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          )}
        </div>
      ))}
      <button
        onClick={handleSaveChanges}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditForm;
