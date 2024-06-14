'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const FollowContext = createContext();

export const useFollow = () => useContext(FollowContext);

export const FollowProvider = ({ children }) => {
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setFollowingList(userSnapshot.data().following || []);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FollowContext.Provider value={{ followingList, setFollowingList }}>
      {children}
    </FollowContext.Provider>
  );
};
