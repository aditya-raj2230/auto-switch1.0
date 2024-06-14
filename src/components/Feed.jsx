import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useAuth } from '../app/context/AuthContext';
import { useFollow } from '../app/context/FollowContext';
import VehicleList from './VehicleList';
import UserProfile from './UserProfile';
import InviteFriend from './InviteFriends';
import { db } from '@/app/firebase/config';

const Feed = () => {
  const { user } = useAuth();
  const { followingList, setFollowingList } = useFollow();
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isGray, setIsGray] = useState(false);
  const router = useRouter();

  const handleFollow = async (targetUserId) => {
    const isFollowing = followingList.includes(targetUserId);
    const userDocRef = doc(db, "users", user.uid);
    const targetUserDocRef = doc(db, "users", targetUserId);

    try {
      await updateDoc(userDocRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
        followingCount: increment(isFollowing ? -1 : 1),
      });

      await updateDoc(targetUserDocRef, {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
        followerCount: increment(isFollowing ? -1 : 1),
      });

      setFollowingList((prevList) =>
        isFollowing ? prevList.filter((id) => id !== targetUserId) : [...prevList, targetUserId]
      );
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserData(userData);
            setProfileImageUrl(userData.profileImageUrl);
            setBannerImageUrl(userData.bannerImageUrl);
            setFollowingList(userData.following || []);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("firstName"), limit(10));
        const querySnapshot = await getDocs(q);
        const userList = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        const filteredUsers = userList.filter((user) => user.id !== user.uid);
        setUsers(filteredUsers);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [user]);

  const fetchMoreUsers = async () => {
    if (!lastVisible) return;
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("firstName"), startAfter(lastVisible), limit(10));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      const filteredUsers = userList.filter((user) => user.id !== user.uid);
      setUsers((prevUsers) => [...prevUsers, ...filteredUsers]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more users:", error);
    }
    setLoading(false);
  };

  const handleProfileClick = async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserData(userData);
        setProfileImageUrl(userData.profileImageUrl);
        setBannerImageUrl(userData.bannerImageUrl);
        setSelectedUserId(userId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEdit = () => {
    router.push("/edit");
  };

  const handlePersonal = async () => {
    try {
      const userDoc = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserData(userData);
        setProfileImageUrl(userData.profileImageUrl);
        setBannerImageUrl(userData.bannerImageUrl);
        setSelectedUserId(user.uid);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleCopy = () => {
    const urlInput = document.getElementById("urlInput");
    urlInput.select();
    urlInput.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("URL copied to clipboard");
    setShowModal(false);
    setIsGray(true);
    setTimeout(() => {
      setIsGray(false);
    }, 5000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mt-0 mr-8">
        <button className="bg-indigo-600 text-white px-4 py-2 mt-5 rounded-lg hover:bg-indigo-800" onClick={handlePersonal}>
          My Profile
        </button>

        {showModal && <InviteFriend onCopy={handleCopy} onClose={() => setShowModal(false)} isGray={isGray} />}
      </div>

      {userData && <UserProfile userData={userData} profileImageUrl={profileImageUrl} bannerImageUrl={bannerImageUrl} selectedUserId={selectedUserId} handleFollow={handleFollow} handleEdit={handleEdit} followingList={followingList} />}

      <div className="max-w-5xl mx-auto my-10 p-8 bg-white rounded-lg shadow-lg relative">
        <h1 className="text-2xl font-bold mb-6">Add Friends</h1>
        <button className={`px-4 py-2 rounded-lg absolute right-8 top-6 ${isGray ? "bg-gray-600 hover:bg-gray-800" : "bg-indigo-600 hover:bg-indigo-800"} text-white`} onClick={() => setShowModal(true)}>
          Invite Friend
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105" onClick={() => handleProfileClick(user.id)}>
              <img src={user.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
              <div className="text-center">
                <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                <button className={`bg-indigo-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-indigo-800 ${followingList.includes(user.id) ? "bg-gray-600 hover:bg-gray-800" : ""}`} onClick={(e) => { e.stopPropagation(); handleFollow(user.id); }}>
                  {followingList.includes(user.id) ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {lastVisible && (
          <div className="mt-6 flex justify-center">
            <button onClick={fetchMoreUsers} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800" disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
