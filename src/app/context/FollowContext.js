'use client'
import React, { createContext, useContext, useState } from 'react';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [followingList, setFollowingList] = useState([]);
  const [follwersList,setFollowerList]=useState([])

  return (
    <FollowContext.Provider value={{ followingList, setFollowingList ,follwersList,setFollowerList}}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);
