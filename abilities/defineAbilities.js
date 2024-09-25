const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  if (!user.role) {
    // Customers can:
    can('view', 'Pizza'); // View pizza menu
    can('create', 'Order'); // Place orders
    can('view', 'Order', { userId: user.id }); // View their own orders
  } else if (user.role === 'SuperAdmin') {
    // SuperAdmin has full access
    can('manage', 'all');
  } else {
    const rolePermissions = user.roles.flatMap(role => role.permissions.map(perm => perm.name));
  // Define permissions based on rolePermissions
  if (rolePermissions.includes('See Orders')) {
    can('view', 'Order'); // Example: can view orders
  }
  if (rolePermissions.includes('Update Order Status')) {
    can('update', 'Order'); // Example: can update order status
  }
  if (rolePermissions.includes('See Customers')) {
    can('view', 'Customer'); // Example: can view customer info
  }
  if (rolePermissions.includes('Add Users')) {
    can('create', 'User'); // Example: can add users
  }
  if (rolePermissions.includes('Create Roles')) {
    can('create', 'Role'); // Example: can create roles
  }
  }
  return build();
}

module.exports = { defineAbilitiesFor };
