'use strict';
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const dotenv = require('dotenv');

dotenv.config();

const db = {};

const env = process.env.NODE_ENV || 'development';
let sequelize;

const client = new Client({
  hostname: Deno.env.get("DATABASE_HOST") || "127.0.0.1",
  user: Deno.env.get("DATABASE_USERNAME") || "postgres",
  password: Deno.env.get("DATABASE_PASSWORD"),
  database: Deno.env.get("DATABASE_NAME"),
  port: Number(Deno.env.get("DATABASE_PORT")) || 5432,
});

try {
  await client.connect();
  console.log("Connected to the database!");
}
catch (e) {
  console.log(e);
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
