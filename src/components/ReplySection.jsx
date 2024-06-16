import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit, startAfter, doc, getDoc } from "firebase/firestore";

const ReplySection = ({
  userId,
  postId,
  commentId,
  currentUser,
  activeReply,
  setActiveReply,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplies, setShowReplies] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const REPLIES_LIMIT = 5;

  // Function to format relative time
  const formatRelativeTime = (timestampInSeconds) => {
    const currentTimestamp = Date.now() / 1000;
    const seconds = Math.floor(currentTimestamp - timestampInSeconds);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;
    }

    return `${Math.floor(seconds)} second${Math.floor(seconds) === 1 ? "" : "s"} ago`;
  };

  const fetchReplies = async (loadMore = false) => {
    try {
      setLoading(true);
      const repliesRef = collection(db, "users", userId, "posts", postId, "comments", commentId, "replies");
      let q = query(repliesRef, orderBy("createdAt", "desc"), limit(REPLIES_LIMIT));

      if (loadMore && lastVisible) {
        q = query(repliesRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(REPLIES_LIMIT));
      }

      const querySnapshot = await getDocs(q);
      const fetchedReplies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (loadMore) {
        setReplies((prevReplies) => [...prevReplies, ...fetchedReplies]);
      } else {
        setReplies(fetchedReplies);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMoreReplies(querySnapshot.docs.length === REPLIES_LIMIT);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!newComment.trim()) return;

    try {
      // Fetch user details
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Add reply with user details
        const repliesRef = collection(db, "users", userId, "posts", postId, "comments", commentId, "replies");
        await addDoc(repliesRef, {
          content: newComment,
          userId: currentUser.uid,
          username: userData.firstName,
          profilePic: userData.profileImageUrl,
          createdAt: serverTimestamp(),
        });
        setNewComment("");
        fetchReplies();
      } else {
        console.error("User data not found");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [showReplies]);

  return (
    <div className="w-full mt-4">
      <button
        className="text-blue-500"
        onClick={() => {
          setShowReplies(!showReplies);
          setActiveReply(commentId);
        }}
      >
        {showReplies ? "Hide Replies" : "Show Replies"}
      </button>
      {showReplies && (
        <>
          {loading ? (
            <p>Loading replies...</p>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center mb-2">
                    <img src={reply.profilePic} alt={reply.username} className="w-8 h-8 rounded-full mr-2" />
                    <p className="text-gray-700">{reply.username}</p>
                  </div>
                  <p className="text-gray-700">{reply.content}</p>
                  <p className="text-gray-500 text-sm">
                    {formatRelativeTime(reply.createdAt.seconds)}
                  </p>
                </div>
              ))}
              {hasMoreReplies && (
                <button
                  className="text-blue-500"
                  onClick={() => fetchReplies(true)}
                >
                  Load More Replies
                </button>
              )}
            </div>
          )}
          {activeReply === commentId && (
            <div className="mt-4 flex items-start">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg"
                style={{
                  minHeight: "3rem",
                  lineHeight: "1.5",
                  resize: "none",
                  overflowY: "hidden",
                }}
                placeholder="Add a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleAddReply}
              >
                {">"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReplySection;
