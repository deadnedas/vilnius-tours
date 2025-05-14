import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay, parseISO } from "date-fns";

const SearchBar = ({ onSearch, onDateSelect, availableDates = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const availableDateObjects = availableDates
    .map((d) => {
      try {
        const dateString = d.date || d;
        return dateString ? parseISO(dateString) : null;
      } catch {
        return null;
      }
    })
    .filter((date) => date !== null);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3 || query.length === 0) {
      onSearch(query);
    }
  };

  const handleDateChange = (date) => {
    if (!date) {
      setSelectedDate(null);
      onDateSelect(null);
      return;
    }

    const isAvailable = availableDateObjects.some((d) => isSameDay(d, date));
    if (isAvailable) {
      setSelectedDate(date);
      onDateSelect(format(date, "yyyy-MM-dd"));
    }
    setShowDatePicker(false);
  };

  return (
    <div className="mb-6 relative flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search by tour name..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery.length > 0 && searchQuery.length < 3 && (
          <p className="text-sm text-gray-500 mt-1">
            Type at least 3 characters to search
          </p>
        )}
      </div>

      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className={`p-3 border rounded-lg flex items-center justify-center ${
          selectedDate
            ? "bg-blue-100 border-blue-300"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {showDatePicker && (
        <div className="absolute right-0 top-12 z-10 bg-white shadow-lg rounded-lg border border-gray-200">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            inline
            filterDate={(date) =>
              availableDateObjects.some((d) => isSameDay(d, date))
            }
            calendarClassName="border-0"
            dayClassName={(date) => {
              const isAvailable = availableDateObjects.some((d) =>
                isSameDay(d, date)
              );
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return isSelected
                ? "bg-blue-600 text-white rounded-full"
                : isAvailable
                ? "text-blue-600 hover:bg-blue-100 rounded-full"
                : "text-gray-400 cursor-not-allowed";
            }}
            renderDayContents={(day, date) => (
              <div
                className={`h-8 w-8 flex items-center justify-center ${
                  availableDateObjects.some((d) => isSameDay(d, date))
                    ? "font-medium"
                    : ""
                }`}
              >
                {day}
              </div>
            )}
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
          />
          <div className="p-2 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => handleDateChange(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
