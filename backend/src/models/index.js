// index.js

//const express = require('express');
//const sequelize = require('../config/db');
//const { DataTypes } = require('sequelize');

//const User = require('../models/User')(sequelize, DataTypes);
//const Material = require('../models/Material')(sequelize, DataTypes);

// Setup associations
//User.associate({ Material });
//Material.associate && Material.associate({ User });

//const app = express();
//app.use(express.json());

// your routes here...

//(async () => {
  //try {
    //await sequelize.sync({ alter: true });  // sync all models once here
    //console.log('Database synced');

    //app.listen(3000, () => console.log('Server running on port 3000'));
  //} catch (err) {
    //console.error('Error syncing database:', err);
  //}
//})();
// models/index.js
// models/index.js
// models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
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


