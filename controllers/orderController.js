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
    const { tableNo, restaurantId, userId, items, totalQuantity, robotId } = req.body;

    if (
      !tableNo ||
      !restaurantId ||
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !robotId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderNumber = await getNextOrderNumber();
    const orderData = {
      orderNumber,
      tableNo,
      restaurantId,
      userId,
      robotId,
      items,
      totalQuantity,
      status: "active",
      createdAt: admin.firestore.Timestamp.now(), 
    };

    await db.collection("orders").add(orderData);

    res.status(201).json({ message: "Order submitted", orderNumber });
  } catch (err) {
    console.error("Error submitting order:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrders = async (req, res) => {
  const { restaurantId, robotId } = req.query;

  if (!restaurantId || !robotId) {
    return res.status(400).json({ error: "Missing restaurantId or robotId" });
  }

  try {
    const snapshot = await db
      .collection("orders")
      .where("restaurantId", "==", restaurantId)
      .where("robotId", "==", robotId)
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        OrderId: doc.id,
        tableNo: data.tableNo,
        orderNumber: data.orderNumber,
        items: data.items || [],
        createdAt: data.createdAt?.toDate() || null,
      };
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.markOrderCompleted = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  try {
    await db.collection("orders").doc(orderId).update({
      status: "completed",
    });

    res.status(200).json({ message: "Order marked as completed" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

