const { User, Role } = require("../models");
const hashPassword = require("../middleware/hashPassword");

const registerUser = async (userData, transaction) => {
  const { name, email, password, phoneNumber, restaurantId } = userData;
  const hashedPassword = await hashPassword(password);

  const user = await User.create(
    { name, email, password: hashedPassword, phoneNumber, restaurantId },
    { transaction }
  );
  return user;
};

const assignRoleToUser = async (user, roleId, transaction) => {
  await user.addRole(roleId, { transaction });
};

const createRoleWithPermissions = async (
  roleData,
  permissionIds,
  transaction
) => {
  const newRole = await Role.create({ name: roleData.name }, { transaction });

  if (permissionIds && permissionIds.length > 0) {
    await newRole.setPermissions(permissionIds, { transaction });
  }

  return newRole;
};

module.exports = { registerUser, assignRoleToUser, createRoleWithPermissions };
