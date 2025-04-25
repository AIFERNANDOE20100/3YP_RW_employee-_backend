const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Import and use routes
const keyPressRouter = require("./routes/keyPressRoutes");
app.use("/api", keyPressRouter);
const batteryStatusRouter = require("./routes/batteryStatusRoutes");
app.use("/api", batteryStatusRouter);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);  // Make sure the route prefix matches


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
