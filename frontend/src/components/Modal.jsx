import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../../helpers/api";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay } from "date-fns";

const Modal = ({ tour, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const modalRef = useRef();

  const availableDates = useMemo(() => {
    if (!tour.dates || !Array.isArray(tour.dates)) return [];
    return tour.dates
      .map((d) => {
        try {
          return d.date ? new Date(d.date) : null;
        } catch {
          return null;
        }
      })
      .filter((date) => date !== null);
  }, [tour.dates]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/tour/${tour.id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [tour.id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please login to leave a review.");
    if (!newReview.comment) return alert("Please enter a comment.");

    try {
      const res = await api.post("/reviews", {
        tourId: tour.id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Error submitting review: " + err.response?.data?.message);
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleCalendarChange = (date) => {
    const availableDate = tour.dates?.find((d) =>
      isSameDay(new Date(d.date), date)
    );

    if (availableDate) {
      setSelectedDate(date);
      setSelectedDateId(availableDate.id);
    } else {
      setSelectedDate(null);
      setSelectedDateId(null);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) return alert("Please login to register.");
    if (!selectedDateId) return alert("Please select an available date.");
    try {
      await api.post("/registrations", { tourDateId: selectedDateId });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      alert("Error registering: " + err.response?.data?.message);
    }
  };

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Registration successful!</span>
          </div>
        </motion.div>
      )}

      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-40">
        <motion.div
          ref={modalRef}
          className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl relative mx-4 max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="space-y-5">
            {/* Tour Info Section */}
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">{tour.title}</h2>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-sm">
              <img
                src={tour.img_url || "/default-tour.jpg"}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">${tour.price}</span>
              <span>{tour.duration_minutes} minutes</span>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-600">{tour.description}</p>
            </div>
            {/* Date Selection Section */}
            {availableDates.length > 0 ? (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">
                  Select Available Date
                </h3>

                <div className="mb-4">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleCalendarChange}
                    minDate={new Date()}
                    inline
                    filterDate={(date) =>
                      availableDates.some((d) => isSameDay(d, date))
                    }
                    calendarClassName="w-full border-0"
                    wrapperClassName="w-full"
                    renderCustomHeader={({
                      monthDate,
                      decreaseMonth,
                      increaseMonth,
                    }) => (
                      <div className="flex items-center justify-between px-2 py-2">
                        <button
                          onClick={decreaseMonth}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <span className="text-lg font-medium text-gray-700">
                          {format(monthDate, "MMMM yyyy")}
                        </span>
                        <button
                          onClick={increaseMonth}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    dayClassName={(date) =>
                      availableDates.some((d) => isSameDay(d, date))
                        ? selectedDate && isSameDay(date, selectedDate)
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-100 text-blue-600"
                        : "text-gray-400 cursor-not-allowed"
                    }
                    renderDayContents={(day, date) => {
                      const isAvailable = availableDates.some((d) =>
                        isSameDay(d, date)
                      );
                      return (
                        <div
                          className={`h-8 w-8 flex items-center justify-center rounded-full ${
                            isAvailable ? "font-medium" : ""
                          }`}
                        >
                          {day}
                        </div>
                      );
                    }}
                  />
                </div>

                {selectedDate && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-blue-700 font-medium">
                      <span className="text-blue-600">Selected:</span>{" "}
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                )}

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedDateId
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleRegister}
                  disabled={!selectedDateId}
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-red-500 mb-4">
                  This tour currently has no scheduled dates.
                </p>
              </div>
            )}
            Reviews Display Section
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                Customer Reviews
              </h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
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
                        <span className="font-medium">{review.user_name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {format(
                            new Date(review.registered_at),
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Review Form Section at the Bottom */}
            {currentUser && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">
                  Write a Review
                </h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-8 h-8 ${
                              star <= newReview.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="comment"
                      className="block text-gray-700 mb-1"
                    >
                      Your Review
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
