import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config"; // Ensure the path is correct
import { onAuthStateChanged } from "firebase/auth";

export default function Feed() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the user ID from the authenticated user
      } else {
        // If not authenticated, redirect to login page or show an appropriate message
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, []);

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
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {" "}
              {userData.firstName}
            </h1>
            <p className="text-sm text-gray-600">{userData.lastName}</p>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="flex space-x-4">
          <div>
            <p className="text-gray-900 font-bold">150</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div>
            <p className="text-gray-900 font-bold">100</p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
          <div className="mb-2">
            <strong>Joined:</strong>{" "}
            {userData.createdAt.toDate().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
