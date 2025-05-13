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

// Get a specific tour by ID
const getTourById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get tour basic info
    const tourResult = await sql`
      SELECT * FROM "Tours"
      WHERE id = ${id}
    `;

    if (tourResult.length === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const tour = tourResult[0];

    // Get associated tour dates
    const dates = await sql`
      SELECT date FROM "Tour_dates"
      WHERE tour_id = ${id}
      ORDER BY date ASC
    `;

    tour.dates = dates.map((row) => row.date);

    res.json(tour);
  } catch (error) {
    console.error("Error fetching tour by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to get tour", error: error.message });
  }
};

// Create a new tour

const createTour = async (req, res) => {
  const { title, img_url, duration_minutes, price, dates, category } = req.body;
  if (
    !title ||
    !img_url ||
    !duration_minutes ||
    !price ||
    !Array.isArray(dates)
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Note: backtick right before INSERT, no newline/indent!
    const [tour] = await sql`INSERT INTO "Tours"
    ("title","img_url","duration_minutes","price","category")
    VALUES (${title},${img_url},${duration_minutes},${price},${category})
    RETURNING *;`;

    const tourId = tour.id;

    // Insert dates one by one
    await Promise.all(
      dates.map(
        (d) =>
          // similarly, no leading newline/indent on the template
          sql`INSERT INTO "Tour_dates" ("tour_id", "date")
            VALUES (${tourId}, ${d});`
      )
    );

    res.status(201).json({ tour });
  } catch (err) {
    console.error("Error creating tour:", err);
    res
      .status(500)
      .json({ message: "Error creating tour", error: err.message });
  }
};

// Update existing tour
const updateTour = async (req, res) => {
  const { id } = req.params;
  const { title, img_url, duration_minutes, price, category, dates } = req.body;

  try {
    // 1. Collect only the fields the client sent
    const sets = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      sets.push(`"title" = $${idx++}`);
      values.push(title);
    }
    if (img_url !== undefined) {
      sets.push(`"img_url" = $${idx++}`);
      values.push(img_url);
    }
    if (duration_minutes !== undefined) {
      sets.push(`"duration_minutes" = $${idx++}`);
      values.push(duration_minutes);
    }
    if (price !== undefined) {
      sets.push(`"price" = $${idx++}`);
      values.push(price);
    }
    if (category !== undefined) {
      sets.push(`"category" = $${idx++}`);
      values.push(category);
    }

    // If nothing to update on Tours row
    if (sets.length === 0 && dates === undefined) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }

    // 2. Run the UPDATE for the Tours table
    let updated;
    if (sets.length > 0) {
      const text = `
        UPDATE "Tours"
        SET ${sets.join(", ")}
        WHERE id = $${idx}
        RETURNING *;
      `;
      values.push(id);
      [updated] = await sql.unsafe(text, values);
      if (!updated) {
        return res.status(404).json({ message: "Tour not found" });
      }
    }

    // 3. Handle dates if provided
    if (Array.isArray(dates)) {
      // You could validate dates here before executing...
      await sql`
        DELETE FROM "Tour_dates"
        WHERE tour_id = ${id};
      `;
      await Promise.all(
        dates.map(
          (d) =>
            sql`
            INSERT INTO "Tour_dates" (tour_id, date)
            VALUES (${id}, ${d});
          `
        )
      );
    }

    // 4. Fetch fresh record (with aggregated dates)
    const [fresh] = await sql`
      SELECT t.*, array_agg(td.date) AS dates
      FROM "Tours" AS t
      LEFT JOIN "Tour_dates" AS td
        ON t.id = td.tour_id
      WHERE t.id = ${id}
      GROUP BY t.id;
    `;

    res.json({ tour: fresh });
  } catch (err) {
    console.error("Error updating tour:", err);
    res
      .status(500)
      .json({ message: "Error updating tour", error: err.message });
  }
};
// Delete a tour
const deleteTour = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Remove child tour dates first
    await sql`
      DELETE FROM "Tour_dates"
      WHERE tour_id = ${id};
    `;

    // 2. Now delete the tour
    const deleted = await sql`
      DELETE FROM "Tours"
      WHERE id = ${id}
      RETURNING *;
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // 3. Return a confirmation message
    return res
      .status(200)
      .json({ message: "Tour deleted successfully", tour: deleted[0] });
  } catch (err) {
    console.error("Error deleting tour:", err);
    return res
      .status(500)
      .json({ message: "Error deleting tour", error: err.message });
  }
};

// Search tours by name and/or date
const searchTours = async (req, res) => {
  const { name, date } = req.query;

  try {
    // 1. Build the static SELECT + GROUP BY
    let baseText = `
      SELECT t.*, array_agg(td.date) AS dates
      FROM "Tours" AS t
      LEFT JOIN "Tour_dates" AS td
        ON t.id = td.tour_id
    `;
    const params = [];
    const whereClauses = [];

    // 2. Title filter
    if (name) {
      params.push(`%${name}%`);
      whereClauses.push(`t.title ILIKE $${params.length}`);
    }

    // 3. Date filter: YYYY-MM or YYYY-MM-DD
    if (date) {
      // match YYYY-MM (month filter)
      if (/^\d{4}-\d{2}$/.test(date)) {
        // use text‐prefix match on the ISO date
        params.push(`${date}-%`);
        whereClauses.push(`td.date::text LIKE $${params.length}`);
      } else {
        // exact date match
        params.push(date);
        whereClauses.push(`td.date = $${params.length}`);
      }
    }

    // 4. Assemble WHERE and GROUP BY
    if (whereClauses.length) {
      baseText += `\nWHERE ${whereClauses.join(" AND ")}`;
    }
    baseText += `\nGROUP BY t.id;`;

    // 5. Execute as a tagged unsafe query
    const tours = await sql.unsafe(baseText, params);

    res.json(tours);
  } catch (err) {
    console.error("Error searching tours:", err);
    res
      .status(500)
      .json({ message: "Error searching tours", error: err.message });
  }
};

module.exports = { searchTours };
module.exports = { searchTours };

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  searchTours,
};
