// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require('firebase-admin'); 
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 3001;

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ===== MongoDB connection =====
const dbURI = process.env.DB_URI;
mongoose
  .connect(dbURI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Import All of Your Routes =====
const authRoutes = require("./routes/authroutes");
const collectionRoutes = require("./routes/collectionroutes");
const qualityRoutes = require("./routes/qualityroutes");
const batchRoutes = require("./routes/batchroutes");
const processingRoutes = require("./routes/processingroutes");
const reportRoutes = require("./routes/reportroutes");
const consumerRoutes = require("./routes/consumerroutes");

// ===== Use All of Your Routes =====
app.use("/auth", authRoutes);
app.use("/collections", collectionRoutes);
app.use("/quality", qualityRoutes);
app.use("/batches", batchRoutes);
app.use("/processing", processingRoutes);
app.use("/reports", reportRoutes);
app.use("/consumer", consumerRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ayurvedic Supply Chain API is running 🚀",
  });
});

// ===== Start Server =====
app.listen(port, () => {
  console.log("✅ Firebase Admin SDK initialized.");
  console.log(`🚀 Server running at http://localhost:${port}`);
});