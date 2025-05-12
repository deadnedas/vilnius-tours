const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const AppError = require("./utils/appError");
const handleError = require("./utils/handleError");
const app = express();

const tourRoutes = require("./routes/tourRouter");
const userRoutes = require("./routes/userRouter");
const registrationRoutes = require("./routes/registrationRouter");
const reviewsRoutes = require("./routes/reviewsRouter");
const authRoutes = require("./routes/authRouter"); // adjust path

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/registrations", registrationRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/auth", authRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(handleError);

module.exports = app;
