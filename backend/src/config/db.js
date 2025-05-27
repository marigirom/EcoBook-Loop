// backend/src/config/db.js
//const { Pool } = require('pg');
//require('dotenv').config();

//const pool = new Pool({
  //connectionString: process.env.DATABASE_URL,
//});

//module.exports = pool;

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;