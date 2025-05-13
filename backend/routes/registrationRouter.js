const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createRegistration,
  getAllRegistrations,
  getRegistrationsByTourId,
  getRegistrationsByUserId,
  updateRegistrationStatus,
  updateRegistrationDate,
  cancelRegistration,
} = require("../controllers/registrationController");

const {
  validateCreateRegistration,
  validateUpdateStatus,
  validateUpdateDate,
  validateCancel,
  validateGetByTourId,
  validateGetByUserId,
} = require("../validators/registrationValidator");

router.post("/", auth(), validateCreateRegistration, createRegistration);
router.get("/", auth("admin"), getAllRegistrations);

// Route to retrieve registrations for a specific tour
router.get(
  "/tour/:tourId",
  auth("admin"),
  validateGetByTourId,
  getRegistrationsByTourId
);

// Route to retrieve registrations for a specific user
router.get(
  "/user/:userId",
  auth(),
  validateGetByUserId,
  getRegistrationsByUserId
);

// Route to update the status of a registration (e.g., from 'pending' to 'approved')
router.patch(
  "/status/:registrationId",
  auth("admin"),
  validateUpdateStatus,
  updateRegistrationStatus
);

// CHANGE
// Route to update the tour date of a registration
router.patch(
  "/date/:registrationId",
  auth(),
  validateUpdateDate,
  updateRegistrationDate
);
// Route to cancel (delete) a registration
router.delete("/:registrationId", auth(), validateCancel, cancelRegistration);

module.exports = router;
