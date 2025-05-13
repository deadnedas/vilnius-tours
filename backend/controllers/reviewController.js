const { sql } = require("../dbConnection");

const createReview = async (req, res) => {
  const { tourId, rating, comment } = req.body;
  const userId = req.user.id;
  if (!tourId || !rating || !comment) {
    return res
      .status(400)
      .json({ message: "Please provide tourId and rating and comment" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  try {
    const [tour] = await sql`SELECT id FROM "Tours" WHERE id = ${tourId}`;
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    const result = await sql`
            INSERT INTO "Reviews" (user_id, tour_id, rating, comment)
            VALUES (${userId}, ${tourId}, ${rating}, ${comment})
            RETURNING id, user_id, tour_id, rating, comment, registered_at
        `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await sql`SELECT * FROM "Reviews"`;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewsByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const reviews =
      await sql`SELECT * FROM "Reviews" WHERE tour_id = ${tourId}`;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getAllReviews, getReviewsByTourId };
