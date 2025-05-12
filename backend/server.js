require("dotenv").config();
const server = require("./app.js");
const { testConnection, sql } = require("./dbConnection.js");

(async () => {
  try {
    await testConnection();
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  } catch (error) {
    console.log(error);
    sql.end();
    process.exit(1);
  }
})();
