import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/app/firebase/config"; // Adjust the import based on your project structure
import { useFollow } from "../app/context/FollowContext"; // Import the FollowContext
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import VehicleList from "./VehicleList";
import Link from "next/link";

const UserProfile = ({ selectedUserId }) => {
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { followingList, setFollowingList } = useFollow(); // Use FollowContext
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const userToFetchId = selectedUserId || auth.currentUser?.uid;

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
          setVehicles(userData.vehicles || []);
          setProfileImageUrl(userData.profileImageUrl);
          setBannerImageUrl(userData.bannerImageUrl);
          setFollowingList(userData.following || []);
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
  }, [selectedUserId]);

  const handleEdit = () => {
    router.push("/edit");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User data not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-0 pb-10 pt-0 bg-white rounded-lg shadow-lg relative">
      <div className="text-center">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Banner"
            className="w-full h-72 object-cover mb-6 sm:mb-10"
          />
        ) : (
          <div className="w-full h-72 bg-gray-200 mb-6 sm:mb-10"></div>
        )}

        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-56 h-56 sm:w-72 sm:h-72 lg:absolute lg:ml-32 lg:mr-32 rounded-lg border-8 md:rounded-full border-white shadow-lg inline-block mb-4 absolute top-28 sm:top-40 right-1/2 sm:right-2/3 transform translate-x-1/2"
          />
        ) : (
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-lg lg:absolute lg:ml-32 lg:mr-32 bg-gray-300 flex items-center justify-center text-gray-500 text-3xl md:rounded-full border-8 border-white shadow-lg mb-4 absolute top-28 sm:top-40 right-1/2 sm:right-2/3 transform translate-x-1/2">
            <span>+</span>
          </div>
        )}

        <h1 className="text-3xl font-bold mt-20 md:m-2 text-gray-900">
          {userData.firstName?.toUpperCase()} {userData.lastName?.toUpperCase()}
        </h1>
        <p className="text-lg text-gray-600">{userData.bio}</p>

        <div className="flex justify-center space-x-8 my-6">
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followerCount}</p>
            <Link href="/profile/followers" className="text-gray-600 text-xl">Followers</Link>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followingCount}</p>
            <Link href="/profile/following" className="text-gray-600 text-xl">Following</Link>
          </div>
        </div>

        <div className="m-2">
          <strong>Joined:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {auth.currentUser?.uid === selectedUserId && (
          <button
            className="bg-indigo-600 text-white px-6 py-2 m-2 rounded-lg hover:bg-indigo-800"
            onClick={handleEdit}
          >
            Finish Profile
          </button>
        )}
      </div>

      <div className="container flex flex-col items-center mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">User Vehicles</h1>
        <VehicleList userId={selectedUserId || auth.currentUser?.uid} />
      </div>
    </div>
  );
};

export default UserProfile;
