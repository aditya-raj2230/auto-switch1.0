'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db ,auth} from "@/app/firebase/config";

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // Updated state to hold the selected user

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setSelectedUserId(user.uid); // Set the default selected user to the logged-in user
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const filteredUsers = userList.filter(user => user.id !== userId);
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
      const filteredUsers = userList.filter(user => user.id !== userId);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  const handleProfileClick = async (userId) => {
    setSelectedUserId(userId);
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserData(userData);
        setProfileImageUrl(userData.profileImageUrl);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/edit`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md" style={{ width: "80%" }}>
        {userData && selectedUserId === userId && ( // Only render if the selected user is the logged-in user
          <div>
            <div className="flex justify-between items-center mb-8 relative">
              <div className="flex items-center relative">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-96 h-96 rounded-full mr-6" />
                ) : (
                  <div className="w-96 h-96 rounded-full bg-gray-300 mr-6 flex items-center justify-center text-gray-500 text-xl">
                    <span>+</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.firstName}</h1>
              <p className="text-lg text-gray-600">{userData.lastName}</p>
            </div>
            <p className="text-gray-700 mb-6">{userData.bio}</p>
            <div className="flex space-x-8 relative">
              <div>
                <p className="text-gray-900 font-bold text-xl">{userData.followers}</p>
                <p className="text-gray-600 text-sm">Followers</p>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl">{userData.following}</p>
                <p className="text-gray-600 text-sm">Following</p>
              </div>
              <div className="mb-2">
                <strong>Joined:</strong> {new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}
              </div>
              <button className="bg-blue-500 text-white px-6 py-2 absolute right-0 bottom-10 rounded hover:bg-blue-700" onClick={handleEdit}>
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">User Profiles</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer" onClick={() => handleProfileClick(user.id)}>
              <img src={user.profileImageUrl || "/path/to/default/image.png"} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
              <div>
                <p className="text-lg font-semibold text-center">{user.firstName} {user.lastName}</p>
              </div>
            </div>
          ))}
        </div>
        {lastVisible && (
          <div className="mt-6 flex justify-center">
            <button onClick={fetchMoreUsers} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
