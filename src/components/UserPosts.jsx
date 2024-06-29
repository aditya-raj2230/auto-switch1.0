'use client';
import React, { useState, useEffect } from "react";
import { db, storage } from "@/app/firebase/config"; // Update with your Firebase configuration
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from '../app/context/AuthContext'; // Assuming you have an Auth context to get the current user
import { useRouter } from "next/navigation";
import Link from "next/link";

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const router = useRouter();

  const fetchUserProfileImage = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setProfileImageUrl(userData.profileImageUrl || '/default-profile.png');
      } else {
        setProfileImageUrl('/default-profile.png');
      }
    } catch (error) {
      console.error("Error fetching user profile image:", error);
      setProfileImageUrl('/default-profile.png');
    }
  };

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, "users", userId, "posts");
      const postsSnapshot = await getDocs(postsRef);

      const userPosts = postsSnapshot.docs.map((postDoc) => ({
        id: postDoc.id,
        ...postDoc.data(),
      }));

      // Sort posts by createdAt
      userPosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setPosts(userPosts);

      // Fetch the profile image URL once posts are fetched
      fetchUserProfileImage(userId);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const handleProfileClick = (userId) => {
    router.push(`/profile`);
  };

  const handleImageError = () => {
    console.log("Error loading profile image.");
    setProfileImageUrl('/default-profile.png');
  };
  if (posts.length === 0) {
    return <div className="w-2/3 p-4 bg-green-100 rounded-lg m-8 shadow-lg">No posts found.</div>;
  }
  
  return (
    <div className="w-full max-w-3xl flex flex-col items-center ">
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="w-full p-6 bg-white shadow-md rounded-lg mb-4 relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center cursor-pointer" onClick={() => handleProfileClick(userId)}>
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mr-4"
                  onError={handleImageError}
                />
                <div>
                  <p className="font-bold text-xl">
                    {post.firstName} {post.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Date: {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-4">{post.content}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="mt-4 rounded-lg max-h-64 w-full object-cover" />
            )}
            <div className="flex justify-between items-center mt-4">
              <button className="flex items-center text-gray-500 hover:text-blue-500">
                <img src="/icons8-heart-50.png" alt="Like" className="h-8 w-8" />
                <span className="ml-2">{post.likeCount || 0}</span>
              </button>

              <Link href={`/post/${post.id}`} className="flex items-center text-gray-500 hover:text-blue-500">
                <img src="/icons8-comment-50.png" alt="Comment" className="h-8 w-8" />
              </Link>
              <button className="flex items-center text-gray-500 hover:text-blue-500">
                <img src="/icons8-share-50.png" alt="Share" className="h-8 w-8" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserPosts;
