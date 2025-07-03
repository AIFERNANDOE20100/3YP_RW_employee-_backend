const admin = require("firebase-admin");
const { getLatestPayload } = require("../aws_subscriber");

// Handle getting the latest battery and performance status
exports.getBatteryStatus = (req, res) => {
  const latestPayload = getLatestPayload(); // Fetch updated values

  console.log("API Response Data:", latestPayload); // Debugging log

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: "Missing or invalid authentication token" });
  }
  
  // Verify the authentication token
  try {
    admin.auth().verifyIdToken(idToken);
  } catch (authError) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }

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
