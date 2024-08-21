'use client'
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";

import UserProfile from "@/components/Profile";
import RequestList from "@/components/RequestList";

const Notification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const notificationsSnapshot = await getDocs(notificationsRef);

      const notificationsData = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);

    await updateDoc(notificationRef, { read: true });

    if (notification.type === "like" || notification.type === "comment" || notification.type === "reply") {
      router.push(`/post/${notification.posterId}-${notification.postId}`);
    }
  };

  const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const secondsAgo = Math.floor((now - timestamp.toMillis()) / 1000);

    if (secondsAgo < 60) return `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`;
    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen mb-20 mt-10">
      {/* Profile section */}
   

      {/* Notifications section */}
      <div className="md:w-1/3 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Notifications</h1>
        {loading ? (
          <p>Loading notifications...</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 mb-4 rounded-lg ${notification.read ? "bg-white" : "bg-green-300"} cursor-pointer`}
              onClick={() => handleNotificationClick(notification)}
            >
              <p className="text-green-800">
                {notification.fromUserName} {notification.type === "comment" ? "commented on" : notification.type === "reply" ? "replied to" : `${notification.fromUserName} liked`} your post: {notification.postContent || notification.commentContent}
              </p>
              <p className="text-green-600 text-sm">
                {formatRelativeTime(notification.timestamp)}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="md:w-2/3 p-6 bg-white shadow-md rounded-lg">
      <RequestList userId={user.uid}/>
      </div>
    </div>
  );
};

export default Notification;
