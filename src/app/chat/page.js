'use client'
import React, { useState } from "react";
import ChatList from "../../components/ChatList";
import ChatRoom from '../../components/ChatRoom';
import AuthGuard from "@/components/AuthGaurd";
import AuthGuard2 from "@/components/LoggedOutAuthGaurad";

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <AuthGuard2>
    <div className="flex w-full min-h-screen mb-20 mx-auto my-10 p-4 bg-white rounded-lg shadow-lg">
      <ChatList />
      
    </div>
    </AuthGuard2>
  );
};

export default ChatPage;
