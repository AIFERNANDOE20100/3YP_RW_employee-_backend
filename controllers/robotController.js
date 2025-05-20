const admin = require("firebase-admin");
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
