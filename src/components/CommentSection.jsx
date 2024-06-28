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
import ReplySection from "./ReplySection";

const CommentSection = ({ userId, postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeReply, setActiveReply] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const COMMENTS_LIMIT = 5;
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

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

  const fetchComments = async (loadMore = false) => {
    try {
      setLoading(true);
      const commentsRef = collection(db, "users", userId, "posts", postId, "comments");
      let q = query(commentsRef, orderBy("createdAt", "desc"), limit(COMMENTS_LIMIT));

      if (loadMore && lastVisible) {
        q = query(commentsRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(COMMENTS_LIMIT));
      }

      const querySnapshot = await getDocs(q);
      const fetchedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (loadMore) {
        setComments((prevComments) => [...prevComments, ...fetchedComments]);
      } else {
        setComments(fetchedComments);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMoreComments(querySnapshot.docs.length === COMMENTS_LIMIT);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const commentsRef = collection(db, "users", userId, "posts", postId, "comments");
        await addDoc(commentsRef, {
          content: newComment,
          userId: currentUser.uid,
          username: userData.firstName,
          profilePic: userData.profileImageUrl,
          createdAt: serverTimestamp(),
        });

        // Send notification to post owner
        if (userId !== currentUser.uid) {
          const notificationsRef = collection(db, "users", userId, "notifications");
          await addDoc(notificationsRef, {
            type: "comment",
            fromUserId: currentUser.uid,
            fromUserName: userData.firstName,
            posterId:userId,
            postId: postId,
            postContent: newComment,
            timestamp: serverTimestamp(),
            read: false,
          });
        }

        setNewComment("");
        fetchComments();
      } else {
        console.error("User data not found");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
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
          placeholder="Add a comment..."
          rows={1}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="ml-2 px-4 py-2 mt-1 bg-blue-500 text-white rounded-lg" onClick={handleAddComment}>
          {">"}
        </button>
      </div>
      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center mb-2">
                <img src={comment.profilePic} alt={comment.username} className="w-8 h-8 rounded-full mr-2" />
                <p className="text-gray-700">{comment.username}</p>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              <p className="text-gray-500 text-sm">{formatRelativeTime(comment.createdAt.seconds)}</p>
              <ReplySection
                userId={userId}
                postId={postId}
                commentId={comment.id}
                currentUser={currentUser}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
              />
            </div>
          ))}
          {hasMoreComments && (
            <button className="text-blue-500" onClick={() => fetchComments(true)}>
              Load More Comments
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
