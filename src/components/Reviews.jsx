import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config"; // Adjust the import based on your project structure

const Reviews = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const reviewsCollection = collection(db, "users", userId, "reviews");
        const reviewsQuery = query(reviewsCollection);
        const querySnapshot = await getDocs(reviewsQuery);
        
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReviews();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="w-2/3 p-4 bg-green-100 rounded-lg m-8 shadow-lg">No reviews found.</div>;
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-lg mb-4">
      <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="mb-4">
          <div className="text-gray-900 font-bold">{review.reviewerName}</div>
          <div className="text-gray-600">{review.comment}</div>
          <div className="text-sm text-gray-500">Rating: {review.rating}</div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
