'use client'
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import Feed from "@/components/Feed";
import Hero from "@/components/Hero";
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    
    <div>
      {user ? <Feed /> : <Hero />}
    </div>
  );
}
