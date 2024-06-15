// FollowContext.js
'use client'
import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "./AuthContext"; // Import AuthContext

const FollowContext = createContext();

export const useFollow = () => useContext(FollowContext);

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    const fetchFollowingList = async () => {
      if (user?.uid) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setFollowingList(data.following || []);
          }
        } catch (error) {
          console.error("Error fetching following list:", error);
        }
      }
    };

    fetchFollowingList();
  }, [user]);

  return (
    <FollowContext.Provider value={{ followingList, setFollowingList }}>
      {children}
    </FollowContext.Provider>
  );
};
