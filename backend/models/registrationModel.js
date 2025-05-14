const { sql } = require("../dbConnection");

class Registration {
  static async create({ userId, tourDateId }) {
    const [registration] = await sql`
      INSERT INTO "TourRegistrations" (user_id, tour_date_id, status)
      VALUES (${userId}, ${tourDateId}, 'pending')
      RETURNING *
    `;
    return registration;
  }

  static async getAll() {
    return sql`
      SELECT tr.*, u.name, u.email
      FROM "TourRegistrations" tr
      JOIN "Users" u ON tr.user_id = u.id
    `;
  }

  static async getByTourId(tourId) {
    return sql`
      SELECT tr.*, u.name, u.email, td.date
      FROM "TourRegistrations" tr
      JOIN "Tour_dates" td ON tr.tour_date_id = td.id
      JOIN "Users" u ON tr.user_id = u.id
      WHERE td.tour_id = ${tourId}
    `;
  }

  static async getByUserId(userId) {
    return sql`
      SELECT tr.*, t.title, t.category, t.price, td.date
      FROM "TourRegistrations" tr
      JOIN "Tour_dates" td ON tr.tour_date_id = td.id
      JOIN "Tours" t ON td.tour_id = t.id
      WHERE tr.user_id = ${userId}
    `;
  }

  static async updateStatus(registrationId, status) {
    const [registration] = await sql`
      UPDATE "TourRegistrations"
      SET status = ${status}
      WHERE id = ${registrationId}
      RETURNING *
    `;
    return registration;
  }

  static async updateDate(registrationId, tourDateId) {
    const [registration] = await sql`
      UPDATE "TourRegistrations"
      SET tour_date_id = ${tourDateId}, status = 'pending'
      WHERE id = ${registrationId}
      RETURNING *
    `;
    return registration;
  }

  static async delete(registrationId) {
    await sql`DELETE FROM "TourRegistrations" WHERE id = ${registrationId}`;
  }

  static async getById(registrationId) {
    const [registration] = await sql`
      SELECT * FROM "TourRegistrations" WHERE id = ${registrationId}
    `;
    return registration;
  }
}

module.exports = Registration;
