"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { useRouter } from "next/navigation";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router= useRouter()

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Signed in with Google:", user);
      router.push('/feed')
    } catch (error) {
      console.error("Error signing in with Google:", error);
      
    }
  };

  const [loginUserWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
  


    try {
      const userCredential = await loginUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      router.push('/feed')
      setEmail('');
      setPassword('');
      
    } catch (error) {
      console.error(error);
    
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-gray-900 text-white rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Login</button>
      <button type="button" onClick={signInWithGoogle} className="w-full py-2 px-4 bg-gray-200 text-gray-900 rounded-md shadow-sm border-gray-900 border-2 hover:bg-white focus:outline-none">Google</button>
    </form>
  );
}
