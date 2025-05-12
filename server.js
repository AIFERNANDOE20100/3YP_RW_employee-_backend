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
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const keyPressRouter = require("./routes/keyPressRoutes");
app.use("/api", keyPressRouter);

const batteryStatusRouter = require("./routes/batteryStatusRoutes");
app.use("/api", batteryStatusRouter);

const authRouter = require("./routes/authRoute");
app.use("/api/auth", authRouter);

// menu routes
const menuRoutes = require("./routes/menuItemsFetchRoutes");
app.use("/api", menuRoutes);

const orderRoutes = require("./routes/orderSubmitRoutes");
app.use("/api", orderRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
