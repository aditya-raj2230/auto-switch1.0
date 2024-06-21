"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { sendSignInLinkToEmail } from "firebase/auth";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const actionCodeSettings = {
    url: 'http://localhost:3000/verify-email?email=' + email,
    handleCodeInApp: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("Sending email verification link...");
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('passwordForSignIn', password);
      window.localStorage.setItem('firstName', firstName);
      window.localStorage.setItem('lastName', lastName);

      console.log("Verification email sent.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      // Redirect to the email verification notice page
      router.push('/check-email');
    } catch (error) {
      console.error("Error during signup:", error);
      handleFirebaseError(error);
    }
  };

  const handleFirebaseError = (error) => {
    if (error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already in use. Please use a different email.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid. Please enter a valid email.");
          break;
        default:
          setError("An error occurred during signup. Please try again.");
      }
    } else {
      setError("An error occurred during signup. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
        <input type="text" id="firstName" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input type="text" id="lastName" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        Sign Up
      </button>
    </form>
  );
}
