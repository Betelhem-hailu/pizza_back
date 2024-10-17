const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Restaurants",
        key: "id",
      },
    },
  });

  const UserRoles = sequelize.define('UserRoles', {
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: 'Role',
        key: 'id',
      },
    },
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: 'UserRoles',
      foreignKey: 'roleId',
      otherKey: 'userId',
    });
    Role.belongsTo(models.Restaurant, {
      foreignKey: "restaurantId",
    });
    Role.belongsToMany(models.Permission, {
      through: 'RolePermissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId',
    });
  };

  return Role;
};


