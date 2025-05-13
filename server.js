const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const expressWs = require("express-ws");
const WebSocket = require("ws");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
expressWs(app); // <-- Add WebSocket support

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

// 🧩 Add WebSocket Proxy Route for Video Stream
const RASPBERRY_PI_WS_URL = "ws://192.168.8.139:8765"; // Change to your Pi's IP and port

app.ws("/video-stream", (clientSocket, req) => {
  console.log("[*] Client connected to video stream");

  const piSocket = new WebSocket(RASPBERRY_PI_WS_URL);

  piSocket.on("open", () => {
    console.log("[+] Connected to Raspberry Pi video stream");
  });

  piSocket.on("message", (data) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(data);
    }
  });

  piSocket.on("close", () => {
    console.log("[x] Pi stream closed");
    clientSocket.close();
  });

  piSocket.on("error", (err) => {
    console.error("[!] Pi connection error:", err.message);
    clientSocket.close();
  });

  clientSocket.on("close", () => {
    console.log("[x] Frontend client disconnected");
    piSocket.close();
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
