import express from "express";
import { 
  createOrder, 
  getOrderHistory, 
  updateOrderStatus, 
  getOrdersByRestaurantId 
} from "../controller/orderController.js";
import authenticate from "../middleware/authMiddleware.js";
import checkPermissions from "../middleware/abilityMiddleWare.js";

const router = express.Router();

router.post('/placeorder', authenticate, createOrder);
router.get('/orderhistory', authenticate, getOrderHistory);
router.put('/updateorderstatus', authenticate, checkPermissions('update', 'Order'), updateOrderStatus);
router.get("/orders", authenticate, checkPermissions('read', 'Order'), getOrdersByRestaurantId);

export default router;
