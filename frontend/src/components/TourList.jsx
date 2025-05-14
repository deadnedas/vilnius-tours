import React, { useState, useEffect, useCallback } from "react";
import api from "../../helpers/api";
import TourCard from "./TourCard";
import Modal from "./Modal";
import SearchBar from "./SearchBar";
import { format, parseISO } from "date-fns";

const TourList = ({ group }) => {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const extractAvailableDates = (toursData) => {
    const dates = [];
    toursData.forEach((tour) => {
      if (tour.dates && Array.isArray(tour.dates)) {
        tour.dates.forEach((dateObj) => {
          const dateString = dateObj.date || dateObj;
          if (dateString) {
            try {
              const parsedDate = parseISO(dateString);
              if (!isNaN(parsedDate.getTime())) {
                dates.push({ date: dateString, tourId: tour.id });
              }
            } catch (e) {
              console.warn("Invalid date format:", dateString);
            }
          }
        });
      }
    });
    return dates;
  };

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tours/all");
      setTours(res.data);
      const dates = extractAvailableDates(res.data);
      setAvailableDates(dates);
      applyGroupFilter(res.data, group);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load tours"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    async (query) => {
      setDateFilter(null);
      if (query.length >= 3) {
        setSearchLoading(true);
        try {
          const res = await api.get("/tours", { params: { name: query } });
          setFilteredTours(res.data);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setSearchLoading(false);
        }
      } else if (query.length === 0) {
        applyGroupFilter(tours, group);
      }
    },
    [group, tours]
  );

  const handleDateSelect = useCallback(
    async (dateString) => {
      setSearchLoading(true);
      try {
        if (dateString) {
          setDateFilter(dateString);
          const res = await api.get("/tours", { params: { date: dateString } });
          setFilteredTours(res.data);
        } else {
          setDateFilter(null);
          applyGroupFilter(tours, group);
        }
      } catch (err) {
        console.error("Date search error:", err);
      } finally {
        setSearchLoading(false);
      }
    },
    [group, tours]
  );

  const applyGroupFilter = (toursToFilter, groupFilter) => {
    let filtered = [...toursToFilter];
    if (groupFilter === "group") {
      filtered = filtered.filter((tour) => tour.category === "group");
    } else if (groupFilter === "individual") {
      filtered = filtered.filter((tour) => tour.category === "individual");
    }
    setFilteredTours(filtered);
  };

  const selectTour = async (tourId) => {
    try {
      const res = await api.get(`/tours/${tourId}`);
      setSelectedTour(res.data);
    } catch (err) {
      console.error("Error fetching tour details:", err);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [group]);

  if (loading) return <p className="text-center p-4">Loading tours...</p>;
  if (error)
    return <p className="text-center text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {group === "group"
          ? "Group Tours"
          : group === "individual"
          ? "Individual Tours"
          : "All Tours"}
      </h1>

      <SearchBar
        onSearch={handleSearch}
        onDateSelect={handleDateSelect}
        availableDates={availableDates}
      />

      {searchLoading ? (
        <p className="text-center text-gray-500 p-4">Searching...</p>
      ) : filteredTours.length === 0 ? (
        <p className="text-center text-gray-500 p-4">
          {dateFilter
            ? `No tours found on ${format(
                new Date(dateFilter),
                "MMMM d, yyyy"
              )}`
            : "No tours found matching your search"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {filteredTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onSelect={() => selectTour(tour.id)}
            />
          ))}
        </div>
      )}

      {selectedTour && (
        <Modal tour={selectedTour} onClose={() => setSelectedTour(null)} />
      )}
    </div>
  );
};

export default TourList;
