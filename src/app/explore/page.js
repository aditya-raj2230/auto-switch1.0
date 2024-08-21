'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const Page = () => {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupClick = (groupId) => {
    router.push(`/group/${groupId}`);
  };

  return (
    <div className='mt-20 max-w-3xl mx-auto p-4'>
      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search groups...'
          value={searchTerm}
          onChange={handleSearch}
          className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200'
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredGroups.map(group => (
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
    </div>
  );
};

export default Page;
