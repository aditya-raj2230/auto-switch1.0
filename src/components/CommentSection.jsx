import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit, startAfter } from "firebase/firestore";
import ReplySection from "./ReplySection";

const CommentSection = ({ userId, postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeReply, setActiveReply] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const COMMENTS_LIMIT = 5;

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
      const commentsRef = collection(db, "users", userId, "posts", postId, "comments");
      await addDoc(commentsRef, {
        content: newComment,
        userId: currentUser.uid,
        username: currentUser.firstName,
        profilePic: currentUser.profileImageUrl,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleReplyOpen = (isOpen) => {
    setIsReplyOpen(isOpen);
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
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
              <p className="text-gray-500 text-sm">
                {comment.createdAt?.seconds
                  ? new Date(comment.createdAt.seconds * 1000).toLocaleString()
                  : "Just now"}
              </p>
              <ReplySection
                userId={userId}
                postId={postId}
                commentId={comment.id}
                currentUser={currentUser}
                onReplyOpen={handleReplyOpen}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
              />
            </div>
          ))}
          {hasMoreComments && (
            <button
              className="text-blue-500"
              onClick={() => fetchComments(true)}
            >
              Load More Comments
            </button>
          )}
        </div>
      )}
      {!isReplyOpen && (
        <div className="mt-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="3"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleAddComment}
          >
            Add Comment
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
