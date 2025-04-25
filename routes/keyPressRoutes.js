const express = require("express");
const router = express.Router();
const keyPressController = require("../controllers/keyPressController");

router.post("/keypress", keyPressController.handleKeyPress);

module.exports = router;
