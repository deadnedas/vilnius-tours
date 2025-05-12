const postgres = require("postgres");

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: process.env.DB_SSL,
});

const testConnection = async () => {
  try {
    await sql`SELECT 1 + 1 AS result`;
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection error");
    throw error;
  }
};

module.exports = { sql, testConnection };
