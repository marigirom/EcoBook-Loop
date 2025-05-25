// routes/inventory.js

const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.send('Schedule route works!');
});

module.exports = router; // ✅ must export the router
