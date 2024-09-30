const { AbilityBuilder, Ability } = require('@casl/ability');
const db = require('../models');

async function defineAbilitiesFor(userParam) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  const user = await db.User.findOne({
    where: { id: userParam.userId },
    include: [{ model: db.Role, include: [db.Permission] }],
  });

  if (!user) {
    throw new Error('User not found');
  }

  const roles = user.Roles;

  console.log('User Roles:', roles);
  if (roles.some(role => role.name === 'Super Admin')) {
    can('manage', 'all');
  } else {
    roles.forEach(role => {
      role.Permissions.forEach(permission => {
        switch (permission.name) {
          case 'update Order Status':
            can('update', 'Order');
            break;
          case 'see Orders':
            can('read', 'Order');
            break;
          case 'add Users':
            can('create', 'User');
            break;
          case 'see Customers':
            can('read', 'Customer');
            break;
          case 'create Roles':
            can('create', 'Role');
            break;
          default:
            break;
        }
      });
    });
  }

  return build();
}

module.exports = { defineAbilitiesFor };
