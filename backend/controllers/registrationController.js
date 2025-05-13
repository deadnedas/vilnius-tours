const { sql } = require("../dbConnection");

const createRegistration = async (req, res) => {
  const { tourDateId } = req.body;
  const userId = req.user.id;
  if (!tourDateId) {
    return res.status(400).json({ message: "Please provide tourDateId" });
  }
  try {
    const [tourDate] =
      await sql`SELECT id FROM "Tour_dates" WHERE id = ${tourDateId}`;
    if (!tourDate) {
      return res.status(404).json({ message: "Tour date not found" });
    }
    const result = await sql`
            INSERT INTO "TourRegistrations" (user_id, tour_date_id, status)
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
    const registrations = await sql`
      SELECT tr.id, tr.user_id, tr.tour_date_id, tr.status, tr.registered_at,
             u.name, u.email
      FROM "TourRegistrations" tr
      JOIN "Users" u ON tr.user_id = u.id
    `;
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByTourId = async (req, res) => {
  const { tourId } = req.params;
  try {
    const registrations = await sql`
      SELECT tr.id, tr.user_id, tr.tour_date_id, tr.status, tr.registered_at,
             u.name, u.email, td.date
      FROM "TourRegistrations" tr
      JOIN "Tour_dates" td ON tr.tour_date_id = td.id
      JOIN "Users" u ON tr.user_id = u.id
      WHERE td.tour_id = ${tourId}
    `;
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationsByUserId = async (req, res) => {
  const { userId } = req.params;
  const requestingUserId = req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isAdmin && Number(userId) !== requestingUserId) {
    return res
      .status(403)
      .json({ message: "Forbidden: cannot access other users' registrations" });
  }

  try {
    const registrations = await sql`
      SELECT tr.id, tr.user_id, tr.tour_date_id, tr.status, tr.registered_at,
             t.title, t.category, t.price, td.date
      FROM "TourRegistrations" tr
      JOIN "Tour_dates" td ON tr.tour_date_id = td.id
      JOIN "Tours" t ON td.tour_id = t.id
      WHERE tr.user_id = ${userId}
    `;
    res.status(200).json({
      status: "success",
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  const { registrationId } = req.params;
  const { status } = req.body;

  if (!["pending", "approved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const [registration] = await sql`
      UPDATE "TourRegistrations"
      SET status = ${status}
      WHERE id = ${registrationId}
      RETURNING id, user_id, tour_date_id, status, registered_at
    `;
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.status(200).json({
      status: "success",
      data: registration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationDate = async (req, res) => {
  const { registrationId } = req.params;
  const { tourDateId } = req.body;
  const userId = req.user.id;

  if (!tourDateId) {
    return res.status(400).json({ message: "Please provide tourDateId" });
  }

  try {
    const [registration] = await sql`
      SELECT tr.user_id, tr.tour_date_id, td.tour_id
      FROM "TourRegistrations" tr
      JOIN "Tour_dates" td ON tr.tour_date_id = td.id
      WHERE tr.id = ${registrationId}
    `;
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (registration.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your registration" });
    }

    const [newTourDate] = await sql`
      SELECT id, tour_id
      FROM "Tour_dates""
      WHERE id = ${tourDateId}
    `;
    if (!newTourDate) {
      return res.status(404).json({ message: "New tour date not found" });
    }
    if (newTourDate.tour_id !== registration.tour_id) {
      return res
        .status(400)
        .json({ message: "New date must belong to the same tour" });
    }

    const [updatedRegistration] = await sql`
      UPDATE "TourRegistrations"
      SET tour_date_id = ${tourDateId}, status = 'pending'
      WHERE id = ${registrationId}
      RETURNING id, user_id, tour_date_id, status, registered_at
    `;
    res.status(200).json({
      status: "success",
      data: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  const { registrationId } = req.params;
  const userId = req.user.id;

  try {
    const [registration] = await sql`
      SELECT user_id
      FROM "TourRegistrations"
      WHERE id = ${registrationId}
    `;
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (registration.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your registration" });
    }

    await sql`
      DELETE FROM "TourRegistrations"
      WHERE id = ${registrationId}
    `;
    res.status(200).json({
      status: "success",
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationsByTourId,
  getRegistrationsByUserId,
  updateRegistrationStatus,
  updateRegistrationDate,
  cancelRegistration,
};
