// aws_publisher.js
const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
    // Path to your private key
    keyPath: "./cert/path/to/private.pem.key",
    // Path to your certificate
    certPath: "./cert/path/to/pem.crt",
    caPath: "./cert/path/to/AmazonRootCA1.pem", // Root CA
    clientId: `myNodeClient-${Date.now()}`,     // Unique client ID
    host: "aws/domain"                          // AWS IoT endpoint
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
