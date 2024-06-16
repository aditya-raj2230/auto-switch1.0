import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config"; // Update with your Firebase configuration
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from "firebase/firestore";
import { useAuth } from '../app/context/AuthContext'; // Assuming you have an Auth context to get the current user

const PublicPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const usersQuerySnapshot = await getDocs(collection(db, "users"));
      const userDocs = usersQuerySnapshot.docs;

      const userPostPromises = userDocs.map(async (userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const postsRef = collection(db, "users", userId, "posts");
        const postsSnapshot = await getDocs(postsRef);

        return postsSnapshot.docs.map((postDoc) => ({
          id: postDoc.id,
          ...postDoc.data(),
          userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
        }));
      });

      const allPosts = (await Promise.all(userPostPromises)).flat();

      // Sort posts by createdAt
      allPosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setPosts(allPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (userSnapshot) => {
      userSnapshot.docChanges().forEach(async (userChange) => {
        if (userChange.type === "added" || userChange.type === "modified") {
          const userId = userChange.doc.id;
          const userData = userChange.doc.data();

          const postsRef = collection(db, "users", userId, "posts");
          const postsSnapshot = await getDocs(postsRef);

          const updatedPosts = postsSnapshot.docs.map((postDoc) => ({
            id: postDoc.id,
            ...postDoc.data(),
            userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
          }));

          setPosts((prevPosts) => {
            const newPosts = prevPosts.filter((post) => post.userId !== userId);
            const mergedPosts = [...newPosts, ...updatedPosts];
            mergedPosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            return mergedPosts;
          });
        }
      });
    });

    return () => unsubscribeUsers();
  }, []);

  const handleLikeToggle = async (post) => {
    const postRef = doc(db, "users", post.userId, "posts", post.id);
    const userId = user.uid;

    try {
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();

      if (postData.likes?.includes(userId)) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
          likeCount: postData.likeCount - 1,
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          likeCount: (postData.likeCount || 0) + 1,
        });
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? { ...p, likes: postData.likes.includes(userId) ? postData.likes.filter((id) => id !== userId) : [...postData.likes, userId], likeCount: postData.likes.includes(userId) ? postData.likeCount - 1 : postData.likeCount + 1 }
            : p
        )
      );
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="w-1/3 h-auto max-w-full p-6 bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div className="flex items-center mb-4">
              <img
                src={post.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full mr-4"
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
            <p className="mb-4 overflow-hidden overflow-ellipsis">{post.content}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="mt-4 rounded-lg max-h-64 w-full object-cover" />
            )}
            <div className="flex justify-between items-center mt-4">
              <button
                className="flex items-center text-gray-500 hover:text-blue-500"
                onClick={() => handleLikeToggle(post)}
              >
                {post.likes?.includes(user.uid) ? (
                  <img src="/icons8-heart-64.png" alt="Liked" className="h-8 w-8" />
                ) : (
                  <img src="/icons8-heart-50.png" alt="Like" className="h-8 w-8" />
                )}
                <span className="ml-2">{post.likeCount || 0}</span>
              </button>

              <button className="flex items-center text-gray-500 hover:text-blue-500">
                <img src="/icons8-comment-50.png" alt="Comment" className="h-8 w-8" />
              </button>
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

export default PublicPosts;
