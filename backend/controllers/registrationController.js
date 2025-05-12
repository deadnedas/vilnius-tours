const { sql } = require("../dbConnection");

const createRegistration = async (req, res) => {
  const { tourDateId } = req.body;
  const userId = req.user.id;
  if (!tourDateId) {
    return res.status(400).json({ message: "Please provide tourDateId" });
  }
  try {
    const [tourDate] =
      await sql`SELECT id FROM tourdates WHERE id = ${tourDateId}`;
    if (!tourDate) {
      return res.status(404).json({ message: "Tour date not found" });
    }
    const result = await sql`
            INSERT INTO tourregistrations (user_id, tour_date_id, status)
            VALUES (${userId}, ${tourDateId}, 'pending')
            RETURNING id, user_id, tour_date_id, status, registered_at
        `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await sql`SELECT * FROM tourregistrations`;
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const registrations = await sql`
            SELECT tr.*
            FROM tourregistrations tr
            JOIN tourdates td ON tr.tour_date_id = td.id
            WHERE td.tour_id = ${tourId}
        `;
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const registrations =
      await sql`SELECT * FROM tourregistrations WHERE user_id = ${userId}`;
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationsByTourId,
  getRegistrationsByUserId,
};
