'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function VerifyEmail() {
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = window.localStorage.getItem('emailForSignIn');
    const password = window.localStorage.getItem('passwordForSignIn');
    const firstName = window.localStorage.getItem('firstName');
    const lastName = window.localStorage.getItem('lastName');

    if (!email || !password || !firstName || !lastName) {
      setError("Required information missing. Please try signing up again.");
      return;
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(async () => {
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('passwordForSignIn');
          window.localStorage.removeItem('firstName');
          window.localStorage.removeItem('lastName');

          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
              displayName: `${firstName} ${lastName}`,
            });

            await setDoc(doc(db, "users", user.uid), {
              firstName,
              lastName,
              email,
            });

            router.push('/welcome');
          } catch (error) {
            console.error("Error creating user:", error);
            setError("User creation failed. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          setError("Error during email verification. Please try again.");
        });
    }
  }, [router]);

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <p>Verifying your email...</p>
    </div>
  );
}
