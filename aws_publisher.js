// aws_publisher.js
const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
  // Path to your private key
  keyPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-private.pem.key",
  // Path to your certificate
  certPath:
    "./cert/567ac5f9b0348408455bfc91506042fe17270e042a0499705711a24c5c7a6883-certificate.pem.crt",
  caPath: "./cert/AmazonRootCA1.pem", // Root CA
  clientId: `myNodeClient-${Date.now()}`, // Unique client ID
  host: "a2cdp9hijgdiig-ats.iot.ap-southeast-2.amazonaws.com", // AWS IoT endpoint
});

// Connect to AWS IoT Core
device.on("connect", () => {
  console.log("Connected to AWS IoT Core");
});

// Function to publish to AWS IoT Core
const publishToIoT = (topic, message) => {
  device.publish(topic, JSON.stringify(message));
  console.log(`Published to AWS IoT: ${JSON.stringify(message)}`);
};

// Export the publishing function
module.exports = publishToIoT;
