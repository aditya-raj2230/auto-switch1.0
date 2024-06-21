// Import the custom colors
'use client'
import React from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import PublicPosts from "./PublicPosts";
import { useAuth } from "../app/context/AuthContext";

const Feed = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <div>
      <UserProfile selectedUserId={userId} />
      <button
        className="ml-4 bg-cream-500 text-white px-4 py-2 rounded"
        onClick={() => router.push("/addFriends")}
      >
        Add Friends
      </button>
      {userId && (
        <button
          onClick={() => router.push("/createPost")}
          className="ml-4 bg-tea_green-500 text-white px-4 py-2 rounded"
        >
          Create Post
        </button>
      )}
      {userId && (
        <button
          onClick={() => router.push("/chat")}
          className="ml-4 bg-carrot_orange-500 text-white px-4 py-2 rounded"
        >
          Messages
        </button>
      )}
      <PublicPosts />
    </div>
  );
};

export default Feed;
