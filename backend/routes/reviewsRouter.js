const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createReview,
  getAllReviews,
  getReviewsByTourId,
} = require("../controllers/reviewController");

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/tour/:tourId", getReviewsByTourId);

module.exports = router;
