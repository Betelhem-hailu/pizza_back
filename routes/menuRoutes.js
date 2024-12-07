import express from "express";
import uploadImages from "../config/multer.js";
import { 
  createMenu, 
  getToppings, 
  getMenuById, 
  getAllMenus, 
  getPopularMenus, 
  getTopRestaurants 
} from "../controller/menuController.js";
import authenticate from "../middleware/authMiddleware.js";
import checkPermissions from "../middleware/abilityMiddleWare.js";

const router = express.Router();

router.post(
  "/createMenu", 
  authenticate, 
  checkPermissions('create', 'Menu'), 
  uploadImages.single('image'), 
  createMenu
);
router.get("/toppings", getToppings);
router.get("/getMenuById/:id", getMenuById);
router.get("/getAllMenus", getAllMenus);
router.get("/getPopularMenus", getPopularMenus);
router.get("/getTopRestaurants", getTopRestaurants);

export default router;
