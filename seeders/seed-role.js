'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the Super Admin role
    await queryInterface.bulkInsert('Roles', [
      {
        id: uuidv4(),
        name: 'Super Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the Super Admin role
    await queryInterface.bulkDelete('Roles', { name: 'Super Admin' }, {});
  },
};
