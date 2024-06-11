import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config'; // Ensure the path is correct
import { onAuthStateChanged } from 'firebase/auth';

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
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = doc(db, 'users', userId);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
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
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow-md rounded p-4">
        <div className="mb-2">
          <strong>First Name:</strong> {userData.firstName}
        </div>
        <div className="mb-2">
          <strong>Last Name:</strong> {userData.lastName}
        </div>
        <div className="mb-2">
          <strong>Email:</strong> {userData.email}
        </div>
        <div className="mb-2">
          <strong>Joined:</strong> {userData.createdAt.toDate().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
