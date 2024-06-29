'use client';
import React from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import { useAuth } from "../context/AuthContext";
import MyPosts from "@/components/MyPosts";
import Reviews from "@/components/Reviews";

const Page = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 p-4">
        <UserProfile selectedUserId={userId} />
      </div>
      <div className="w-full md:w-2/3 p-4">
        <Reviews userId={userId} />
        <MyPosts />
      </div>
    </div>
  );
};

export default Page;
