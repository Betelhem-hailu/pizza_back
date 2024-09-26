const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const {registerSuperAdminWithRestaurant, registerCustomer, registerAdmin, login, createRole } = require('../controller/userController');

router.post("/registerSuperAdmin", uploadImages.single('image'), registerSuperAdminWithRestaurant)
router.post("/registerCustomer", registerCustomer)
router.post("/registerAdmin", registerAdmin)
router.post("/login", login)
router.post("/createRole", createRole)

module.exports = router;
