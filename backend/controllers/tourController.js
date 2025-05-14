const Tour = require("../models/tourModel");

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.getAll();
    if (tours.length === 0) {
      return res.status(404).json({ message: "No tours found" });
    }
    res.json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res
      .status(500)
      .json({ message: "Error fetching tours", error: error.message });
  }
};

const getTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.getById(id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json(tour);
  } catch (error) {
    console.error("Error fetching tour by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to get tour", error: error.message });
  }
};

const createTour = async (req, res) => {
  const { title, img_url, duration_minutes, price, dates, category } = req.body;
  if (
    !title ||
    !img_url ||
    !duration_minutes ||
    !price ||
    !Array.isArray(dates)
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const tour = await Tour.create({
      title,
      img_url,
      duration_minutes,
      price,
      category,
      dates,
    });
    res.status(201).json({ tour });
  } catch (err) {
    console.error("Error creating tour:", err);
    res
      .status(500)
      .json({ message: "Error creating tour", error: err.message });
  }
};

const updateTour = async (req, res) => {
  const { id } = req.params;
  const { title, img_url, duration_minutes, price, category, dates } = req.body;

  try {
    const tour = await Tour.update(id, {
      title,
      img_url,
      duration_minutes,
      price,
      category,
      dates,
    });
    res.json({ tour });
  } catch (err) {
    console.error("Update tour error:", err);
    res
      .status(500)
      .json({ message: "Failed to update tour", error: err.message });
  }
};

const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Tour.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res
      .status(200)
      .json({ message: "Tour deleted successfully", tour: deleted });
  } catch (err) {
    console.error("Error deleting tour:", err);
    res
      .status(500)
      .json({ message: "Error deleting tour", error: err.message });
  }
};

const searchTours = async (req, res) => {
  const { name, date } = req.query;
  try {
    const tours = await Tour.search({ name, date });
    res.json(tours);
  } catch (err) {
    console.error("Error searching tours:", err);
    res
      .status(500)
      .json({ message: "Error searching tours", error: err.message });
  }
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  searchTours,
};
