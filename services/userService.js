const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');

/**
 * Registers a user (SuperAdmin).
 */
export const registerUser = async (userData, transaction) => {
  const { name, email, password, restaurantId } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create(
    { name, email, password: hashedPassword, restaurantId },
    { transaction }  // Ensuring this action is part of the transaction
  );
  return user;
};

/**
 * Assigns a role (SuperAdmin) to the user.
 */
export const assignRoleToUser = async (user, roleId, transaction) => {
  await user.addRole(roleId, { transaction });
};

export const createRoleWithPermissions = async (roleData, permissionIds, transaction) => {
  // Create the role with the provided name
  const newRole = await Role.create({ name: roleData.name }, { transaction });

  // Associate selected permissions with the new role
  if (permissionIds && permissionIds.length > 0) {
    await newRole.setPermissions(permissionIds, { transaction });
  }

  return newRole;
};

