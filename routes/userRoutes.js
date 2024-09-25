const express = require('express');
const { userSchema } = require('./validation/userValidation');
const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    // Validate user input using Zod
    const validatedData = userSchema.parse(req.body);

    // Check if role exists, otherwise assign default role (Customer)
    const roleName = validatedData.role || 'Customer';
    const role = await Role.findOne({ where: { name: roleName } });

    if (!role) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Create new user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Associate role with the user
    await user.addRole(role);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
