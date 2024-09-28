const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Topping = sequelize.define('Topping', {
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

  const MenuTopping = sequelize.define('MenuTopping', {
    menuId: {
      type: DataTypes.UUID,
      references: {
        model: 'Menu',
        key: 'id',
      },
    },
    toppingId: {
      type: DataTypes.UUID,
      references: {
        model: 'Topping',
        key: 'id',
      },
    },
  });

  Topping.associate = (models) => {
    Topping.belongsToMany(models.Menu, {
      through: 'MenuTopping',
      foreignKey: 'toppingId',
      otherKey: 'menuId',
    });
  };

  return Topping;
};


