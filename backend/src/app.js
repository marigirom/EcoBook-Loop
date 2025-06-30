
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

// Import Sequelize models
const User = require('./models/User');
const Material = require('./models/Material');
const MaterialRequest = require('./models/MaterialRequest');
const Notification = require('./models/Notification');
const Delivery = require('./models/Delivery');
const Incentive = require('./models/Incentive');

// Sync models with the database
sequelize.sync().then(() => {
  console.log('ↆ✔Database synced');
}).catch((err) => {
  console.error('Database sync failed:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Required for USSD providers (x-www-form-urlencoded)

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/inventory', require('./routes/inventory'));
app.use('/schedule', require('./routes/schedule'));
app.use('/payments', require('./routes/payments'));
app.use('/ussd', require('./routes/ussd'));
app.use('/notifications', require('./routes/notifications'));

// Root route
app.get('/', (res) => {
  res.send('EcoBook API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

