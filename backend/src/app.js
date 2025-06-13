//const express = require('express');
//const cors = require('cors');
//require('dotenv').config();

//const app = express();
//app.use(cors());
//app.use(express.json());

//app.use('/auth', require('./routes/auth'));
//app.use('/inventory', require('./routes/inventory'));
//app.use('/schedule', require('./routes/schedule'));
//app.use('/mill', require('./routes/mill'));
//app.use('/payments', require('./routes/payments'));
//app.use('/ussd', require('./routes/ussd'));
//app.use('/auth', require('./routes/auth'));

//app.get('/', (req, res) => {
    //res.send('Ecobook API is up and running');
//});

//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// backend/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const User = require('./models/User');
const Material = require('./models/Material');
const MaterialRequest = require('./models/MaterialRequest');

//sync to database
sequelize.sync().then(()=> {
  console.log('Database synced');
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/inventory', require('./routes/inventory'));
app.use('/schedule', require('./routes/schedule'));
app.use('/mill', require('./routes/mill'));
app.use('/payments', require('./routes/payments'));
app.use('/ussd', require('./routes/ussd'));

// Root route
app.get('/', (req, res) => {
  res.send(' EcoBook API is up and running!');
});

// Start server
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));



