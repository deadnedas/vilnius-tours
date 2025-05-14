const { sql } = require("../dbConnection");

class Tour {
  static async getAll() {
    return sql`
      SELECT t.*, 
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS review_count
      FROM "Tours" t
      LEFT JOIN "Reviews" r ON t.id = r.tour_id
      GROUP BY t.id
    `;
  }

  static async getById(id) {
    const [tour] = await sql`SELECT * FROM "Tours" WHERE id = ${id}`;
    if (tour) {
      tour.dates = await sql`
        SELECT id, date FROM "Tour_dates" 
        WHERE tour_id = ${id}
        ORDER BY date ASC
      `;
    }
    return tour;
  }

  static async create({
    title,
    img_url,
    duration_minutes,
    price,
    category,
    dates,
  }) {
    const [tour] = await sql`
      INSERT INTO "Tours" (title, img_url, duration_minutes, price, category)
      VALUES (${title}, ${img_url}, ${duration_minutes}, ${price}, ${category})
      RETURNING *
    `;

    await Promise.all(
      dates.map(
        (d) =>
          sql`INSERT INTO "Tour_dates" (tour_id, date) VALUES (${tour.id}, ${d})`
      )
    );

    return tour;
  }

  static async update(
    id,
    { title, img_url, duration_minutes, price, category, dates }
  ) {
    await sql.begin(async (sql) => {
      const [updatedTour] = await sql`
        UPDATE "Tours"
        SET 
          title = ${title},
          img_url = ${img_url},
          duration_minutes = ${duration_minutes},
          price = ${price},
          category = ${category}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (!updatedTour) throw new Error("Tour not found");

      if (dates) {
        const newDates = dates.map((d) => new Date(d).toISOString());
        await sql`
          DELETE FROM "Tour_dates" 
          WHERE tour_id = ${id}
          AND date NOT IN ${sql(newDates)}
          AND id NOT IN (
            SELECT tour_date_id FROM "TourRegistrations" 
            WHERE tour_date_id IN (
              SELECT id FROM "Tour_dates" WHERE tour_id = ${id}
            )
          )
        `;

        const existingDates =
          await sql`SELECT date FROM "Tour_dates" WHERE tour_id = ${id}`;
        const existingDateStrings = existingDates.map((d) =>
          d.date.toISOString()
        );
        const datesToInsert = newDates.filter(
          (d) => !existingDateStrings.includes(d)
        );

        for (const date of datesToInsert) {
          await sql`INSERT INTO "Tour_dates" (tour_id, date) VALUES (${id}, ${date})`;
        }
      }

      return updatedTour;
    });

    return this.getById(id);
  }

  static async delete(id) {
    await sql`DELETE FROM "Tour_dates" WHERE tour_id = ${id}`;
    const [deleted] =
      await sql`DELETE FROM "Tours" WHERE id = ${id} RETURNING *`;
    return deleted;
  }

  static async search({ name, date }) {
    let baseText = `
      SELECT t.*, array_agg(td.date) AS dates
      FROM "Tours" AS t
      LEFT JOIN "Tour_dates" AS td ON t.id = td.tour_id
    `;
    const params = [];
    const whereClauses = [];

    if (name) {
      params.push(`%${name}%`);
      whereClauses.push(`t.title ILIKE $${params.length}`);
    }

    if (date) {
      if (/^\d{4}-\d{2}$/.test(date)) {
        params.push(`${date}-%`);
        whereClauses.push(`td.date::text LIKE $${params.length}`);
      } else {
        params.push(date);
        whereClauses.push(`td.date = $${params.length}`);
      }
    }

    if (whereClauses.length)
      baseText += `\nWHERE ${whereClauses.join(" AND ")}`;
    baseText += `\nGROUP BY t.id;`;

    return sql.unsafe(baseText, params);
  }
}

module.exports = Tour;
