// routes/orderRoutes.js
const express = require("express");
const { submitOrder } = require("../controllers/orderSubmitController");
const router = express.Router();

router.post("/orders", submitOrder);

module.exports = router;
