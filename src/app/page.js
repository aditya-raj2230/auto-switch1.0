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
    return <div className="flex justify-center items-center h-screen bg-white text-gray-700">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen mb-20 bg-white">
      {!userId ? (
        <div className="w-full bg-orange-100"> {/* Updated background color for better contrast */}
          <Hero />
        </div>
      ) : (
        <>
          <div className="w-full md:w-1/3 p-4 bg-white rounded-lg"> {/* Updated with light background */}
            <UserProfile selectedUserId={userId} />
            <button
              onClick={() => setShowUploadVehicle(true)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-black transition-colors duration-300 mb-4"
            >
              Upload Vehicle
            </button>
            {showUploadVehicle && <UploadVehicle userData={userData} userId={userId} />}
          </div>

          <div className="w-full md:w-2/3 p-4 bg-white rounded-lg"> {/* Updated with light tan background */}
            <GroupList />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;

