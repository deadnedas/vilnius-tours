// controllers/tourController.js
const { sql } = require("../dbConnection");

const getAllTours = async (req, res) => {
  try {
    const tours = await sql`SELECT * FROM "Tours"`;
    if (tours.length === 0) {
      return res.status(404).json({ message: "No tours found" });
    }
    res.json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res
      .status(500)
      .json({ message: "Error fetching tours", error: error.message });
  }
};

module.exports = { getAllTours };
