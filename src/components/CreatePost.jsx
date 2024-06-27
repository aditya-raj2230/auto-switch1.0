"use client";
import React, { useState, useRef, useEffect } from "react";
import { storage, db } from "@/app/firebase/config"; // Import your Firebase configuration
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc } from "firebase/firestore";
import { useAuth } from "../app/context/AuthContext"; // Assuming you have an Auth context to get the current user
import { useRouter } from "next/navigation";

const CreatePostForm = ({ isExpanded, onClose, onExpand }) => {
  const { user } = useAuth(); // Get the current logged-in user
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Display image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;

    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `posts/${user.uid}/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const userDocRef = doc(db, "users", user.uid);

      await addDoc(collection(userDocRef, "posts"), {
        content,
        imageUrl,
        createdAt: new Date()
      });

      setContent("");
      setImageFile(null);
      setImagePreview('');
      router.push('/'); // Uncomment if you have a router setup
    } catch (error) {
      console.error("Error creating post:", error);
    }
    setLoading(false);
  };

  const handleClickInside = (event) => {
    event.stopPropagation();
    if (!isExpanded) {
      onExpand();
    }
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isExpanded ? "fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50" : ""
      }`}
      onClick={handleClickInside}
    >
      <div
        ref={formRef}
        className={`p-4 bg-white shadow-md rounded-lg w-full ${
          isExpanded ? "max-w-3xl mx-auto mt-8" : ""
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-green-600">Create Post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className={`w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isExpanded ? "h-40" : "h-20"
            }`}
          />
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          <div className="flex flex-row justify-between">
            <div className="flex items-center mb-4">
              {/* Hidden input to trigger file selection */}
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              {/* Custom button for file upload */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <img src="/photo.png" alt="upload image" height={32} width={32} />
              </label>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 mt-2 text-white py-2 px-6 rounded-full font-bold hover:bg-green-600 disabled:bg-green-300"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;
