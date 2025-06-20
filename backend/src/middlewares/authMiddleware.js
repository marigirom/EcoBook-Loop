// middleware/authMiddleware.js
//const jwt = require('jsonwebtoken');

//module.exports = function (req, res, next) {
  //const authHeader = req.headers.authorization;

  //if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //return res.status(401).json({ message: 'No token provided' });
  //}

  //const token = authHeader.split(' ')[1];
  //try {
    //const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //req.user = decoded; // includes userId
   // next();
  //} catch (err) {
    //return res.status(401).json({ message: 'Invalid token' });
  //}
//};
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Missing Token' });
  }

  //const token = authHeader.split('')[i];
const token = req.headers.authorization?.split(' ')[1];

  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }
  catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
