// routes/tourRouter.js
const express = require("express");
const router = express.Router();
const { getAllTours } = require("../controllers/tourController");

router.get("/", getAllTours);
module.exports = router;
