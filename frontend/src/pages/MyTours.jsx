import React, { useState, useEffect } from "react";
import api from "../../helpers/api";

import { useAuth } from "../contexts/AuthContext";

const MyTours = () => {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchRegistrations();
    }
  }, [currentUser]);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get(`/registrations/user/${currentUser.id}`);
      setRegistrations(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      try {
        await api.delete(`/registrations/${registrationId}`);
        setRegistrations(registrations.filter((r) => r.id !== registrationId));
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel registration");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center">
        <p>Please login to view your tours.</p>
      </div>
    );
  }

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-4">{error}</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Registered Tours</h1>
      {registrations.length === 0 ? (
        <p>You haven't registered for any tours yet.</p>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{reg.title}</h3>
                  <p className="text-gray-600">
                    Date: {new Date(reg.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Status: {reg.status}</p>
                </div>
                <button
                  onClick={() => handleCancel(reg.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTours;
