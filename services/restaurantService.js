const { Restaurant } = require('../models');

/**
 * Creates a new restaurant entry.
 */
export const createRestaurant = async (restaurantData, transaction) => {
    const { name, location, logo } = restaurantData;
    const restaurant = await Restaurant.create(
      { name, location, logo },
      { transaction }  // Ensuring this action is part of the transaction
    );
    return restaurant;
  };