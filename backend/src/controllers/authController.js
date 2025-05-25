const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

let users = []; // temporary in-memory storage

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  //added this for existsing users
  const exists = users.find(u => u.email === email);
  if(exists) return res.status(400).json({message: 'user already exists'});

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email, phone, passwordHash };
  users.push(user);

  //const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  //res.json({ token });

  //testing register
  res.status(201).json({message: 'User registered successfully'});
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token });
};
