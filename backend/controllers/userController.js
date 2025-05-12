// controllers/userController.js
const { sql } = require("../dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email, and password" });
  }
  try {
    const [user] = await sql`SELECT * FROM "Users" WHERE email = ${email}`;
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const result = await sql`
            INSERT INTO "Users" (name, email, passwd, role)
            VALUES (${name}, ${email}, ${passwordHash}, 'user')
            RETURNING id, name, email, role
        `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const [user] = await sql`SELECT * FROM "Users" WHERE email = ${email}`;
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.passwd);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await sql`SELECT id, name, email, role FROM "Users"`;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] =
      await sql`SELECT id, name, email, role FROM "Users" WHERE id = ${id}`;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getAllUsers, getUserById };
