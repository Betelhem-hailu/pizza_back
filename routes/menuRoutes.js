const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const { createMenu, getToppings, getMenuById, getAllMenus, getPopularMenus, getTopRestaurants } = require("../controller/menuController");
const authenticate = require("../middleware/authMiddleware");
const checkPermissions = require("../middleware/abilityMiddleWare");

router.post("/createMenu", authenticate, checkPermissions('create', 'Menu'), uploadImages.single('image'), createMenu);
router.get("/toppings", getToppings);
router.get("/getMenuById/:id",authenticate, getMenuById);
router.get("/getAllMenus", getAllMenus);
router.get("/getPopularMenus", getPopularMenus);
router.get("/getTopRestaurants", getTopRestaurants);


module.exports = router;
