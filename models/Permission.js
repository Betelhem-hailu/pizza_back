// const { DataTypes } = require("sequelize");
import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  });

  // Associations
  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: 'RolePermissions',
      foreignKey: 'permissionId',
      otherKey: 'roleId',
    });
  };

  return Permission;
};
