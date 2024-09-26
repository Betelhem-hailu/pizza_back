const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING }  // Path or URL to the logo image
  });

  Restaurant.associate = (models) => {
    Restaurant.hasMany(models.User, { foreignKey: 'restaurantId' });
  };

  return Restaurant;
};
