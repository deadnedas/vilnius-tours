import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../helpers/api";
import { format, parseISO } from "date-fns";

const TourForm = ({ tour, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(tour?.title || "");
  const [imgUrl, setImgUrl] = useState(tour?.img_url || "");
  const [duration, setDuration] = useState(tour?.duration_minutes || "");
  const [price, setPrice] = useState(tour?.price || "");
  const [category, setCategory] = useState(tour?.category || "group");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with tour data
  useEffect(() => {
    if (tour?.dates) {
      const initialDates = tour.dates
        .map((dateObj) => {
          try {
            return new Date(dateObj.date || dateObj);
          } catch {
            return null;
          }
        })
        .filter((date) => date !== null);
      setDates(initialDates);
    }
  }, [tour]);

  const handleDateChange = (date) => {
    setDates((prev) => {
      const exists = prev.some((d) => d.getTime() === date.getTime());
      return exists
        ? prev.filter((d) => d.getTime() !== date.getTime())
        : [...prev, date];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tourData = {
        title,
        img_url: imgUrl,
        duration_minutes: Number(duration),
        price: Number(price),
        category,
        dates: dates.map((d) => d.toISOString().split("T")[0]),
      };

      const response = tour?.id
        ? await api.patch(`/tours/${tour.id}`, tourData)
        : await api.post("/tours", tourData);

      onSuccess(response.data.tour);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save tour. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {tour?.id ? "Edit Tour" : "Create New Tour"}
      </h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error:</p>
          <p>
            {typeof error === "object" ? JSON.stringify(error, null, 2) : error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Image URL*</label>
            <input
              type="url"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Duration (minutes)*
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Category*</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="group">Group Tour</option>
              <option value="individual">Individual Tour</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Available Dates*</label>
          <DatePicker
            selected={null}
            onChange={handleDateChange}
            minDate={new Date()}
            inline
            highlightDates={dates}
            className="w-full border rounded p-2"
          />
          <div className="mt-2">
            {dates.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-1">Selected Dates:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {dates.map((date, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{format(date, "EEE, MMM d, yyyy")}</span>
                      <button
                        type="button"
                        onClick={() => handleDateChange(date)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No dates selected</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || dates.length === 0}
            className={`px-4 py-2 text-white rounded ${
              loading || dates.length === 0
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Tour"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;
