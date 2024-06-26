'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, reload } from "firebase/auth";

export default function CheckEmail() {
  const [user, setUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("Checking...");
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await reload(user);  // Reload the user to get the latest data from Firebase
        if (user.emailVerified) {
          setVerificationStatus("Verified");
          router.push('/');
        }
      }
    }, 10000);  // Check every 10 seconds

    return () => clearInterval(interval);  // Clean up the interval on component unmount
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Check Your Email</h1>
        <p className="text-center text-gray-700 mb-6">
          We have sent a verification link to your email. Please verify your email to continue.
        </p>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Status:</p>
          <div className="flex items-center justify-center">
            <span className="text-lg font-bold text-green-500">{verificationStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
