'use client';
import React from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import { useAuth } from "../context/AuthContext";
import MyPosts from "@/components/MyPosts";

const Page = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <div>
      <UserProfile selectedUserId={userId} />
      <div className="w-full flex justify-center">
        <MyPosts />
      </div>
      </div>
  );
};

export default Page;
