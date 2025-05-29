const express = require('express');
const { getRestaurantRobots , robotConnection } = require('../controllers/robotController');
const router = express.Router();

router.get('/:restaurantId/robots', getRestaurantRobots);
// // connect request to the controller function
router.get('/:restaurantId/robots/:robotId', robotConnection);
module.exports = router;
