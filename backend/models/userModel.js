const { sql } = require("../dbConnection");
const bcrypt = require("bcrypt");

class User {
  static async getById(id) {
    const [user] =
      await sql`SELECT id, name, email, role FROM "Users" WHERE id = ${id}`;
    return user;
  }

  static async getByEmail(email) {
    const [user] = await sql`SELECT * FROM "Users" WHERE email = ${email}`;
    return user;
  }

  static async create({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO "Users" (name, email, passwd, role)
      VALUES (${name}, ${email}, ${passwordHash}, 'user')
      RETURNING id, name, email, role
    `;
    return user;
  }

  static async getAll() {
    return sql`SELECT id, name, email, role FROM "Users"`;
  }

  static async comparePassword(user, password) {
    return bcrypt.compare(password, user.passwd);
  }
}

module.exports = User;
