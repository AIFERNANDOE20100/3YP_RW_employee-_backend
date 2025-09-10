// aws_publisher.js
const awsIot = require("aws-iot-device-sdk");

// AWS IoT Device Configuration
const device = awsIot.device({
  // Path to your private key
  keyPath:
    "./cert_exhibit/1c0e76c62d58f716b82ae99a257860aa55b29e4aea5470b92c3eefcea8daae3b-private.pem.key",
  // Path to your certificate
  certPath:
    "./cert_exhibit/1c0e76c62d58f716b82ae99a257860aa55b29e4aea5470b92c3eefcea8daae3b-certificate.pem.crt",
  caPath: "./cert_exhibit/AmazonRootCA1.pem", // Root CA
  clientId: `myNodeClient-${Date.now()}`, // Unique client ID
  host: "a2xhp106oe6s98-ats.iot.ap-southeast-2.amazonaws.com", // AWS IoT endpoint
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
