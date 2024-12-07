// const { DataTypes } = require("sequelize");
import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Customer = sequelize.define("Customer", {
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
    },
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Order, { 
      foreignKey: "customerId", as: "orders"
     });
  };

  return Customer;
};
