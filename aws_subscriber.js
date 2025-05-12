const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
  keyPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-private.pem.key",
  certPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-certificate.pem.crt",
  caPath: "./cert/AmazonRootCA1.pem",
  clientId: `myNodeSubscriber-${Date.now()}`,
  host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com",
});

// Store the latest payload
let latestPayload = { batteryPercentage: 0, performanceStatus: 0 };

// Connect to AWS IoT Core
device.on("connect", () => {
  console.log("Connected to AWS IoT Core");
  device.subscribe("/3yp/batch2025/device1");
});

// Handle incoming messages
device.on("message", (topic, payload) => {
  if (topic === "/3yp/batch2025/device1") {
    console.log(`Received message: ${payload.toString()}`);
    try {
      latestPayload = JSON.parse(payload); // Update payload globally
      console.log("Updated latestPayload:", latestPayload);
    } catch (error) {
      console.error("Failed to parse payload:", error);
    }
  }
});

// Getter function for latestPayload
const getLatestPayload = () => latestPayload;

// Export the getter function
module.exports = { getLatestPayload };
