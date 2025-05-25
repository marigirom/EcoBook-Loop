const express = require('express');
const router = express.Router();

// Example user route
router.get('/', (req, res) => {
  res.send('Ussd route works!');
});

module.exports = router;
