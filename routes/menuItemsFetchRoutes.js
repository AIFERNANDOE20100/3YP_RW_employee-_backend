const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuItemsFetchController");

// GET /api/menu-items?restaurantId=...
router.get("/menu-items", menuController.getMenuItems);

module.exports = router;
