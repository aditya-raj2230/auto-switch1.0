import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/app/firebase/config";
import { useFollow } from "../app/context/FollowContext";
import { useAuth } from "../app/context/AuthContext";
import VehicleList from "./VehicleList";
import Link from "next/link";

const UserProfile = ({ selectedUserId }) => {
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setFollowingList } = useFollow();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const userToFetchId = selectedUserId || auth.currentUser?.uid;

      if (!userToFetchId) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = doc(db, "users", userToFetchId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);
          setVehicles(userData.vehicles || []);
          setProfileImageUrl(userData.profileImageUrl);
          setBannerImageUrl(userData.bannerImageUrl);
          setFollowingList(userData.following || []);
        } else {
          setUserData(null);
        }
      } catch (error) {
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
    <div className="w-full max-w-md mx-auto my-6 p-6 bg-gray-50 rounded-lg shadow-lg relative">
      <div className="text-center mb-4">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Banner"
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-t-lg"></div>
        )}

        <div className="relative -mt-12">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-3xl border-4 border-white shadow-lg mx-auto">
              <span>+</span>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">{userData.firstName} {userData.lastName}</h1>
      <p className="text-md text-gray-600 mb-4">{userData.bio}</p>

      <div className="flex justify-around my-4 text-center">
        <div>
          <p className="text-gray-800 font-bold">{userData.followerCount}</p>
          <Link href="/profile/followers" className="text-gray-600">Followers</Link>
        </div>
        <div>
          <p className="text-gray-800 font-bold">{userData.followingCount}</p>
          <Link href="/profile/following" className="text-gray-600">Following</Link>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        <strong>Joined:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}
      </div>

      <div className="text-center mb-4">
        {auth.currentUser?.uid === selectedUserId && (
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            onClick={handleEdit}
          >
            Finish Profile
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2 text-gray-800">User Vehicles</h2>
        <VehicleList userId={selectedUserId || auth.currentUser?.uid} />
      </div>
    </div>
  );
};

export default UserProfile;
