import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Changed to next/router
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Feed = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
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
            console.log("Fetched user data:", userData); // Debug log
            setUserData(userData);
            setProfileImageUrl(userData.profileImageUrl); // Fetching the saved image URL
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



  const handleEdit = () => {
    router.push(`/edit`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md" style={{ width: '80%' }}>
      <div className="flex justify-between items-center mb-8 relative">
        <div className="flex items-center relative">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="w-96 h-96 rounded-full mr-6"/>
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
  );
};

export default Feed;
