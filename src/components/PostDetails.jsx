import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Update with your Firebase configuration
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../app/context/AuthContext"; // Assuming you have an Auth context to get the current user
import CommentSection from "./CommentSection";

const PostDetails = ({ postid, currentUser }) => {
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const fetchPostAndUser = async () => {
    try {
      setLoading(true);
      const userId = postid.split("-")[0];
      const postId = postid.split("-")[1];
      const postRef = doc(db, "users", userId, "posts", postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const fetchedPost = { id: postSnapshot.id, ...postSnapshot.data() };
        setPost(fetchedPost);

        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.error("User not found:", userId);
        }
      } else {
        console.error("Post not found:", postId);
      }
    } catch (error) {
      console.error("Error fetching post or user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndUser();
  }, [postid]);

  const handleLikeToggle = async () => {
    // Implement like functionality here
    console.log("Like button clicked");
  };

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {loading ? (
        <p>Loading post...</p>
      ) : post && user ? (
        <div className="w-96 h-auto max-w-full p-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex items-center mb-4">
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="font-bold text-xl">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-gray-500 text-sm">
                Date:{" "}
                {post.createdAt
                  ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                  : "Loading..."}
              </p>
            </div>
          </div>
          <p className="mb-4 overflow-hidden overflow-ellipsis">
            {post.content}
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="mt-4 rounded-lg max-h-64 w-full object-cover"
            />
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              className="flex items-center text-green-600 hover:text-green-800"
              onClick={handleLikeToggle}
            >
              {post.likes?.includes(currentUser) ? (
                <img
                  src="/icons8-heart-64.png"
                  alt="Liked"
                  className="h-8 w-8"
                />
              ) : (
                <img
                  src="/icons8-heart-50.png"
                  alt="Like"
                  className="h-8 w-8"
                />
              )}
              <span className="ml-2">{post.likeCount || 0}</span>
            </button>

            <button
              className="flex items-center text-green-600 hover:text-green-800"
              onClick={toggleComments}
            >
              <img
                src="/icons8-comment-50.png"
                alt="Comment"
                className="h-8 w-8"
              />
            </button>

            <button className="flex items-center text-green-600 hover:text-green-800">
              <img
                src="/icons8-share-50.png"
                alt="Share"
                className="h-8 w-8"
              />
            </button>
          </div>
          {!commentsVisible && (
            <CommentSection
              userId={postid.split("-")[0]}
              postId={postid.split("-")[1]}
              currentUser={currentUser}
            />
          )}
        </div>
      ) : (
        <p>Post not found.</p>
      )}
    </div>
  );
};

export default PostDetails;
