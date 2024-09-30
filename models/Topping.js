const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Topping = sequelize.define("Topping", {
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
  });

  Topping.associate = (models) => {
    Topping.belongsToMany(models.Menu, {
      through: "MenuToppings",
      foreignKey: "toppingId",
      otherKey: "menuId",
    });
    Topping.belongsToMany(models.OrderItem, {
      through: "OrderItemToppings",
      foreignKey: "toppingId",
      as: "orderItems",
    });
  };

  return Topping;
};
