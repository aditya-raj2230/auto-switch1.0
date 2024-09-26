'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import { useAuth } from "./context/AuthContext";
import UploadVehicle from "@/components/UploadVehicle";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import Hero from "@/components/Hero";

// Define gray tones
const backgroundColor = "bg-gray-50";
const primaryColor = "bg-gray-100";
const secondaryColor = "bg-gray-200";

const websiteFeatures = [
  { name: "Chat", description: "Connect with friends and community.", link: "/chat", icon: "💬" }, 
  { name: "Marketplace", description: "Buy or sell vehicles in the community.", link: "/marketPlace", icon: "🚗" },
  { name: "Add Friends", description: "Find and add new friends.", link: "/addFriends", icon: "🤝" }, 
  { name: "Explore", description: "Discover groups and universities.", link: "/explore", icon: "🌍" }, 
  { name: "Profile", description: "View and edit your profile.", link: "/", icon: "🧑‍💼" }, 
];

const Page = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  if (!user) {
    return <Hero />;
  }

  return (
    <div className={`min-h-screen ${backgroundColor} flex flex-col md:flex-row items-center p-4`}>
      {/* Left Section: Profile */}
      <div className={`w-full md:w-1/3 p-6 ${primaryColor} rounded-lg shadow-lg mb-6 md:mb-0`}>
        <UserProfile selectedUserId={userId} />
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
        >
          Upload Vehicle
        </button>
      </div>

      {/* Modal for UploadVehicle */}
      {showModal && (
  <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-75 flex items-center justify-center">
    <div className="relative bg-white rounded-lg w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto"> 
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={() => setShowModal(false)}
      >
        &times; {/* Close Button */}
      </button>
      <UploadVehicle userId={userId} />
    </div>
  </div>
)}


      {/* Right Section: Showcase Features */}
      <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {websiteFeatures.map((feature, index) => (
          <section
            key={index}
            className={`p-6 ${secondaryColor} rounded-lg shadow-lg flex flex-col items-start justify-between h-64`}
          >
            <div className="flex items-center mb-4">
              <span className="text-8xl mr-4">{feature.icon}</span> {/* Increased emoji size */}
              <div>
                <h3 className="text-xl font-bold">{feature.name}</h3>
                <p className="text-sm">{feature.description}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(feature.link)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-auto"
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
