const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserCust = sequelize.define("UserCust", {
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
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  UserCust.associate = (models) => {
    UserCust.hasMany(models.Order, { 
      foreignKey: "userId", as: "order"
     });
  };

  return UserCust;
};
