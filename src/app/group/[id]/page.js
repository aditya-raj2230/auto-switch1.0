'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useParams } from "next/navigation";

const GroupDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      const db = getFirestore();
      const groupDoc = doc(db, "groups", id);
      const groupSnapshot = await getDoc(groupDoc);

      if (groupSnapshot.exists()) {
        setGroup(groupSnapshot.data());
      } else {
        console.error("Group not found");
        router.push("/404");
      }

      setLoading(false);
    };

    fetchGroup();
  }, [id, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 p-8 bg-white rounded-md shadow-md">
      <img
        src={group.imageUrl}
        alt={group.name}
        className="w-full h-64 object-cover rounded-md"
      />
      <h1 className="text-3xl font-bold mt-4">{group.name}</h1>
      <p className="text-gray-700 mt-2">{group.description}</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Members:</h2>
        <ul className="mt-2">
          {/* {group.admins.map((admin, index) => (
            <li key={index} className="text-gray-600">{admin}</li>
          ))} */}
        </ul>
      </div>
    </div>
  );
};

export default GroupDetail;
