const Review = require("../models/reviewModel");

const createReview = async (req, res) => {
  const { tourId, rating, comment } = req.body;
  if (!req.user?.id)
    return res.status(401).json({ message: "Unauthorized - Please log in" });

  if (!tourId || !rating || !comment) {
    return res
      .status(400)
      .json({ message: "Please provide tourId, rating, and comment" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const alreadyReviewed = await Review.exists(req.user.id, tourId);
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You've already reviewed this tour" });
    }

    const review = await Review.create({
      userId: req.user.id,
      tourId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAll();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const reviews = await Review.getByTourId(tourId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByTourId,
};
