const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../models");
const db = require("../models");
const {
  registerUser,
  registerCustomer,
  assignRoleToUser,
  createRoleWithPermissions,
} = require("../services/userService");
const { createRestaurant } = require("../services/restaurantService");
const { uploadImage } = require("../services/imageUploadService");
const { Op } = require("sequelize");



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

    const role = await db.Role.findOne({ name: "Super Admin" });
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

const register = async (req, res) => {
  const { name, email, password, phoneNumber, location } = req.body;

  const customer = { name, email, password, phoneNumber, location };
  const transaction = await sequelize.transaction();

  try {
    const newUser = await registerCustomer(customer, transaction);

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
  const restaurantId = req.user.restaurantId;
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
    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant Id is required" });
    }

    const customer = { name, email, password, phoneNumber, restaurantId };

    const newUser = await registerUser(customer, transaction);
    const role = await db.Role.findOne({ where: { name: roleName } });


    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await assignRoleToUser(newUser, role.id, transaction);

    await transaction.commit();

    res
      .status(201)
      .json({ message: "User registered successfully" });
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
  const restaurantId = req.user.restaurantId;

  const transaction = await sequelize.transaction();

  try {
    const newRole = await createRoleWithPermissions(
      roleName,
      restaurantId,
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
    let user;
    let roles = [];
    let permissions = [];

    const adminEmailPattern = /.+\.admin@gmail\.com$/;

    if (adminEmailPattern.test(email)) {
     user = await db.User.findOne({
      where: { email },
      include: [{
        model: db.Role,
        through: { attributes: [] },
        include: [{
          model: db.Permission,
          through: { attributes: [] }
        }]
      }]
    });

    if (user && user.Roles) {
      roles = user.Roles.map(role => role.name); // Get role names

      // Get all permissions associated with the user's roles
      user.Roles.forEach(role => {
        permissions.push(...role.Permissions.map(permission => permission.name));
      });
    }

    if (user && user.Roles) {
      roles = user.Roles.map(role => role.name);
    }

  } else {
    user = await db.Customer.findOne({ where: { email } });
  }
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });


    const token = jwt.sign(
      { userId: user.id, roles, permissions, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    data = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      roles,
      permissions
    }

    res.status(200).json({ message: "Logged in successfully", data });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getRoles = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { searchTerm } = req.query;
  try {
    const whereClause = {
      restaurantId,
    };

   
    if (searchTerm) {
      whereClause.name = {
        [Op.iLike]: `%${searchTerm}%`, 
      };
    }

    const roles = await db.Role.findAll({
      where: whereClause,
    });

    if (!roles || roles.length === 0) {
      return res.status(404).json({ message: 'No roles found matching the search criteria.' });
    }

    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: "Server error" });
  }
}

const getPermissions = async (req, res) => {
  try {
    const permissions = await db.Permission.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

const getUsers = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { searchTerm, roleName } = req.query;

  try {
    const whereClause = {
      restaurantId
    };
    if (searchTerm) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    const roleInclude = {
      model: db.Role,
      as: 'Roles', 
      through: { attributes: [] }, 
      required: !!roleName, 
      where: roleName ? { name: { [Op.iLike]: `%${roleName}%` } } : null,
    };

    const users = await db.User.findAll({
      where: whereClause,
      include: [roleInclude],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found matching the search criteria." });
    }

    res.status(200).json(users );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt",  {
    httpOnly: true,      
    secure: false,    
    sameSite: 'Lax',
    path: '/'          
});
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  registerSuperAdminWithRestaurant,
  registerAdmin,
  register,
  createRole,
  login,
  getRoles,
  getPermissions,
  getUsers,
  logout
};
