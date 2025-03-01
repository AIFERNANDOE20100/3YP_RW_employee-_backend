// server/index.js
const express = require("express");
const cors = require("cors");
const publishToIoT = require("./aws_publisher"); // Import AWS IoT publisher
const admin = require("firebase-admin");
require("dotenv").config();
const bodyParser = require("body-parser");
// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseServiceAccount.json"); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// api/keypress endpoint
app.post("/api/keypress", (req, res) => {
  const { key } = req.body;
  console.log(`Key pressed: ${key}`);

  // Publish to AWS IoT Core
  publishToIoT("/3yp/batch2025/device1", { key });

  res.json({ status: "success", keyReceived: key });
});

// Start Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
