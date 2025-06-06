const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const pool = require('../config/db');
const User = require('../models/User');


exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

try {
  //added this for existsing users
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({message: 'User already exists'});
  }
  //TO HASH THE PASSWORD
  const passwordHash = await bcrypt.hash(password, 10);
  //save new user to the database user table
  await User.create({ name, email, phone, passwordHash });

  res.status(201).json({message: 'User registered successfully'});
}
    catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Sever error occurred during registration' })
    }
};

//the login using database
exports.login = async ( req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email }});

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
  // Generate a JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
   }
};
  
