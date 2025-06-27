// backend/src/config/db.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  timezone: '+00:00',  // Force Sequelize to store and retrieve all dates in UTC
});

module.exports = sequelize;
