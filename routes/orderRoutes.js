// routes/orderRoutes.js
const express = require("express");
const { submitOrder, getOrders, markOrderCompleted } = require("../controllers/orderController");
const router = express.Router();

router.post("/orders/submitOrders", submitOrder);
router.get("/orders/getOrders", getOrders);
router.patch("/orders/markCompleted/:orderId", markOrderCompleted);

module.exports = router;
