const { sql } = require("../dbConnection");

class Review {
  static async create({ userId, tourId, rating, comment }) {
    const [review] = await sql`
      INSERT INTO "Reviews" (user_id, tour_id, rating, comment)
      VALUES (${userId}, ${tourId}, ${rating}, ${comment})
      RETURNING *
    `;
    return review;
  }

  static async getAll() {
    return sql`SELECT * FROM "Reviews"`;
  }

  static async getByTourId(tourId) {
    return sql`SELECT * FROM "Reviews" WHERE tour_id = ${tourId}`;
  }

  static async exists(userId, tourId) {
    const [review] = await sql`
      SELECT id FROM "Reviews" 
      WHERE user_id = ${userId} AND tour_id = ${tourId}
    `;
    return !!review;
  }
}

module.exports = Review;
