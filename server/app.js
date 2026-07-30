const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DocFlow AI API 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DocFlow API is healthy",
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Document Routes
app.use("/api/documents", documentRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

module.exports = app;