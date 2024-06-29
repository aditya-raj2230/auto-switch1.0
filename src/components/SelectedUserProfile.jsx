import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "@/app/firebase/config"; // Adjust the import based on your project structure
import { useFollow } from "../app/context/FollowContext"; // Import the FollowContext
import { useAuth } from "../app/context/AuthContext"; // Import the AuthContext
import VehicleList from "./VehicleList";
import Link from "next/link";

const SelectedUserProfile = ({ selectedUserId }) => {
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { followingList, setFollowingList } = useFollow(); // Use FollowContext
  const { user } = useAuth();
  const router = useRouter();
  const loggedInUserId = user?.uid;

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

  const handleFollow = async () => {
    if (!loggedInUserId || !selectedUserId) return;

    try {
      // Update the following list of the logged-in user
      const loggedInUserDoc = doc(db, "users", loggedInUserId);
      await updateDoc(loggedInUserDoc, {
        following: arrayUnion(selectedUserId)
      });

      // Update the follower count of the selected user
      const selectedUserDoc = doc(db, "users", selectedUserId);
      await updateDoc(selectedUserDoc, {
        followerCount: (userData.followerCount || 0) + 1
      });

      setFollowingList((prevList) => [...prevList, selectedUserId]);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!loggedInUserId || !selectedUserId) return;

    try {
      // Update the following list of the logged-in user
      const loggedInUserDoc = doc(db, "users", loggedInUserId);
      await updateDoc(loggedInUserDoc, {
        following: arrayRemove(selectedUserId)
      });

      // Update the follower count of the selected user
      const selectedUserDoc = doc(db, "users", selectedUserId);
      await updateDoc(selectedUserDoc, {
        followerCount: (userData.followerCount || 0) - 1
      });

      setFollowingList((prevList) => prevList.filter((id) => id !== selectedUserId));
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>User data not found.</div>;
  }

  const isFollowing = followingList.includes(selectedUserId);

  return (
    <div className="w-full max-w-md mx-auto my-10 p-4 bg-white rounded-lg shadow-lg relative">
      <div className="text-center">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Banner"
            className="w-full h-40 object-cover mb-4"
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 mb-4"></div>
        )}

        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-3xl border-4 border-white shadow-lg mx-auto mb-4">
            <span>+</span>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900">
          {userData.firstName?.toUpperCase()} {userData.lastName?.toUpperCase()}
        </h1>
        <p className="text-lg text-gray-600">{userData.bio}</p>

        <div className="flex justify-center space-x-4 my-4">
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followerCount}</p>
            <Link href="/profile/followers" className="text-gray-600 text-xl">Followers</Link>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-xl">{userData.followingCount}</p>
            <Link href="/profile/following" className="text-gray-600 text-xl">Following</Link>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <strong>Joined:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        {auth.currentUser?.uid === selectedUserId && (
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800"
            onClick={handleEdit}
          >
            Finish Profile
          </button>
        )}
        {auth.currentUser?.uid !== selectedUserId && (
          <button
            className={`ml-4 px-4 py-2 rounded-lg ${isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">User Vehicles</h1>
        <VehicleList userId={selectedUserId || auth.currentUser?.uid} />
      </div>
    </div>
  );
};

export default SelectedUserProfile;
