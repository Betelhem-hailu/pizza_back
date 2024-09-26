const { Restaurant } = require('../models');

const createRestaurant = async (restaurantData, transaction) => {
    const { name, location, logo } = restaurantData;
    const restaurant = await Restaurant.create(
      { name, location, logo },
      { transaction } 
    );
    return restaurant;
  };

  module.exports = { createRestaurant };
