import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import api from "../../helpers/api";

const TourCard = ({ tour, onSelect, showAdminControls, onEdit, onDelete }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchReviews = async () => {
    if (reviews.length > 0) return;

    setLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/tour/${tour.id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="mb-8">
      <motion.div
        className="relative w-[300px] h-[200px] cursor-pointer rounded overflow-hidden shadow-md"
        onClick={onSelect}
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <img
          src={tour.img_url}
          alt={tour.title}
          className="object-cover w-full h-full"
        />

        {/* Admin Controls (only shown if prop is true) */}
        {showAdminControls && (
          <div className="absolute top-2 right-2 flex space-x-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}

        <motion.h3
          className="text-lg font-semibold"
          variants={{
            rest: { y: 0, opacity: 1 },
            hover: { y: 20, opacity: 0 },
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute bottom-0 w-full bg-white/60 text-black p-2 text-center overflow-hidden">
            <div className="flex justify-center items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(tour.average_rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {tour.title}
          </div>
        </motion.h3>

        <motion.div
          className="absolute inset-0 flex items-center justify-center p-4 text-sm text-center"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}
        >
          <motion.p
            className="text-black"
            variants={{
              rest: { y: -20, opacity: 0 },
              hover: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.4 }}
          >
            {tour.description ||
              "Explore the best sights and hidden gems of Vilnius with this guided tour..."}
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="mt-2 w-[300px]">
        {showReviews && (
          <div className="mt-2 bg-gray-50 p-3 rounded">
            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-700">
                        {review.user_name} •{" "}
                        {format(new Date(review.registered_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCard;
