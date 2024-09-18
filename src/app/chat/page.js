'use client'
import React, { useState } from "react";
import ChatList from "../../components/ChatList";
import ChatRoom from '../../components/ChatRoom';
import AuthGuard2 from "@/components/LoggedOutAuthGaurad";

const ChatPage = () => {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <AuthGuard2>
      <div className="flex w-full h-[90vh] mt-4 bg-white rounded-lg shadow-lg">
        <ChatList
          setSelectedChatRoomId={setSelectedChatRoomId}
          setSelectedUser={setSelectedUser}
          setLoggedInUser={setLoggedInUser}
        />
        {selectedChatRoomId && (
          <ChatRoom
            chatRoomId={selectedChatRoomId}
            selectedUser={selectedUser}
            loggedInUser={loggedInUser}
            onSendMessage={() => {}}
          />
        )}
      </div>
    </AuthGuard2>
  );
};

export default ChatPage;
