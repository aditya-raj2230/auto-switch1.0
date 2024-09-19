'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import { useAuth } from "./context/AuthContext";
import UploadVehicle from "@/components/UploadVehicle";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";

// Define lighter orange tones
const backgroundColor = "bg-orange-50";
const primaryColor = "bg-orange-100";
const secondaryColor = "bg-orange-200";

const websiteFeatures = [
  { name: "Chat", description: "Connect with friends and community.", link: "/chat", icon: "💬" },
  { name: "Marketplace", description: "Buy or sell vehicles in the community.", link: "/marketplace", icon: "🚗" },
  { name: "Add Friends", description: "Find and add new friends.", link: "/addFriends", icon: "👥" },
  { name: "Explore", description: "Discover groups and universities.", link: "/explore", icon: "🏫" },
  { name: "Profile", description: "View and edit your profile.", link: "/profile", icon: "🧑‍💼" },
];

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${backgroundColor} flex flex-col md:flex-row items-center p-4`}>
      {/* Left Section: Profile */}
      <div className={`w-full md:w-1/3 p-6 ${primaryColor} rounded-lg shadow-lg mb-6 md:mb-0`}>
        <UserProfile selectedUserId={userId} />
        <button
          onClick={() => setShowUploadVehicle(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mt-4"
        >
          Upload Vehicle
        </button>
        {showUploadVehicle && <UploadVehicle userData={userData} userId={userId} />}
      </div>

      {/* Right Section: Showcase Features */}
      <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {websiteFeatures.map((feature, index) => (
          <section
            key={index}
            className={`p-6 ${secondaryColor} rounded-lg shadow-lg flex flex-col items-start justify-between h-64`}
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{feature.icon}</span>
              <div>
                <h3 className="text-xl font-bold">{feature.name}</h3>
                <p className="text-sm">{feature.description}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(feature.link)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mt-auto"
            >
              Go
            </button>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Page;
