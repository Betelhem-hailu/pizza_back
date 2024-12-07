const { DataTypes } = require("sequelize");


module.exports = (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: "orderId", as: "order" });

    OrderItem.belongsTo(models.Menu, { foreignKey: "menuId", as: "pizza" });

    OrderItem.belongsToMany(models.Topping, {
      through: "OrderItemToppings",
      foreignKey: "orderItemId",
      otherKey: "toppingId",
      as: "toppings",
    });
  };

  return OrderItem;
};
