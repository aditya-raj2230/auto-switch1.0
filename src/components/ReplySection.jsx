import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit, startAfter } from "firebase/firestore";

const ReplySection = ({ userId, postId, commentId, currentUser, onReplyOpen, activeReply, setActiveReply }) => {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReplies, setShowReplies] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const REPLIES_LIMIT = 5;

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
    if (!newReply.trim()) return;
    try {
      const repliesRef = collection(db, "users", userId, "posts", postId, "comments", commentId, "replies");
      await addDoc(repliesRef, {
        content: newReply,
        userId: currentUser.uid,
        username: currentUser.displayName,
        profilePic: currentUser.photoURL,
        createdAt: serverTimestamp(),
      });
      setNewReply("");
      fetchReplies();
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
          onReplyOpen(!showReplies);
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
                    {reply.createdAt?.seconds
                      ? new Date(reply.createdAt.seconds * 1000).toLocaleString()
                      : "Just now"}
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
            <div className="mt-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="2"
                placeholder="Add a reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
              ></textarea>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleAddReply}
              >
                Add Reply
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReplySection;
