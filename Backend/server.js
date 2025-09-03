const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// ===== Middleware =====
app.use(express.json());

// ===== MongoDB connection =====
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===== Import Routes =====
const authRoutes = require("./routes/authroutes");
const collectionRoutes = require("./routes/collectionroutes");
const qualityRoutes = require("./routes/qualityroutes");
const batchRoutes = require("./routes/batchroutes");
const processingRoutes = require("./routes/processingroutes");
const reportRoutes = require("./routes/reportroutes");
const consumerRoutes = require("./routes/consumerroutes");

app.use("/auth", authRoutes);
app.use("/collections", collectionRoutes);
app.use("/quality", qualityRoutes);
app.use("/batches", batchRoutes);
app.use("/processing", processingRoutes);
app.use("/reports", reportRoutes);
app.use("/consumer", consumerRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ success: true, message: "Ayurvedic Supply Chain API is running 🚀" });
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
