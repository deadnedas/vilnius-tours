// controllers/userController.js
const { sql } = require("../dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email, and password" });
  }

  try {
    const [existingUser] =
      await sql`SELECT * FROM "Users" WHERE email = ${email}`;
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await sql`
      INSERT INTO "Users" (name, email, passwd, role)
      VALUES (${name}, ${email}, ${passwordHash}, 'user')
      RETURNING id, name, email, role
    `;

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  if (req.cookies?.jwt) {
    return res.status(400).json({ message: "You are already logged in" });
  }

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

    const isMatch = await bcrypt.compare(password, user.passwd);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    );

    // Set HttpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const { passwd, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout user
const logout = (req, res) => {
  if (!req.cookies?.jwt) {
    return res.status(400).json({ message: "You are not logged in" });
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out" });
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await sql`SELECT id, name, email, role FROM "Users"`;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [user] = await sql`
      SELECT id, name, email, role FROM "Users" WHERE id = ${id}
    `;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getAllUsers,
  getUserById,
};
