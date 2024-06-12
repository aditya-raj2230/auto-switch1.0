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
  const [bannerImageUrl, setBannerImageUrl] = useState(null);

  const [isEditing, setIsEditing] = useState({
    name: false,
    firstName: false,
    lastName: false,
    bio: false,
    modifications: false,
    favoriteCars: false,
    drivingExperiences: false,
    carCollection: false,
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
            setBannerImageUrl(data.bannerImageUrl);
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

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map((item) => item.trim());
    setUserData((prevData) => ({ ...prevData, [field]: values }));
  };

  const handleEditToggle = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = ref(storage, `${type}/${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);

    if (type === "profileImages") {
      setProfileImageUrl(imageUrl);
    } else {
      setBannerImageUrl(imageUrl);
    }

    if (userId) {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { [type === "profileImages" ? "profileImageUrl" : "bannerImageUrl"]: imageUrl });
      // Fetch the updated data again
      const updatedUserSnapshot = await getDoc(userDoc);
      if (updatedUserSnapshot.exists()) {
        const updatedData = updatedUserSnapshot.data();
        setUserData(updatedData);
        if (type === "profileImages") {
          setProfileImageUrl(updatedData.profileImageUrl);
        } else {
          setBannerImageUrl(updatedData.bannerImageUrl);
        }
      }
    }
  };

  const handleCheckboxChange = async (e) => {
    const isChecked = e.target.checked;
    setUserData((prevData) => ({ ...prevData, carSwappingInterest: isChecked }));

    if (userId) {
      const userDoc = doc(db, "users", userId);
      try {
        await updateDoc(userDoc, { carSwappingInterest: isChecked });
      } catch (error) {
        console.error("Error updating car swapping interest:", error);
        alert("Failed to update car swapping interest.");
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
    <div className="max-w-md mx-auto mb-24 bg-white shadow-md rounded-md m-10 p-6 relative">
      <div className="relative mb-8">
        {bannerImageUrl ? (
          <img src={bannerImageUrl} alt="Banner" className="w-full h-48 mb-24 object-cover rounded-t-md" />
        ) : (
          <div className="w-full h-48 mb-24 bg-gray-300 flex items-center justify-center text-gray-500 text-xl rounded-t-md">
            <span>Upload Banner</span>
          </div>
        )}
        <input
          type="file"
          onChange={(e) => handleImageUpload(e, "bannerImages")}
          className="hidden"
          id="banner-file-input"
        />
        <label
          htmlFor="banner-file-input"
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer absolute bottom-2 right-2"
        >
          +
        </label>
      </div>
      <div className="flex items-center  mb-4 absolute top-36 left-10">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" className="w-36 h-36 rounded-full mr-6" />
        ) : (
          <div className="w-36 h-36 rounded-full bg-gray-300 mr-6 flex items-center justify-center text-gray-500 text-xl">
            <span>+</span>
          </div>
        )}
        <input
          type="file"
          onChange={(e) => handleImageUpload(e, "profileImages")}
          className="hidden"
          id="profile-file-input"
        />
        <label
          htmlFor="profile-file-input"
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer absolute bottom-2 right-4 transform translate-x-1/4 translate-y-1/4"
        >
          +
        </label>
      </div>
      {['firstName', 'lastName', 'bio', 'modifications', 'favoriteCars', 'drivingExperiences', 'carCollection'].map((field) => (
        <div className="mb-4" key={field}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}:</h2>
            <button
              className="text-sm text-blue-500 focus:outline-none"
              onClick={() => handleEditToggle(field)}
            >
              Edit
            </button>
          </div>
          {!isEditing[field] && <p className="text-gray-600">{Array.isArray(userData[field]) ? userData[field].join(', ') : userData[field]}</p>}
          {isEditing[field] && (
            field === 'modifications' || field === 'favoriteCars' || field === 'drivingExperiences' || field === 'carCollection' ? (
              <input
                type="text"
                value={Array.isArray(userData[field]) ? userData[field].join(', ') : ''}
                onChange={(e) => handleArrayChange(e, field)}
                onBlur={() => handleEditToggle(field)}
                autoFocus
                className="mt-2 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              />
            ) : (
              <input
                type="text"
                value={userData[field] || ''}
                onChange={(e) => handleInputChange(e, field)}
                onBlur={() => handleEditToggle(field)}
                autoFocus
                className="mt-2 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              />
            )
          )}
        </div>
      ))}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Interested in Car Swapping:</h2>
          <input
            type="checkbox"
            checked={userData.carSwappingInterest || false}
            onChange={handleCheckboxChange}
            className="ml-2"
          />
        </div>
      </div>
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
