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

router.get("/", validateSearch, searchTours);
router.get("/all", getAllTours);
router.get("/:id", validateIdParam, getTourById);

router.post("/", auth("admin"), validateCreateTour, createTour);
router.patch("/:id", auth("admin"), validateUpdateTour, updateTour);
router.delete("/:id", auth("admin"), validateIdParam, deleteTour);

module.exports = router;
