const express = require("express");
const auth = require("../middleware/auth"); // adjust the path if needed
const { sql } = require("../dbConnection");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const [user] =
      await sql`SELECT id, email FROM "Users" WHERE id = ${req.user.id}`;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
