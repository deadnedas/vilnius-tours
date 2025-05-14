const { body, param, validationResult } = require("express-validator");

const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    next();
  },
];

module.exports = {
  validateCreateRegistration: validate([
    body("tourDateId")
      .exists()
      .withMessage("tourDateId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("tourDateId must be a positive integer")
      .toInt(),
  ]),

  validateUpdateStatus: validate([
    param("registrationId")
      .exists()
      .withMessage("registrationId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("registrationId must be a positive integer")
      .toInt(),
    body("status")
      .exists()
      .withMessage("status is required")
      .bail()
      .isIn(["pending", "approved"])
      .withMessage("status must be 'pending' or 'approved'"),
  ]),

  validateUpdateDate: validate([
    param("registrationId")
      .exists()
      .withMessage("registrationId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("registrationId must be a positive integer")
      .toInt(),
    body("tourDateId")
      .exists()
      .withMessage("tourDateId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("tourDateId must be a positive integer")
      .toInt(),
  ]),

  validateCancel: validate([
    param("registrationId")
      .exists()
      .withMessage("registrationId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("registrationId must be a positive integer")
      .toInt(),
  ]),

  validateGetByTourId: validate([
    param("tourId")
      .exists()
      .withMessage("tourId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("tourId must be a positive integer")
      .toInt(),
  ]),

  validateGetByUserId: validate([
    param("userId")
      .exists()
      .withMessage("userId is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("userId must be a positive integer")
      .toInt(),
  ]),
};
