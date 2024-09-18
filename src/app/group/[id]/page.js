"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  setDoc,
  query,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import UserList from "@/components/UserList";
import { db } from "@/app/firebase/config"; // Ensure this import is correct

const GroupDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [groupMembersDetails, setGroupMembersDetails] = useState([]);
  const [vehicles, setVehicles] = useState([]); // State for vehicles
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchGroup();
    fetchVehicles(); // Fetch vehicles on component mount
  }, [id]);

  useEffect(() => {
    if (group) {
      fetchGroupMembersDetails(group.members);
    }
  }, [group]);

  const fetchGroup = async () => {
    const db = getFirestore();
    const groupDoc = doc(db, "groups", id);
    const groupSnapshot = await getDoc(groupDoc);

    if (groupSnapshot.exists()) {
      setGroup(groupSnapshot.data());
    } else {
      console.error("Group not found");
      router.push("/404");
    }

    setLoading(false);
  };

  const fetchGroupMembersDetails = async (members) => {
    const membersDetails = await Promise.all(
      members.map(async (memberId) => {
        const userDoc = await getDoc(doc(db, "users", memberId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
      })
    );
    setGroupMembersDetails(membersDetails.filter((member) => member !== null));
  };

  const fetchVehicles = async () => {
    try {
      const vehiclesQuery = query(collection(db, "groups", id, "marketplace"));
      const vehiclesSnapshot = await getDocs(vehiclesQuery);
      const vehiclesList = vehiclesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleAddFriend = (friend) => {
    console.log("Add friend:", friend);
  };

  const handleJoinGroup = async () => {
    try {
      const groupRef = doc(db, "groups", id);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: [...prevGroup.members, user.uid],
      }));
      fetchGroupMembersDetails([...group.members, user.uid]); // Refetch member details
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleExitGroup = async () => {
    try {
      const groupRef = doc(db, "groups", id);
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
      });
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter((member) => member !== user.uid),
      }));
      fetchGroupMembersDetails(
        group.members.filter((member) => member !== user.uid)
      ); // Refetch member details
    } catch (error) {
      console.error("Error exiting group:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchGroupMembersDetails(group.members); // Refetch member details after modal close
  };

  const createChatRoomId = (userId1, userId2) => {
    // Ensure the chat room ID is the same regardless of the order of user IDs
    return [userId1, userId2].sort().join("_");
  };
  const redirectToMessage = async (contactUserId) => {

    try {
      router.push('/chat')
      const chatRoomId = createChatRoomId(userId, contactUserId);
  
      // Check if the chat room already exists
      const chatRoomRef = doc(db, "chatRooms", chatRoomId);
      const chatRoomDoc = await getDoc(chatRoomRef);
  
      if (!chatRoomDoc.exists()) {
        // Create a new chat room if it doesn't exist
        await setDoc(chatRoomRef, {
          users: {
            [userId]: true, // Current user
            [contactUserId]: true, // Selected contact
          },
          createdAt: Timestamp.now(),
          lastMessageTimestamp: null,
        });
      }
  
      // Update the state to display the chat room
      setSelectedChatRoomId(chatRoomId);  // Set the chat room ID for the ChatRoom component
  
      // Fetch selected user data for display
      const selectedUserData = await fetchUserData(contactUserId);
      setSelectedUser(selectedUserData);  // Set the selected user for the ChatRoom component
  
      // Optionally, mark messages as seen if required
      await markMessagesAsSeen(chatRoomId, userId);
  
      // Clear the search after selecting the chat
      setSearchQuery('');
      setSearchResults([]);
  
      
    } catch (error) {
      console.error("Error redirecting to chat:", error);
    }
  };
  
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const isAdmin = user && group.admin === user.uid;
  const isMember = user && group.members.includes(user.uid);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-8 bg-white rounded-md shadow-md">
      <img
        src={group.imageUrl}
        alt={group.name}
        className="w-full h-64 object-cover rounded-md"
      />
      <h1 className="text-3xl font-bold mt-4">{group.name}</h1>
      <p className="text-gray-700 mt-2">{group.description}</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Members:</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {groupMembersDetails.map((member, index) => (
            <div
              key={index}
              className="bg-gray-100 p-2 rounded-md shadow-sm flex flex-col items-center"
              style={{ width: "100%", height: "100px", overflow: "hidden" }}
            >
              <img
                src={member.profileImageUrl || "/default-avatar.png"}
                alt={member.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="text-sm text-gray-600 mt-2 text-center truncate">
                {member.firstName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!isAdmin && !isMember && (
        <button
          onClick={handleJoinGroup}
          className="w-full bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-700"
        >
          Join Group
        </button>
      )}
      {isMember && !isAdmin && (
        <button
          onClick={handleExitGroup}
          className="w-full bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-700"
        >
          Exit Group
        </button>
      )}
      {isAdmin && (
        <div className="mb-4">
          <button
            onClick={() => setShowModal(true)}
            className={`w-full bg-blue-500 text-white px-4 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            Add Members
          </button>
        </div>
      )}
      {showModal && (
        <UserList
          groupId={id}
          onAddFriend={handleAddFriend}
          onClose={handleModalClose}
        />
      )}

      {/* Vehicle Listings */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Marketplace Vehicles:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={vehicle.imageUrl || "/placeholder-image.png"}
                alt={vehicle.model}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{vehicle.model}</h3>
                <p className="text-gray-600">
                  Manufacturer: {vehicle.manufacturer}
                </p>
                <p className="text-gray-600">Year: {vehicle.year}</p>
             
                <button
                  onClick={() => redirectToMessage(vehicle.ownerId)}
                  className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
