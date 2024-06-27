"use client";
import React, { useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import PublicPosts from "./PublicPosts";
import CreatePostForm from "./CreatePost";
import SideProfile from "./SideProfile";
import UserList2 from "./RightFeed";
import RightFeed from "./RightFeed";

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
      {/* Left SideProfile */}
      <div className="col-span-1 md:col-span-4 md:ml-4 md:mt-4 md:block hidden">
        <SideProfile />
      </div>

      {/* Main Content */}
      <div className="col-span-1 md:col-span-4 flex flex-col items-center">
        {user && (
          <div className="w-full max-w-3xl mb-4">
            <CreatePostForm
              isExpanded={isExpanded}
              onClose={handleCollapse}
              onExpand={handleExpand}
            />
          </div>
        )}
        <div className="w-full max-w-3xl">
          <PublicPosts />
        </div>
      </div>

      {/* Right SideProfile */}
      <div className="col-span-1 md:col-span-4 md:mr-4 md:mt-4 md:block hidden">
        <RightFeed/>
      </div>
    </div>
  );
};

export default Feed;
