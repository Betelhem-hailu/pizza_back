import express from "express";
import uploadImages from "../config/multer.js";
import authenticate from "../middleware/authMiddleware.js";
import checkPermissions from "../middleware/abilityMiddleWare.js";
import { 
  registerSuperAdminWithRestaurant, 
  register, 
  registerAdmin, 
  login, 
  createRole, 
  getRoles, 
  getPermissions, 
  getUsers, 
  logout 
} from "../controller/userController.js";

const router = express.Router();

router.post("/registerSuperAdmin", uploadImages.single('image'), registerSuperAdminWithRestaurant);
router.post("/registerAdmin", authenticate, checkPermissions('create', 'User'), registerAdmin);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/createRole", authenticate, checkPermissions('create', 'Role'), createRole);
router.get("/roles", authenticate, checkPermissions('read', 'Role'), getRoles);
router.get("/permissions", authenticate, checkPermissions('read', 'Permission'), getPermissions);
router.get("/users", authenticate, checkPermissions('read', 'User'), getUsers);

export default router;
