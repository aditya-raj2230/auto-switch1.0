'use client';
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from "@/app/firebase/config";
import Feed from "@/components/Feed";
import Hero from "@/components/Hero";
import Navbar2 from "@/components/Navbar2";
import Link from "next/link";
import Image from "next/image";


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
   
      
      
      <main className="flex flex-col min-h-screen mb-20 ">
        {user && user.emailVerified ? <Feed /> : <Hero />}
      </main>
     
   
  );
}
