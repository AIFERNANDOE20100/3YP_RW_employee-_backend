const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// GET /api/menu-items?restaurantId=...
router.get("/menu-items", async (req, res) => {
  const { restaurantId } = req.query;

  console.log("restaurantId:", restaurantId);

  if (!restaurantId) {
    return res.status(400).json({ error: "Missing restaurantId parameter" });
  }

  try {
    const snapshot = await admin
      .firestore()
      .collection("menu")
      .where("restaurantId", "==", restaurantId)
      .get();
    console.log(snapshot.docs);
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
