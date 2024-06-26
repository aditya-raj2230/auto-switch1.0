// components/AuthGuard.js
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthGuard = ({ children }) => {
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to another page (e.g., dashboard)
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return <>{children}</>;
};

export default AuthGuard;
