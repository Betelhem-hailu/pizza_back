// const { DataTypes } = require("sequelize");
import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Menu = sequelize.define("Menu", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.NUMBER,
      allowNull: false,
      validate: {
        isDecimal: true,
        min: {
          args: [0],
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
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


  Menu.associate = (models) => {
    Menu.belongsToMany(models.Topping, {
      through: "MenuToppings",
      foreignKey: "menuId",
      otherKey: "toppingId",
    });
    Menu.belongsTo(models.Restaurant, {
      foreignKey: "restaurantId",
      as: 'restaurant',
    });
    Menu.hasMany(models.OrderItem, { 
      foreignKey: "menuId", as: "orderItems" 
    });
  };

  return Menu;
};
