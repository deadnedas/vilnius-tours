import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../../helpers/api";
import { useAuth } from "../contexts/AuthContext";
import TourForm from "./TourForm";
import RegistrationsTable from "./RegistrationsTable";
import TourCard from "./TourCard";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [tabs] = useState([
    "Tours Management",
    "All Registrations",
    "Pending Approvals",
  ]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tours, setTours] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [toursRes, registrationsRes] = await Promise.all([
          api.get("/tours/all"),
          api.get("/registrations"),
        ]);

        setTours(toursRes.data);
        setRegistrations(registrationsRes.data.data || registrationsRes.data);

        const pending = (
          registrationsRes.data.data || registrationsRes.data
        ).filter((reg) => reg.status === "pending");
        setPendingRegistrations(pending);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate, logout]);

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      await api.delete(`/tours/${tourId}`);
      setTours((prev) => prev.filter((tour) => tour.id !== tourId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex border-b mb-6">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              selectedTab === index
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {selectedTab === 0 && (
          <>
            <TourForm
              onSuccess={(newTour) => setTours((prev) => [...prev, newTour])}
            />

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">All Tours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="relative">
                    <TourCard tour={tour} />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedTab === 1 && (
          <RegistrationsTable
            registrations={registrations}
            showTourColumn={true}
          />
        )}

        {selectedTab === 2 && (
          <RegistrationsTable
            registrations={pendingRegistrations}
            onApprove={handleApproveRegistration}
            showTourColumn={true}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
