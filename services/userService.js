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
  roleName,
  permissionIds,
  transaction
) => {
  console.log(roleName);
  try {
    const newRole = await Role.create({ name: roleName }, { transaction });
    
    if (permissionIds && permissionIds.length > 0) {
      await newRole.setPermissions(permissionIds, { transaction });
    }

    return newRole;
  } catch (error) {
    console.error('Error creating role with permissions:', error);
    throw error; // This might trigger the 500 error
  }
};

module.exports = { registerUser, assignRoleToUser, createRoleWithPermissions };
