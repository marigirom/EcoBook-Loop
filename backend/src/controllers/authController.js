const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const pool = require('../config/db');

const { User, Material, MaterialRequest, Notification } = require('../models');
//const MaterialRequest = require('../models/MaterialRequest');
const { Op } = require('sequelize');


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
  //const { email, password } = req.body;
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email}});

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    /*if (!passwordHash) {
      return res.status(401).json({ message: 'Wrong Password'})
    }*/
   
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

//Listin materials

//const { Material } = require('../models');

exports.createMaterial = async (req, res) => {
  try {
    console.log('req.user: ', req.user);
    const userId = req.user.userId;
    //const userId = req.user.id;  // ✅ This matches your JWT structure
    const { type, title, condition, category, location, copies } = req.body;

    if (!['book', 'recyclable'].includes(type)) {
      return res.status(400).json({ message: 'Invalid material type. Must be book or recyclable.' });
    }

    if (type === 'book' && (!title || !condition)) {
      return res.status(400).json({ message: 'Title and condition are required for books' });
    }
    if (type === 'recyclable' && (!category || !copies || copies < 1)) {
      return res.status(400).json({ message: 'Category and valid number of copies is required for recyclables' });
    }
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const newMaterial = await Material.create({
      userId,
      type,
      title: type === 'book' ? title : null,
      condition: type === 'book' ? condition : null,
      category: type === 'recyclable' ? category : null,
      location,
    });

    res.status(201).json({
      message: 'Material listed successfully',
      material: newMaterial,
    });
  } catch (error) {
    console.error('Material listing error:', error);
    res.status(500).json({ message: 'Server error while listing material' });
  }
};

//const { Material, User } = require('../models');

exports.getMaterials = async (req, res) => {
  try {
    //const  userId = req.user.userId;

    const materials = await Material.findAll({
      where: { userId: req.user.userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching materials' });
  }
};

// Create a material request
exports.createRequest = async (req, res) => {
  try {
    const { materialId, type } = req.body;
    const requesterId = req.user.userId;

    if (!materialId || !type) {
      return res.status(400).json({ message: 'Material ID and type are required.' });
    }

    const material = await Material.findByPk(materialId);

    if (!material) {
      return res.status(404).json({ message: 'Material not found.' });
    }

    // For books, ignore material.available — use request existence to determine availability
    if (type === 'book') {
      const existingRequest = await MaterialRequest.findOne({
        where: {
          materialId,
          status: { [Op.not]: 'Delivered' },
        },
      });

      if (existingRequest) {
        return res.status(400).json({ error: 'This book has already been requested.' });
      }
    }

    // For recyclables, use both available flag and request check
    if (type === 'recyclable') {
      if (!material.available) {
        return res.status(400).json({ error: 'This item is currently unavailable.' });
      }

      const existingRequest = await MaterialRequest.findOne({
        where: {
          materialId,
          status: { [Op.not]: 'Delivered' },
        },
      });

      if (existingRequest) {
        return res.status(400).json({ error: 'This item has already been requested.' });
      }

      material.available = false;
      await material.save();
    }

    // Create new request
    const newRequest = await MaterialRequest.create({
      materialId,
      requesterId,
      status: 'Pending',
      type,
    });

    // Notify donor
    await Notification.create({
      userId: material.userId,
      message: `Someone has requested your ${material.type} "${material.title || material.category}".`,
    });

    res.status(201).json({ message: 'Request created successfully.', request: newRequest });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error creating request.' });
  }
};


// View materials listed by other users (not self)
exports.getAvailableMaterials = async (req, res) => {
  try {
    const userId = req.user.userId;

    const materials = await Material.findAll({
      where: {
        userId: { [Op.ne]: userId }, // Not listed by this user
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ materials });
  } catch (error) {
    console.error('Get available materials error:', error);
    res.status(500).json({ message: 'Server error retrieving materials.' });
  }
};

// Get requests made by current user
exports.getMyBookRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await MaterialRequest.findAll({
     where: { requesterId: userId},
     include: [
      { model: Material, as: 'material', where: {type: 'book'}, required: true, },
      { model: User, as: 'requester', attributes:['id', 'name'] },
     ],
    });
    
    res.status(200).json({requests});
  } catch (error) {
    console.error('Error fetching book requests:', error);
    res.status(500).json({ message: 'Error fetching book requests.' });
  }
};


// Get requests for a user's listed materials//**to check❌❌ */
exports.getRequestsForMyMaterials = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await MaterialRequest.findAll({
      include: [
        { model: Material, as: 'material', where: { userId } },
        { model: User, as: 'requester', attributes: ['id', 'name'] },
      ],
    });
    res.status(200).json({requests});
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ message: 'Server error fetching requests.' });
  }
};


//get the papermill's recycling requests
exports.getMyRecyclableRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await MaterialRequest.findAll({
      where: {requesterId: userId},
      include: [
        { model: Material, as: 'material', where: {type: 'recyclable'} },
        { model: User, as: 'requester', attributes: ['id', 'name', 'phone', 'email'] },
      ],
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching recyclable requests:', error);
    res.status(500).json({ message: 'Server error fetching recyclable requests.' });
  }
};


// Update request status (e.g., Deliver or Mark as Received)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const request = await MaterialRequest.findByPk(requestId, {
      include: [
        { model: Material, as: 'material' },
        { model: User, as: 'requester' },
      ]
    });

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    // Send notifications based on new status
    if (status === 'In-transit') {
      // Donor has clicked "Deliver"
      await Notification.create({
        userId: request.requester.id, // recipient of the book
        message: `Your requested ${request.material.type} "${request.material.title || request.material.category}" is on the way.`,
      });
    }

    if (status === 'Initiated-delivery') {
      // Paper mill scheduled pickup for recyclables
      await Notification.create({
        userId: request.material.userId, // the donor
        message: `Pickup scheduled for your recyclable item "${request.material.category}".`,
      });
    }

    if (status === 'Delivered') {
  const itemType = request.material.type;
  
  if (itemType === 'book') {
    // Notify donor; book has been delivered
    await Notification.create({
      userId: request.material.userId,
      message: `The book "${request.material.title}" has been delivered successfully.`,
    });
  } else if (itemType === 'recyclable') {
    // Notify donor; recyclable item has been delivered
    await Notification.create({
      userId: request.material.userId,
      message: `The recyclable item "${request.material.category}" has been delivered successfully.`,
    });
  }
}


    res.status(200).json({ message: 'Status updated', request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status' });
  }
};


//get notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.findAll({
      where: {userId},
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error retrieving notifications'});
  }
};

//markAsRead
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found'});
    }

    notification.iseRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read'});
  } catch (error) {
    console.error(' Error marking as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};



