const express = require("express");
const router = express.Router();
const batteryStatusController = require("../controllers/batteryStatusController");

// Route to get battery and performance status
router.get("/batteryStatus", batteryStatusController.getBatteryStatus);

module.exports = router;
