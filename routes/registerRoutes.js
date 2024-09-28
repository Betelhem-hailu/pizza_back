const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const {registerSuperAdminWithRestaurant, registerCustomer, registerAdmin, login, createRole, getRoles, getPermissions, getUsers } = require('../controller/userController');

router.post("/registerSuperAdmin", uploadImages.single('image'), registerSuperAdminWithRestaurant)
router.post("/registerCustomer", registerCustomer)
router.post("/registerAdmin", registerAdmin)
router.post("/login", login)
router.post("/createRole", createRole)
router.get("/roles", getRoles)
router.get("/permissions", getPermissions)
router.get("/users", getUsers)

module.exports = router;
