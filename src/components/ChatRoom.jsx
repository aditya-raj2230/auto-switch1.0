import React, { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";

const ChatRoom = ({ chatRoomId, selectedUser, onSendMessage }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), {
      senderId: userId,
      text: newMessage,
      timestamp: serverTimestamp()
    });

    await onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white p-4 border-b border-gray-300 flex items-center">
        <img src={selectedUser?.profileImageUrl || ''} alt={selectedUser?.firstName || 'Unknown'} className="w-10 h-10 rounded-full mr-4" />
        <h1 className="text-2xl font-bold">{selectedUser?.firstName || 'Unknown'} {selectedUser?.lastName || 'User'}</h1>
      </div>
      <div className="flex-grow overflow-y-auto bg-gray-100">
        <div className="p-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg ${message.senderId === userId ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-700 self-start'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white p-4 border-t border-gray-300 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r-lg ml-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
