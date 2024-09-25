const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restaurantId: { 
      type: DataTypes.UUID, 
      allowNull: true }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });

  // Associations
  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: 'UserRoles',
      foreignKey: 'userId',
      otherKey: 'roleId',
    });
    User.belongsTo(models.Restaurant, {
       foreignKey: 'restaurantId' 
      });
  };

  return User;
};