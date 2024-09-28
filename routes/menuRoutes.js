const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const { createMenu, getToppings } = require("../controller/menuController");

router.post("/createMenu", uploadImages.single('image'), createMenu)
router.get("/toppings", getToppings)


module.exports = router;
