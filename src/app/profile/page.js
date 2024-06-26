'use client'
import React from "react";
import { useRouter } from "next/navigation";
import UserProfile from "@/components/Profile";

import { useAuth } from "../context/AuthContext";

const page = () => {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.uid;
  return (
    <div>
      <UserProfile selectedUserId={userId} />
    </div>
  )
}

export default page
