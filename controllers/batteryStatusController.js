const { getLatestPayload } = require("../aws_subscriber");

// Handle getting the latest battery and performance status
exports.getBatteryStatus = (req, res) => {
  const latestPayload = getLatestPayload(); // Fetch updated values

  console.log("API Response Data:", latestPayload); // Debugging log

  if (latestPayload) {
    return res.status(200).json({
      message: "Successfully retrieved battery and performance status",
      batteryPercentage: latestPayload.batteryPercentage,
      performanceStatus: latestPayload.performanceStatus,
    });
  } else {
    return res.status(404).json({
      message: "No data available.",
    });
  }
};
