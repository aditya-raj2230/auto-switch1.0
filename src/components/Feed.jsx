"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/app/firebase/config";
import { FollowProvider, useFollow } from "@/app/context/FollowContext"; // Import the FollowContext

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // Updated state to hold the selected user
  const { followingList, setFollowingList } = useFollow(); // Use FollowContext
  const [showModal, setShowModal] = useState(false);

  const [isGray, setIsGray] = useState(false);
  const router = useRouter();

  const handleFollow = async (targetUserId) => {
    const isFollowing = followingList.includes(targetUserId);
    const userDocRef = doc(db, "users", userId);
    const targetUserDocRef = doc(db, "users", targetUserId);

    try {
      await updateDoc(userDocRef, {
        following: isFollowing
          ? arrayRemove(targetUserId)
          : arrayUnion(targetUserId),
        followingCount: increment(isFollowing ? -1 : 1),
      });

      await updateDoc(targetUserDocRef, {
        followers: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
        followerCount: increment(isFollowing ? -1 : 1),
      });

      // Update local state
      setFollowingList((prevList) =>
        isFollowing
          ? prevList.filter((id) => id !== targetUserId)
          : [...prevList, targetUserId]
      );
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setSelectedUserId(user.uid); // Set the selected user to the logged-in user
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
            const userData = userSnapshot.data();
            setUserData(userData);
            setProfileImageUrl(userData.profileImageUrl);
            setBannerImageUrl(userData.bannerImageUrl);
            setFollowingList(userData.following || []);
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
    handlePersonal(); // Fetch and set the logged-in user's data
  }, [userId]);

  useEffect(() => {
    fetchUsers();
  }, [userId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("firstName"), limit(10));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      // Filter out the logged-in user from the list
      const filteredUsers = userList.filter((user) => user.id !== userId);
      setUsers(filteredUsers);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const fetchMoreUsers = async () => {
    if (!lastVisible) return;
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("firstName"),
        startAfter(lastVisible),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      // Filter out the logged-in user from the list
      const filteredUsers = userList.filter((user) => user.id !== userId);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  const handleProfileClick = async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserData(userData);
        setProfileImageUrl(userData.profileImageUrl);
        setBannerImageUrl(userData.bannerImageUrl);
        setSelectedUserId(userId); // Set the selected user to the clicked user
        console.log("Successful fetch");

        // Scroll to the top of the page
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEdit = () => {
    router.push("/edit");
  };

  const handlePersonal = async () => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserData(userData);
        setProfileImageUrl(userData.profileImageUrl);
        setBannerImageUrl(userData.bannerImageUrl);
        setSelectedUserId(userId); // Set the selected user to the clicked user
        console.log("Successful fetch");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleCopy = () => {
    const urlInput = document.getElementById("urlInput");
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    alert("URL copied to clipboard");
    setShowModal(false);
    setIsGray(true);
    setTimeout(() => {
      setIsGray(false);
    }, 5000);
  };

  return (
    <div>
      <div className="flex justify-end mt-0 mr-8">
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-5 rounded hover:bg-blue-700"
          onClick={handlePersonal} // Set selected user to logged-in user
        >
          My Profile
        </button>

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-30">
            <div className="bg-white p-6 rounded shadow-md">
              <p className="mb-4">Share this URL with friends:</p>
              <input
                type="text"
                id="urlInput"
                value="localhost:3000"
                readOnly
                className="border p-2 mb-4 w-full"
              />
              <button
                className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {userData && (
        <div
          className="max-w-5xl mx-auto my-10 p-0 pb-10 pt-0  bg-white rounded-lg shadow-md relative "
          style={{ width: "auto" }}
        >
          {/* Render selected user profile */}
          <div>
            <div className="text-center">
              {bannerImageUrl ? (
                <img
                  src={bannerImageUrl}
                  alt="Banner"
                  className="w-full h-72 m-0 mb-44  "
                />
              ) : (
                <div className="w-full h-72 bg-gray-200 m-0 mb-10 "></div>
              )}

              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-72 h-72 rounded-full border-4 border-white shadow-lg inline-block mb-4 absolute top-40 right-2/3  "
                />
              ) : (
                <div className="w-72 h-72 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-3xl border-4 border-white shadow-lg mb-4">
                  <span>+</span>
                </div>
              )}

              <h1 className="text-3xl font-bold text-gray-900">
                {userData.firstName.toUpperCase()}{" "}
                {userData.lastName.toUpperCase()}
              </h1>
              <p className="text-lg text-gray-600">{userData.bio}</p>

              <div className="flex justify-center space-x-8 my-6">
                <div>
                  <p className="text-gray-900 font-bold text-xl">
                    {userData.followerCount}
                  </p>
                  <p className="text-gray-600 text-sm">Followers</p>
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-xl">
                    {userData.followingCount}
                  </p>
                  <p className="text-gray-600 text-sm">Following</p>
                </div>
              </div>

              <div className="m-2">
                <strong>Joined:</strong>{" "}
                {new Date(
                  userData.createdAt.seconds * 1000
                ).toLocaleDateString()}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <div>
             
              </div>
              {userId !== selectedUserId && (
                <div className="flex items-center flex-col">
                
                <button
                  className={`bg-blue-500 text-white px-6 m-2 py-2 rounded hover:bg-blue-700 ${
                    followingList.includes(selectedUserId)
                      ? "bg-gray-600 hover:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => handleFollow(selectedUserId)}
                >
                  {followingList.includes(selectedUserId)
                    ? "Unfollow"
                    : "Follow"}
                </button>
                <p className="m-2">
                {
                    userData.carSwappingInterest?"Interested in Swapping":"not interested in Swapping"
                  }
                  </p>
                </div>
              )}

              {userId === selectedUserId && (
                <button
                  className="bg-blue-500 text-white px-6 py-2 m-5 rounded hover:bg-blue-700"
                  onClick={handleEdit}
                >
                  Finish Profile
                </button>
              )}
              
            </div>
            <div className="m-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Car Collection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {userData.carCollection &&
                  userData.carCollection.map((car, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-4 rounded-lg shadow-md"
                    >
                      <img
                        src={car.imageUrl}
                        alt={car.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {car.name}
                      </h3>
                      <p className="text-gray-700">{car.description}</p>
                    </div>
                  ))}
              </div>
            </div>
            <div className="m-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifications & Projects
              </h2>
              <ul className="list-disc pl-5 mt-4 text-gray-700">
                {userData.modifications
                  ? userData.modifications.map((modification, index) => (
                      <li key={index}>{modification}</li>
                    ))
                  : ""}
              </ul>
            </div>
            <div className="m-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Favorite Cars
              </h2>
              <ul className="list-disc pl-5 mt-4 text-gray-700">
                {userData.favoriteCars
                  ? userData.favoriteCars.map((car, index) => (
                      <li key={index}>{car}</li>
                    ))
                  : ""}
              </ul>
            </div>
            <div className="m-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Driving Experiences
              </h2>
              <ul className="list-disc pl-5 mt-4 text-gray-700">
                {userData.drivingExperiences
                  ? userData.drivingExperiences.map((experience, index) => (
                      <li key={index}>{experience}</li>
                    ))
                  : ""}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md relative">
        <h1 className="text-2xl font-bold mb-6">Add Friends</h1>
        <button
          className={`px-4 py-2 rounded absolute right-8 top-6 ${
            isGray ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
          } text-white`}
          onClick={() => setShowModal(true)}
        >
          Invite Friend
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users
            .filter((user) => user.id !== userId) // Filter out the logged-in user
            .map((user) => (
              <div
                key={user.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
                onClick={() => handleProfileClick(user.id)}
              >
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4"
                />
                <div>
                  <p className="text-lg font-semibold text-center">
                    {user.firstName} {user.lastName}
                  </p>
                  <button
                    className={`bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 ${
                      followingList.includes(user.id)
                        ? "bg-gray-600 hover:bg-gray-700"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user.id);
                    }}
                  >
                    {followingList.includes(user.id) ? "Unfollow" : "Follow"}
                  </button>
                </div>
              </div>
            ))}
        </div>
        {lastVisible && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={fetchMoreUsers}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FeedWithProvider = () => (
  <FollowProvider>
    <Feed />
  </FollowProvider>
);

export default FeedWithProvider;
