'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import GroupList from "@/components/GroupList";
import { useAuth } from "./context/AuthContext";
import UploadVehicle from "@/components/UploadVehicle";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import Hero from "@/components/Hero";

const Page = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadVehicle, setShowUploadVehicle] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen mb-20">
      {!userId ? (
        <div className="w-full bg-white">
          <Hero />
        </div>
      ) : (
        <>
          <div className="w-full md:w-1/3 p-4">
            <UserProfile selectedUserId={userId} />
            <button
              onClick={() => setShowUploadVehicle(true)} // Show the UploadVehicle component on button click
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Upload Vehicle
            </button>
            {showUploadVehicle && <UploadVehicle userData={userData} userId={userId} />}
          </div>
          <div className="w-full md:w-2/3 p-4">
            <GroupList />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
