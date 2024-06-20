'use client'
import React, { useState } from "react";
import ChatList from "../../components/ChatList";
import ChatRoom from '../../components/ChatRoom';

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="flex max-w-7xl mx-auto my-10 p-4 bg-white rounded-lg shadow-lg">
      <ChatList />
      
    </div>
  );
};

export default ChatPage;
