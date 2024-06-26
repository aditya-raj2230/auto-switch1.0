"use client";
import React, { useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import PublicPosts from "./PublicPosts";
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
    <div className="relative flex flex-col">
      {user && (
        <div>
          <CreatePostForm
            isExpanded={isExpanded}
            onClose={handleCollapse}
            onExpand={handleExpand}
          />
        </div>
      )}
      <PublicPosts />
    </div>
  );
};

export default Feed;
