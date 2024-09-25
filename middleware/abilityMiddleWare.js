const { defineAbilitiesFor } = require('./abilities');
const { Permission, Role } = require('../models');

const getUserRolePermissions = async (userId) => {
  const user = await User.findByPk(userId, {
    include: {
      model: Role,
      include: Permission, // Assuming Role has a many-to-many relationship with Permission
    },
  });

  return user;
};

export const abilityMiddleware = async (req, res, next) => {
  const userId = req.user.id; // Assuming you have user ID from JWT or session
  const user = await getUserRolePermissions(userId);
  
  req.ability = defineAbilitiesFor(user); // Set abilities for the user
  next();
};


