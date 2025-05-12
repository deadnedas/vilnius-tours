// routes/registrations.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createRegistration,
  getAllRegistrations,
  getRegistrationsByTourId,
  getRegistrationsByUserId,
} = require("../controllers/registrationController");

router.post("/", auth, createRegistration);
router.get("/", getAllRegistrations);
router.get("/tour/:tourId", getRegistrationsByTourId);
router.get("/user/:userId", getRegistrationsByUserId);

module.exports = router;
