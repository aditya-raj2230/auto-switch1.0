// pages/signup.js
"use client"
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation"
import { auth } from "@/app/firebase/config";  // Adjust the import path according to your project structure
import SignupForm from "@/components/SignupForm";
import Image from "next/image";

export default function SignupPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to the homepage or another page
        router.push("/");
      } else {
        // User is not signed in
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container bg-white shadow-md rounded-lg p-6">
        <Image
          src="/image.png"
          alt="logo"
          width={200}
          height={100}
          className="ml-24 mb-8 p-0"
        />
        <SignupForm />
      </div>
    </div>
  );
}
