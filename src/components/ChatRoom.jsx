import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";
import Message from "./Message";

const ChatRoom = ({ chatRoomId, selectedUser, onSendMessage, loggedInUser }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatRoomId) {
      const q = query(
        collection(db, `chatRooms/${chatRoomId}/messages`),
        orderBy("timestamp")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() });
        });
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [chatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    const message = {
      text: newMessage,
      senderId: userId,
      timestamp: Timestamp.now(),
      seen: false,
    };

    await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), message);

    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)] border-2 rounded-lg border-green-300">
      <div className="p-4 border-b border-gray-300 flex items-center bg-white sticky top-0 z-10">
        <img
          src={selectedUser?.profileImageUrl}
          alt={selectedUser?.firstName}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{selectedUser?.firstName} {selectedUser?.lastName}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} isOwnMessage={msg.senderId === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white flex items-center border-t border-gray-300">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-400 rounded focus:outline-none focus:border-green-300"
        />
        <button type="submit" className="ml-4 px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition-colors duration-200">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
