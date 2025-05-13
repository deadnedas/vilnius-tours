// validators/tourValidator.js
const { body, param, query, validationResult } = require("express-validator");

// Shared error formatter
const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    next();
  },
];

// Ensure dates array: non-empty, unique, ISO, >= today
const datesArray = body("dates")
  .optional({ nullable: true })
  .isArray({ min: 1 })
  .withMessage("must be a non-empty array")
  .bail()
  .custom((arr) => {
    // Unique
    const set = new Set(arr);
    if (set.size !== arr.length) throw new Error("dates must be unique");
    // Valid ISO and not in the past
    const today = new Date().toISOString().slice(0, 10);
    for (const d of arr) {
      if (isNaN(Date.parse(d))) throw new Error(`${d} is not valid ISO date`);
      if (d < today) throw new Error(`${d} is before today`);
    }
    return true;
  })
  .withMessage("each date must be a unique ISO date ≥ today");

module.exports = {
  // GET /:id
  validateIdParam: validate([
    param("id")
      .exists()
      .withMessage("id is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("id must be a positive integer")
      .toInt(),
  ]),

  // POST /
  validateCreateTour: validate([
    body("title")
      .exists()
      .withMessage("title is required")
      .bail()
      .isString()
      .withMessage("must be a string")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("length must be between 3 and 100 characters"),
    body("img_url")
      .exists()
      .withMessage("img_url is required")
      .bail()
      .isURL()
      .withMessage("img_url must be a valid URL"),
    body("duration_minutes")
      .exists()
      .withMessage("duration_minutes is required")
      .bail()
      .isInt({ min: 1, max: 1440 })
      .withMessage("must be an integer between 1 and 1440")
      .toInt(),
    body("price")
      .exists()
      .withMessage("price is required")
      .bail()
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage("must be a number between 0.01 and 10000")
      .toFloat(),
    body("category")
      .exists()
      .withMessage("category is required")
      .bail()
      .isString()
      .withMessage("must be a string")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("length must be between 3 and 50 characters"),
    body("dates").exists().withMessage("dates are required"),
    datesArray,
  ]),

  // PATCH /:id
  validateUpdateTour: validate([
    param("id")
      .exists()
      .withMessage("id is required")
      .bail()
      .isInt({ gt: 0 })
      .withMessage("id must be a positive integer")
      .toInt(),
    body("title")
      .optional()
      .isString()
      .withMessage("must be a string")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("length must be between 3 and 100 characters"),
    body("img_url")
      .optional()
      .isURL({ protocols: ["https"] })
      .withMessage("must be a HTTPS URL")
      .bail()
      .withMessage("must point to a JPG/PNG/GIF image"),
    body("duration_minutes")
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage("must be an integer between 1 and 1440")
      .toInt(),
    body("price")
      .optional()
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage("must be a number between 0.01 and 10000")
      .toFloat(),
    body("category")
      .optional()
      .isString()
      .withMessage("must be a string")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("length must be between 3 and 50 characters"),
    datesArray,
  ]),

  // GET /?name=&date=
  validateSearch: validate([
    query("name")
      .optional()
      .isString()
      .withMessage("must be a string")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("length must be 1–100 chars"),
    query("date")
      .optional()
      .matches(/^\d{4}(-\d{2})?$/)
      .withMessage("must be YYYY or YYYY-MM or YYYY-MM-DD"),
  ]),
};
