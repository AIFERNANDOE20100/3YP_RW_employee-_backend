const publishToIoT = require("../aws_publisher");

exports.handleKeyPress = (req, res) => {
  const { key } = req.body;
  console.log(`Key pressed: ${key}`);

  // Publish to AWS IoT Core
  publishToIoT("/3yp/batch2025/device1", { key });

  res.json({ status: "success", keyReceived: key });
};
