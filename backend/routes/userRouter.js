const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  getUserById,
  logout,
  getCurrentUser,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/", getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
