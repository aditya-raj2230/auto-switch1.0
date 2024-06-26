"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";
import PublicPosts from "./PublicPosts";
import { useAuth } from "../app/context/AuthContext";
import CreatePostForm from "./CreatePost";

const Feed = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {user && (
        <div onClick={handleExpand} className="">
          <CreatePostForm isExpanded={isExpanded} onClose={handleCollapse} />
        </div>
      )}

      <PublicPosts />
    </div>
  );
};

export default Feed;
