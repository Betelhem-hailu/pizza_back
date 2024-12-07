'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const dotenv = require('dotenv');

dotenv.config();

const db = {};

const env = process.env.NODE_ENV || 'development';
let sequelize;

if (process.env.USE_DATABASE_URL) {
  // If you're using a single connection string (e.g., DATABASE_URL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DATABASE_DIALECT || 'postgres',
  });
} else {
  // Using individual parameters
  sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_HOST,
      dialect: process.env.DATABASE_DIALECT || 'postgres',
    }
  );
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
