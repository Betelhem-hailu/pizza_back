'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
        { id: uuidv4(), name: 'update Order Status', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'see Orders', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'add Users', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'see Customers', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'create Roles', createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), name: 'create Menu', createdAt: new Date(), updatedAt: new Date() },
      ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  },
};
