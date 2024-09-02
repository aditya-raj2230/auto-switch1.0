'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const GroupList = () => {
  const router = useRouter();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const db = getFirestore();
      try {
        const groupsCollection = collection(db, 'groups');
        const groupSnapshot = await getDocs(groupsCollection);
        const groupList = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(groupList);
      } catch (error) {
        console.error("Error fetching groups: ", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    router.push(`/group/${groupId}`);
  };

  const handleExploreMoreClick = () => {
    router.push('/explore');
  };

  return (
    <div className='mt-20 max-w-3xl mx-auto p-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {groups.map(group => (
          <div
            key={group.id}
            className='bg-white shadow-md rounded-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200'
            onClick={() => handleGroupClick(group.id)}
          >
            <img
              src={group.imageUrl}
              alt={group.name}
              className='w-full h-40 object-cover'
            />
            <div className='p-4'>
              <h2 className='text-xl font-bold mb-2'>{group.name}</h2>
              <p className='text-gray-600'>{group.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-8 text-center'>
        <button
          onClick={handleExploreMoreClick}
          className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200'
        >
          Explore More
        </button>
      </div>
    </div>
  );
};

export default GroupList;