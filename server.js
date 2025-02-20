// server/index.js
const express = require("express");
const cors = require("cors");
const publishToIoT = require("./aws_publisher"); // Import AWS IoT publisher

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// /api/keypress endpoint
app.post("/api/keypress", (req, res) => {
  const { key } = req.body;
  console.log(`Key pressed: ${key}`);

  // Publish to AWS IoT Core
  publishToIoT("your/topic", { key });

  res.json({ status: "success", keyReceived: key });
});

// Start Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
