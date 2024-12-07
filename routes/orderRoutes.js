const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, updateOrderStatus, getOrdersByRestaurantId } = require('../controller/orderController');
const authenticate = require('../middleware/authMiddleware');
const checkPermissions = require('../middleware/abilityMiddleWare');

router.post('/placeorder', authenticate, createOrder);
router.get('/orderhistory', authenticate, getOrderHistory);
router.put('/updateorderstatus', authenticate, checkPermissions('update', 'Order'), updateOrderStatus);
router.get("/orders", authenticate, checkPermissions('read', 'Order'), getOrdersByRestaurantId);
module.exports = router;
