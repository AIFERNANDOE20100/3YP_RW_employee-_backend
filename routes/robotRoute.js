const express = require('express');
const { getRestaurantRobots } = require('../controllers/robotController');
const router = express.Router();

router.get('/:restaurantId/robots', getRestaurantRobots);
module.exports = router;
