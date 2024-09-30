const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, updateOrderStatus, getOrdersByRestaurantId } = require('../controller/orderController');
const authenticate = require('../middleware/authMiddleware');
const checkPermissions = require('../middleware/abilityMiddleWare');

router.post('/placeorder', authenticate, checkPermissions('create', 'Order'),createOrder);
router.get('/orderhistory', authenticate, checkPermissions('read', 'Order'), getOrderHistory);
router.put('/updateorderstatus', authenticate, checkPermissions('update', 'Order'), updateOrderStatus);
router.get("/getorders", authenticate, getOrdersByRestaurantId);
module.exports = router;
