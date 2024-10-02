const express = require("express");
const router = express.Router();
const  uploadImages  = require("../config/multer");
const authenticate = require("../middleware/authMiddleware");
const checkPermissions = require("../middleware/abilityMiddleWare");
const {registerSuperAdminWithRestaurant, register, registerAdmin, login, createRole, getRoles, getPermissions, getUsers } = require('../controller/userController');

router.post("/registerSuperAdmin", uploadImages.single('image'), registerSuperAdminWithRestaurant);
router.post("/registerAdmin", authenticate, checkPermissions('create', 'User'), registerAdmin);
router.post("/register", register);
router.post("/login", login);
router.post("/createRole", authenticate, checkPermissions('create', 'Role'), createRole);
router.get("/roles", authenticate, checkPermissions('read', 'Role'), getRoles);
router.get("/permissions", authenticate, checkPermissions('read', 'Permission'), getPermissions);
router.get("/users", authenticate, checkPermissions('read', 'User'), getUsers);

module.exports = router;
