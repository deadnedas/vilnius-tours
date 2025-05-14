const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const fetchUser = async (req, res) => {
  const token = req.cookies?.jwt;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.getById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email, and password" });
  }

  try {
    const existingUser = await User.getByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password });
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    const user = await User.getByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await User.comparePassword(user, password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { passwd, ...safeUser } = user;
    res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  if (!req.cookies?.jwt)
    return res.status(400).json({ message: "You are not logged in" });
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out" });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.getById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fetchUser,
  register,
  login,
  logout,
  getAllUsers,
  getUserById,
};
