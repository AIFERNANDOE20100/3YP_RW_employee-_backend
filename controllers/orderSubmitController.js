const admin = require("firebase-admin");
const authService = require("../servicers/authServicer");

const db = admin.firestore();
let orderCounter = 0;

async function getNextOrderNumber() {
  const counterRef = db.collection("meta").doc("orderCounter");
  const doc = await counterRef.get();
  if (!doc.exists) {
    await counterRef.set({ count: 1 });
    return 1;
  } else {
    const newCount = doc.data().count + 1;
    await counterRef.update({ count: newCount });
    return newCount;
  }
}

exports.submitOrder = async (req, res) => {
  try {
    console.log("Order submission request received");
    const { tableNo, restaurantId, userId, items, totalQuantity } = req.body;

    if (!tableNo || !restaurantId || !userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderNumber = await getNextOrderNumber();
    const orderData = {
      orderNumber,
      tableNo,
      restaurantId,
      userId,
      items,
      totalQuantity,
      createdAt: admin.firestore.Timestamp.now(), 
    };

    await db.collection("orders").add(orderData);

    res.status(201).json({ message: "Order submitted", orderNumber });
  } catch (err) {
    console.error("Error submitting order:", err);
    res.status(500).json({ message: "Server error" });
  }
};
