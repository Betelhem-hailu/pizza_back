const { User, Role, Customer } = require("../models");
const hashPassword = require("../middleware/hashPassword");

const registerCustomer = async (userData, transaction) => {
  const { name, email, password, phoneNumber, location } = userData;
  const hashedPassword = await hashPassword(password);

  const customer = await Customer.create(
    { name, email, password: hashedPassword, phoneNumber, location },
    { transaction }
  );
  return customer;
};

const registerUser = async (userData, transaction) => {
  const { name, email, password, phoneNumber, restaurantId, location } = userData;
  const hashedPassword = await hashPassword(password);

  const user = await User.create(
    { name, email, password: hashedPassword, phoneNumber, restaurantId, location },
    { transaction }
  );
  return user;
};

const assignRoleToUser = async (user, roleId, transaction) => {
  await user.addRole(roleId, { transaction });
};

const createRoleWithPermissions = async (
  roleName,
  restaurantId,
  permissionIds,
  transaction
) => {
  try {
    const newRole = await Role.create({ name: roleName, restaurantId }, { transaction });
    
    if (permissionIds && permissionIds.length > 0) {
      await newRole.setPermissions(permissionIds, { transaction });
    }

    return newRole;
  } catch (error) {
    console.error('Error creating role with permissions:', error);
    throw error; // This might trigger the 500 error
  }
};

module.exports = { registerUser, assignRoleToUser, createRoleWithPermissions, registerCustomer };
