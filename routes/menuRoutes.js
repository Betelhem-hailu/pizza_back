const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const { createMenu, getToppings } = require("../controller/menuController");
const authenticate = require("../middleware/authMiddleware");
const checkPermissions = require("../middleware/abilityMiddleWare");

router.post("/createMenu", authenticate, checkPermissions('create', 'Menu'), uploadImages.single('image'), createMenu);
router.get("/toppings", getToppings)


module.exports = router;
