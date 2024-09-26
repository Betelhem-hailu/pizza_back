const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../models");
const db = require("../models");
const {
  registerUser,
  assignRoleToUser,
  createRoleWithPermissions,
} = require("../services/userService");
const { createRestaurant } = require("../services/restaurantService");
const { uploadImage } = require("../services/imageUploadService");

const registerSuperAdminWithRestaurant = async (req, res) => {
  const { adminName, email, phoneNumber, password, restaurantName, location } = req.body;

  const logo = req.file;
  const transaction = await sequelize.transaction();

  if (!req.file || req.file.length === 0) {
    return res.status(400).json({ error: "No image files uploaded" });
  }

  try {
    let logoUrl = null;
    if (logo) {
      logoUrl = await uploadImage(logo.path, "restaurant_logos");
    }
    const existingRestaurant = await db.Restaurant.findOne({ where: { name: restaurantName } });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ error: "Restaurant with this Name already exists" });
    }
    const restaurant = { name: restaurantName, location, logo: logoUrl };
    const newRestaurant = await createRestaurant(restaurant, transaction);

    const existingUser = await db.User.findOne({ where: { email: email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this Email already exists" });
    }
    const superAdmin = {name: adminName, email, phoneNumber, password};
    const newUser = await registerUser(
      { ...superAdmin, restaurantId: newRestaurant.id },
      transaction
    );

    const role = await db.Role.findOne({ name: "super Admin" });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await assignRoleToUser(newUser, role.id, transaction);

    await transaction.commit();

    res
      .status(201)
      .json({ message: "SuperAdmin registered successfully" });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
};

const registerCustomer = async (req, res) => {
  const { name, email, password, phoneNumber, roleName } = req.body;

  const customer = { name, email, password, phoneNumber };
  const transaction = await sequelize.transaction();

  try {
    const newUser = await registerUser(customer, transaction);

    await transaction.commit();

    res
      .status(201)
      .json({ message: "Customer registered successfully" });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
};

const registerAdmin = async (req, res) => {
  const { name, email, password, phoneNumber, roleName } = req.body;
  // const restaurantId = req.user.restaurantId;

  const customer = { name, email, password, phoneNumber };
  const transaction = await sequelize.transaction();

  try {
    const existingUser = await db.User.findOne({ where: { email: email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this Email already exists" });
    }
    const existingPhone = await db.User.findOne({
      where: { phoneNumber: phoneNumber },
    });
    if (existingPhone) {
      return res
        .status(400)
        .json({ error: "User with this Phone Number already exists" });
    }
    // if (!restaurantId) {
    //   return res.status(400).json({ error: "Restaurant Id is required" });
    // }
    const newUser = await registerUser(customer, transaction);
    const role = await db.Role.findOne({ Where: { name: roleName } });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await assignRoleToUser(newUser, role.id, transaction);

    await transaction.commit();

    res
      .status(201)
      .json({ message: "Customer registered successfully" });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "Registration failed", details: err.message });
  }
};

const createRole = async (req, res) => {
  const { roleName, permissionIds } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const newRole = await createRoleWithPermissions(
      { name: roleName },
      permissionIds,
      transaction
    );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Role created successfully", role: newRole });
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res
      .status(500)
      .json({ error: "Role creation failed", details: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    console.log(user.password)
    const isMatch = bcrypt.compareSync(password, user.password);
    const validPassword = bcrypt.compareSync(password, user.password);
    console.log(validPassword);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const jwtSecret = crypto.randomBytes(64).toString('hex');
    const token = jwt.sign(
      { userId: user.id, roles: user.roles, restaurantId: user.restaurantId },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  registerSuperAdminWithRestaurant,
  registerAdmin,
  registerCustomer,
  createRole,
  login,
};
