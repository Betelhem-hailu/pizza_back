'use strict';

const { v4: uuidv4 } = require('uuid');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Toppings', [
      { id: uuidv4(), name: 'Tomato', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Mozzarella', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Basil', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Pepperoni', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Bell Peppers', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Onions', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Olives', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Toppings', null, {});
  }
};
