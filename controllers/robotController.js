const admin = require("firebase-admin");
const publishToIoT = require('../aws_publisher');
const db = admin.firestore();

// Get all robots for a given restaurant
exports.getRestaurantRobots = async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    // Fetch robots and map only names
    const robotSnap = await db.collection("robots")
      .where("restaurantId", "==", restaurantId).get();
    const robots = robotSnap.docs.map(doc => ({ robotId: doc.id, name: doc.data().robotName }));

    res.status(200).json({ robots });
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.robotConnection = async (req, res) => {
  const { robotId, restaurantId } = req.params;
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!robotId || !restaurantId) {
    return res.status(400).json({ message: "Robot ID and Restaurant ID are required" });
  }

  try {
    // Fetch the robot document
    const robotDoc = await db.collection("robots").doc(robotId).get();

    if (!robotDoc.exists) {
      return res.status(404).json({ message: "Robot not found" });
    }

    const robotData = robotDoc.data();
    
    // Verify if robot belongs to the requested restaurant
    if (robotData.restaurantId !== restaurantId) {
      return res.status(403).json({ message: "Unauthorized: Robot does not belong to this restaurant" });
    }

    // Publish connection request to MQTT
    try {
      publishToIoT(process.env.ROBOT_CONNECT_TOPIC, {
        robotId,
        idToken,
        timestamp: new Date().toISOString()
      });

      console.log(`Connected to robot ${robotId} for restaurant ${restaurantId}`);
      res.status(200).json({ 
        message: "Connection request sent", 
        robot: { id: robotId, ...robotData }
      });
    } catch (serverError) {
      console.error("Error publishing to MQTT:", serverError);
      res.status(502).json({ message: "Failed to send connection request" });
    }
  } catch (error) {
    console.error("Error connecting to robot:", error);
    res.status(500).json({ message: "Server error" });
  }
}
