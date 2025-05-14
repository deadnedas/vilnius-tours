import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../helpers/api";
import TourForm from "./TourForm";

const EditTourPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await api.get(`/tours/${id}`);
        setTour(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  const handleSuccess = (updatedTour) => {
    navigate("/admin", { state: { message: "Tour updated successfully!" } });
  };

  if (loading) return <div className="text-center p-8">Loading tour...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!tour) return <div className="text-center p-8">Tour not found</div>;

  return (
    <div className="container mx-auto p-4">
      <TourForm
        tour={tour}
        onSuccess={handleSuccess}
        onCancel={() => navigate("/admin")}
      />
    </div>
  );
};

export default EditTourPage;
