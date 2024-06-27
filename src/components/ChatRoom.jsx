import React, { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";

const ChatRoom = ({ chatRoomId, selectedUser, onSendMessage, loggedInUser }) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);

      // Mark messages as seen if they are not sent by the current user
      const unseenMessages = newMessages.filter(msg => msg.senderId !== userId && !msg.seen);
      unseenMessages.forEach(async (msg) => {
        await updateDoc(doc(db, `chatRooms/${chatRoomId}/messages/${msg.id}`), {
          seen: true
        });
      });
    });

    return () => unsubscribe();
  }, [chatRoomId, userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, `chatRooms/${chatRoomId}/messages`), {
      senderId: userId,
      text: newMessage,
      timestamp: serverTimestamp(),
      seen: false // Mark as unseen by default
    });

    setNewMessage('');
    await onSendMessage(newMessage);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-white p-4 border-b border-gray-300 flex items-center">
        <img src={selectedUser?.profileImageUrl || ''} alt={selectedUser?.firstName || 'Unknown'} className="w-10 h-10 rounded-full mr-4" />
        <h1 className="text-2xl font-bold">{selectedUser?.firstName || 'Unknown'} {selectedUser?.lastName || 'User'}</h1>
      </div>
      <div className="flex-grow overflow-y-auto bg-white p-4">
        {messages.map(message => (
          <div key={message.id} className={`flex items-end mb-4 ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}>
            {message.senderId !== userId && (
              <img src={selectedUser?.profileImageUrl || ''} alt={selectedUser?.firstName || 'Unknown'} className="w-8 h-8 rounded-full mr-2" />
            )}
            <div className={`p-3 rounded-lg ${message.senderId === userId ? 'bg-green-500 text-white self-end' : 'bg-gray-200 text-gray-700 self-start'}`}>
              <p className="text-sm">{message.text}</p>
            </div>
            {message.senderId === userId && (
              <img src={loggedInUser?.profileImageUrl || ''} alt={loggedInUser?.firstName || 'Unknown'} className="w-8 h-8 rounded-full ml-2" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 border-t border-gray-300 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-green-500"
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage} className="bg-green-500 text-white px-4 py-2 rounded-r-lg ml-2 hover:bg-green-600 focus:outline-none focus:bg-green-600">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
