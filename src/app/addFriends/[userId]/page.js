'use client';
import React from "react";
import { useRouter } from "next/navigation";

import UserPosts from "@/components/UserPosts";
import Reviews from "@/components/Reviews";
import AuthGuard2 from "@/components/LoggedOutAuthGaurad";
import SelectedUserProfile from "@/components/SelectedUserProfile";

const Page = ({ params }) => {
  const { userId } = params;

  return (
    <AuthGuard2>
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto my-10 p-4 bg-white rounded-lg shadow-lg">
        <div className="w-full md:w-1/3 p-4 border-r border-gray-200">
          <SelectedUserProfile selectedUserId={userId} />
        </div>
        <div className="w-full md:w-2/3 p-4">
          <Reviews userId={userId} />
          <UserPosts userId={userId} />
        </div>
      </div>
    </AuthGuard2>
  );
};

export default Page;
