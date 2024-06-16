'use client'
import React, { useState } from 'react';
import { storage, db } from '@/app/firebase/config'; // Import your Firebase configuration
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc } from 'firebase/firestore';
import { useAuth } from '../app/context/AuthContext'; // Assuming you have an Auth context to get the current user
import { useRouter } from 'next/navigation';

const CreatePostForm = () => {
  const { user } = useAuth(); // Get the current logged-in user
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      console.log("done posting");
      router.push('/'); // Uncomment if you have a router setup
    } catch (error) {
      console.error("Error creating post:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Create Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Upload Image
          </label>
        </div>
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostForm;
