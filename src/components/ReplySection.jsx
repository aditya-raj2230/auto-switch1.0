import React, { useState, useEffect, useRef } from "react";
import { db } from "@/app/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";

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
  const textareaRef = useRef(null);

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [showReplies]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [newComment]);

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
      const repliesRef = collection(
        db,
        "users",
        userId,
        "posts",
        postId,
        "comments",
        commentId,
        "replies"
      );
      let q = query(
        repliesRef,
        orderBy("createdAt", "desc"),
        limit(REPLIES_LIMIT)
      );

      if (loadMore && lastVisible) {
        q = query(
          repliesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(REPLIES_LIMIT)
        );
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
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const repliesRef = collection(
          db,
          "users",
          userId,
          "posts",
          postId,
          "comments",
          commentId,
          "replies"
        );
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

  return (
    <div className="mt-4">
      {!showReplies ? (
        <button
          className="text-blue-500"
          onClick={() => {
            setShowReplies(true);
            setActiveReply(commentId);
          }}
        >
          Show Replies
        </button>
      ) : (
        <>
          <button
            className="text-blue-500"
            onClick={() => {
              setShowReplies(false);
              setActiveReply(null);
              setReplies([]);
            }}
          >
            Hide Replies
          </button>
          <div className="space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <img
                    src={reply.profilePic}
                    alt={reply.username}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <p className="text-gray-700">{reply.username}</p>
                </div>
                <p className="text-gray-700">{reply.content}</p>
                <p className="text-gray-500 text-sm">
                  {formatRelativeTime(reply.createdAt.seconds)}
                </p>
              </div>
            ))}
            {hasMoreReplies && (
              <button className="text-blue-500" onClick={() => fetchReplies(true)}>
                Load More Replies
              </button>
            )}
          </div>
          {activeReply === commentId && (
            <div className="mt-4 flex items-start">
              <textarea
                ref={textareaRef}
                className="w-full p-2 border border-gray-300 rounded-lg"
                style={{
                  minHeight: "3rem",
                  lineHeight: "1.5",
                  resize: "none",
                  overflowY: "hidden",
                }}
                placeholder="Add a reply..."
                rows={1}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="ml-2 px-4 py-2 mt-1 bg-blue-500 text-white rounded-lg"
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
