"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config"; // Ensure this is correctly imported

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("Signing up user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        profileImageUrl: null,
        bannerImageUrl: null,
        bio: "",
        vehicles: [],
        followerCount: 0,
        followingCount: 0,
        following: []
      });

      await sendEmailVerification(user);
      console.log("Verification email sent.");
      setMessage("Verification email sent. Please check your email to verify your account.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      // Redirect to the check-email page
      router.push('/check-email');
    } catch (error) {
      console.error("Error during signup:", error);
      handleFirebaseError(error);
    }
  };

  const handleFirebaseError = (error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Firebase error:", errorCode, errorMessage);

    switch (errorCode) {
      case "auth/email-already-in-use":
        setError("This email is already in use. Please use a different email.");
        break;
      case "auth/invalid-email":
        setError("The email address is not valid. Please enter a valid email.");
        break;
      case "auth/weak-password":
        setError("The password is too weak. Please enter a stronger password.");
        break;
      default:
        setError(`An error occurred: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          id="firstName"
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          id="lastName"
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Sign Up
      </button>
    </form>
  );
}
