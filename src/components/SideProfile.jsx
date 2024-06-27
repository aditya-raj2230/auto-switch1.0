import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";
import Link from "next/link";

const SideProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const userToFetchId = auth.currentUser?.uid;

      if (!userToFetchId) {
        console.log("No user ID available");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching data for user ID: ${userToFetchId}`);
        const userDoc = doc(db, "users", userToFetchId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log("User data:", userData);
          setUserData(userData);
          setProfileImageUrl(userData.profileImageUrl);
        } else {
          console.log("No such document!");
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser?.uid]);

  const handleImageError = () => {
    console.log("Error loading profile image.");
    setProfileImageUrl(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="max-w-xs mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center px-6 py-3 bg-green-500">
        <h1 className="mx-3 text-white font-semibold text-lg">{userData.firstName.toUpperCase()}</h1>
      </div>
      <div className="p-4">
        <div className="flex justify-center -mt-16">
          {profileImageUrl ? (
            <img
              className="w-24 h-24 object-cover rounded-full border-2 border-green-500"
              src={profileImageUrl}
              alt="Profile"
              onError={handleImageError}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300"></div>
          )}
        </div>
        <div className="text-center mt-2">
          <h2 className="text-lg font-semibold text-gray-800">{userData.firstName.toUpperCase()}</h2>
          <p className="text-sm text-gray-600">{userData.bio}</p>
        </div>
        <div className="flex justify-center mt-4">
          <Link href="/profile" className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-700">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideProfile;
