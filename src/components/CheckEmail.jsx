'use client';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";

export default function CheckEmail() {
  const [user, setUser] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("Checking...");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
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

  const handleResendVerification = async () => {
    if (user) {
      setIsResending(true);
      try {
        await sendEmailVerification(user);
        setMessage("Verification email resent. Please check your email.");
      } catch (error) {
        setMessage("Failed to resend verification email. Please try again later.");
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Check Your Email</h1>
        <p className="text-center text-gray-700 mb-6">
          We have sent a verification link to your email. Please verify your email to continue.
        </p>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Status:</p>
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg font-bold text-green-500">{verificationStatus}</span>
          </div>
          {message && <p className="text-center text-blue-500 mb-4">{message}</p>}
          <button
            onClick={handleResendVerification}
            className="py-2 px-4 bg-gray-900 text-white rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isResending}
          >
            {isResending ? "Resending..." : "Resend Verification Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
