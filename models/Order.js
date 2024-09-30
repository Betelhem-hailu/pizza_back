const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Restaurants",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: "userId",
      as: "customer",
    });
    Order.belongsTo(models.Restaurant, {
      foreignKey: "restaurantId",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "orderId",
      as: "orderItems",
    });
  };

  return Order;
};
