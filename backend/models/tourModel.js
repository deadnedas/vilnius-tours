const { sql } = require("../dbConnection");

const getAllTours = async () => {
  const tours = await sql`
  SELECT * FROM tours
  ORDER BY id ASC 
`;
  return tours;
};

module.exports = {
  getAllTours,
};
