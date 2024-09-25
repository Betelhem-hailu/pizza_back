const { sequelize } = require('../models');
const { registerUser, assignRoleToUser, createRoleWithPermissions } = require('../services/userService');
const { createRestaurant } = require('../services/restaurantService');

const jwt = require('jsonwebtoken');

const registerSuperAdminWithRestaurant = async (req, res) => {
  const { restaurant, superadmin, roleId} = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Step 1: Create the restaurant
    const newRestaurant = await createRestaurant(restaurant, transaction);

    // Step 2: Register the superadmin user and associate with restaurant
    const newUser = await registerUser(
      { ...superadmin, restaurantId: newRestaurant.id },
      transaction
    );

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Step 3: Assign SuperAdmin role to the new user
    await assignRoleToUser(newUser, role.id, transaction);

    // Commit transaction if everything succeeds
    await transaction.commit();

    // Generate JWT for the superadmin
    const token = jwt.sign(
      { id: newUser.id, restaurantId: newRestaurant.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'SuperAdmin registered successfully', token });

  } catch (err) {
    // Rollback transaction if anything fails
    await transaction.rollback();
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

const registerCustomer = async (req, res) => {
  const { customer } = req.body; // No role information needed

  const transaction = await sequelize.transaction();

  try {
    // Step 1: Register the customer
    const newUser = await registerUser(customer, transaction);

    // Step 2: You might want to add any default customer-specific logic here, if needed

    // Commit transaction if everything succeeds
    await transaction.commit();

    // Generate JWT for the customer
    const token = jwt.sign(
      { id: newUser.id }, // No restaurantId needed for customers
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Customer registered successfully', token });

  } catch (err) {
    // Rollback transaction if anything fails
    await transaction.rollback();
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};


const registerAdmin = async (req, res) => {
  const { customer, roleId } = req.body; // roleId is passed from the frontend

  const transaction = await sequelize.transaction();

  try {
    // Register the customer
    const newUser = await registerUser(customer, transaction);

    // Find the role by ID or name
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Assign the retrieved role to the new user
    await assignRoleToUser(newUser, role.id, transaction); // role.id as the identifier

    // Commit transaction if everything succeeds
    await transaction.commit();

    // Generate JWT for the customer
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Customer registered successfully', token });

  } catch (err) {
    // Rollback transaction if anything fails
    await transaction.rollback();
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

const createRole = async (req, res) => {
  const { roleName, permissionIds } = req.body; // roleName and permission IDs from the frontend

  const transaction = await sequelize.transaction();

  try {
    const newRole = await createRoleWithPermissions({ name: roleName }, permissionIds, transaction);

    await transaction.commit();
    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: 'Role creation failed', details: err.message });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie("Auth", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { registerSuperAdminWithRestaurant, registerAdmin, registerCustomer, createRole, login };
