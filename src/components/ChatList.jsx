import React, { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, onSnapshot, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";
import ChatRoom from "./ChatRoom";
import SearchResult from "./SearchResult";

// Utility function to fetch user data by user ID
const fetchUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
};

// Function to count unseen messages for a chat room
const countUnseenMessages = async (chatRoomId, userId) => {
  const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
  const querySnapshot = await getDocs(messagesRef);
  return querySnapshot.docs.filter((doc) => !doc.data().seen && doc.data().senderId !== userId).length;
};

const ChatList = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isChatListVisible, setIsChatListVisible] = useState(false);

  useEffect(() => {
    const fetchLoggedInUserData = async () => {
      if (userId) {
        setLoggedInUser(await fetchUserData(userId));
      }
    };
    fetchLoggedInUserData();
  }, [userId]);

  const markMessagesAsSeen = async (chatRoomId, userId) => {
    const messagesRef = collection(db, `chatRooms/${chatRoomId}/messages`);
    const querySnapshot = await getDocs(messagesRef);
    querySnapshot.forEach(async (doc) => {
      if (!doc.data().seen && doc.data().senderId !== userId) {
        await updateDoc(doc.ref, { seen: true });
      }
    });
  };

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, `users/${userId}/chats`));
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chatUsers = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const userData = await fetchUserData(doc.id);
          const chatRoomId = createChatRoomId(userId, doc.id);
          const unseenCount = await countUnseenMessages(chatRoomId, userId);
          return { id: doc.id, ...userData, ...doc.data(), unseenCount };
        }));
        setUsers(chatUsers.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp));
      });
      return unsubscribe;
    }
  }, [userId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const fetchSearchResults = async () => {
      const q = query(collection(db, "users"), orderBy("firstName"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(usersData.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    };
    fetchSearchResults();
  }, [searchQuery]);

  const handleUserClick = async (user) => {
    const chatRoomId = createChatRoomId(userId, user.id);
    setSelectedChatRoomId(chatRoomId);
    setSelectedUser(await fetchUserData(user.id));
    await markMessagesAsSeen(chatRoomId, userId);
    setSearchQuery('');
    setSearchResults([]);
    setIsChatListVisible(false);
  };

  const handleSendMessage = async (message) => {
    if (!selectedUser) return;
    const chatRoomId = createChatRoomId(userId, selectedUser.id);
    const messageTimestamp = new Date();
    const loggedInUserData = loggedInUser;
    const loggedInUserDetails = {
      id: userId,
      firstName: loggedInUserData?.firstName || 'Unknown',
      lastName: loggedInUserData?.lastName || 'User',
      ...(loggedInUserData?.profileImageUrl && { profileImageUrl: loggedInUserData.profileImageUrl }),
      lastMessageTimestamp: messageTimestamp,
      lastMessage: { senderId: userId, text: message, timestamp: messageTimestamp }
    };
    const selectedChatUser = {
      id: selectedUser.id,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      ...(selectedUser?.profileImageUrl && { profileImageUrl: selectedUser.profileImageUrl }),
      lastMessageTimestamp: messageTimestamp,
      lastMessage: { senderId: userId, text: message, timestamp: messageTimestamp }
    };
    await setDoc(doc(db, `users/${userId}/chats`, chatRoomId), selectedChatUser, { merge: true });
    await setDoc(doc(db, `users/${selectedUser.id}/chats`, chatRoomId), loggedInUserDetails, { merge: true });
  };

  const createChatRoomId = (userId1, userId2) => userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;

  return (
    <div className="flex h-full w-full">
      <div className={`w-1/3 border-r border-gray-300 flex flex-col relative ${isChatListVisible ? 'block' : 'hidden'} md:block`}>
        <div className="bg-white p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-400">Chats</h1>
          <button className="md:hidden" onClick={() => setIsChatListVisible(false)}>X</button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full mt-4 p-2 border border-gray-400 focus:border-green-300 rounded focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="p-4 cursor-pointer hover:bg-green-100 hover:border-green-400 hover:border-2 hover:rounded-lg m-2 transition-colors duration-200"
            >
              <div className="flex items-center">
                <img src={user.profileImageUrl} alt={user.firstName} className="w-10 h-10 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-black">{user.firstName} {user.lastName}</p>
                    {user.unseenCount > 0 && (
                      <span className="ml-2 text-xs text-red-500 font-semibold">{user.unseenCount}</span>
                    )}
                  </div>
                  {user.lastMessage && (
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-600">{user.lastMessage.senderId === userId ? 'You' : user.firstName}: {user.lastMessage.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {searchQuery && (
          <SearchResult users={searchResults} onUserClick={handleUserClick} />
        )}
      </div>
      <div className="w-full md:w-2/3 bg-white flex flex-col">
        <div className="p-4 flex justify-between items-center md:hidden">
          <button onClick={() => setIsChatListVisible(true)}>
            ☰
          </button>
          <h1 className="text-3xl font-bold text-green-400">Chat</h1>
        </div>
        {selectedChatRoomId ? (
          <div className="h-full w-full">
            <ChatRoom
              chatRoomId={selectedChatRoomId}
              selectedUser={selectedUser}
              onSendMessage={handleSendMessage}
              loggedInUser={loggedInUser}
            />
          </div>
        ) : (
          <div className="border-b border-gray-300 p-4">
            <h1 className="text-3xl font-bold text-green-400">Select a chat</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
