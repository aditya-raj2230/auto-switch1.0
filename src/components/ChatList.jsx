'use client'
import React, { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, onSnapshot, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useAuth } from "../app/context/AuthContext";
import ChatRoom from "./ChatRoom";
import SearchResult from "./SearchResult";

// Utility function to fetch user data by user ID
const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userId, ...userDoc.data() };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  return null;
};

const ChatList = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const q = query(collection(db, `users/${userId}/chats`), orderBy("lastMessageTimestamp", "desc"));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const chatUsers = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const userData = await fetchUserData(doc.id);
            return {
              id: doc.id,
              ...userData,
              ...doc.data()
            };
          }));
          setUsers(chatUsers);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching chat users:", error);
      }
    };

    if (userId) {
      fetchChatUsers();
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
      const filtered = usersData.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleUserClick = async (user) => {
    const chatRoomId = createChatRoomId(userId, user.id);
    setSelectedChatRoomId(chatRoomId);

    const userData = await fetchUserData(user.id);

    if (!userData) {
      console.error("Error fetching selected user data.");
      return;
    }

    setSelectedUser(userData);

    // Ensure all required fields are defined
    if (!userData.firstName || !userData.lastName || !userData.profileImageUrl) {
      console.error('User data is incomplete', userData);
      return;
    }

    // Clear the search query and results
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async (message) => {
    if (!selectedUser) return;

    const chatRoomId = createChatRoomId(userId, selectedUser.id);
    const messageTimestamp = new Date();

    // Fetch the logged in user's data
    const loggedInUserData = await fetchUserData(userId);

    const loggedInUser = {
      id: userId,
      firstName: loggedInUserData?.firstName || 'Unknown',
      lastName: loggedInUserData?.lastName || 'User',
      ...(loggedInUserData?.profileImageUrl && { profileImageUrl: loggedInUserData.profileImageUrl }),
      lastMessageTimestamp: messageTimestamp,
      lastMessage: {
        senderId: userId,
        text: message,
        timestamp: messageTimestamp
      }
    };

    const selectedChatUser = {
      id: selectedUser.id,
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      ...(selectedUser?.profileImageUrl && { profileImageUrl: selectedUser.profileImageUrl }),
      lastMessageTimestamp: messageTimestamp,
      lastMessage: {
        senderId: userId,
        text: message,
        timestamp: messageTimestamp
      }
    };
    

    // Update both users' chat lists
    await setDoc(doc(db, `users/${userId}/chats`, chatRoomId), selectedChatUser, { merge: true });
    await setDoc(doc(db, `users/${selectedUser.id}/chats`, chatRoomId), loggedInUser, { merge: true });
  };

  const createChatRoomId = (userId1, userId2) => {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-300 flex flex-col relative">
        <div className="bg-gray-200 p-4">
          <h1 className="text-3xl font-bold">Chats</h1>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full mt-4 p-2 border border-gray-400 rounded"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(user => (
            <div key={user.id} onClick={() => handleUserClick(user)} className="p-4 cursor-pointer hover:bg-gray-200">
              <div className="flex items-center">
                <img src={user.profileImageUrl} alt={user.firstName} className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
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
      <div className="w-2/3 bg-white flex flex-col">
        {selectedChatRoomId ? (
          <ChatRoom chatRoomId={selectedChatRoomId} selectedUser={selectedUser} onSendMessage={handleSendMessage} />
        ) : (
          <div className="border-b border-gray-300 p-4">
            <h1 className="text-3xl font-bold">Select a chat</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
