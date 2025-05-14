const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { fetchUser } = require("../controllers/userController");

router.get("/me", fetchUser);

module.exports = router;
