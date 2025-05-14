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

router.get(
  "/tour/:tourId",
  auth("admin"),
  validateGetByTourId,
  getRegistrationsByTourId
);

router.get(
  "/user/:userId",
  auth(),
  validateGetByUserId,
  getRegistrationsByUserId
);

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

router.delete("/:registrationId", auth(), validateCancel, cancelRegistration);

module.exports = router;
