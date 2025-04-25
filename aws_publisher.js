// aws_publisher.js
const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
  // Path to your private key
  keyPath:
    "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-private.pem.key",
  // Path to your certificate
  certPath:
    "./cert/d963cd1faf2a812ee9a50f1257971e394cdb03d34b49e6f9d787e81fdd2630fa-certificate.pem.crt",
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
