const express = require('express');
const router = express.Router();

// Example mill route
router.get('/', (req, res) => {
  res.send('Mill route works!');
});

module.exports = router;
