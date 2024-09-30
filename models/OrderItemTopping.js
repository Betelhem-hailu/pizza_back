const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderItemTopping = sequelize.define(
    "OrderItemTopping",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return OrderItemTopping;
};
