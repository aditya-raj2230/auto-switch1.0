'use client';
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/app/firebase/config";
import Feed from "@/components/Feed";
import Hero from "@/components/Hero";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && !currentUser.emailVerified) {
        router.push('/check-email');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user && user.emailVerified ? <Feed /> : <Hero />}
    </div>
  );
}
