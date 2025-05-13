const express = require("express");
const auth = require("../middleware/auth");
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  searchTours,
} = require("../controllers/tourController");
const {
  validateIdParam,
  validateCreateTour,
  validateUpdateTour,
  validateSearch,
} = require("../validators/tourValidator");

const router = express.Router();

// Public:
router.get("/", validateSearch, searchTours);
router.get("/all", getAllTours);
router.get("/:id", validateIdParam, getTourById);

// Admin:
router.post("/", auth("admin"), validateCreateTour, createTour);
router.patch("/:id", auth("admin"), validateUpdateTour, updateTour);
router.delete("/:id", auth("admin"), validateIdParam, deleteTour);

module.exports = router;

// ADMIN USERS
// should be able to see all users registering to tours
// be able to see all users registering to a specific tour
// be able to confirm their tourRegistrations status from pending to approved

// as a user,i should be able to see all tours i registered to
// as a user,i should be able to edit my tour date from the specified dates.
// as a user,i should be able to cancle my tour.
