const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { User, Material, MaterialRequest, Notification, Schedule, BonusPayment } = require('../models');
const mpesaService = require('../services/mpesaService');
const transporter = require('../utils/mailer');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');  
const { request } = require('express');


exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

try {
  //for existsing users
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({message: 'User already exists'});
  }
  //HASH THE PASSWORD
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
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

//frogot password
// 1. Send OTP to user's email
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    console.log('----- OTP GENERATION DEBUG -----');
    console.log('Current UTC Time:', new Date().toISOString());
    console.log('Generated Expiry UTC:', expiry.toISOString());
    console.log('--------------------------------');

    await user.update({ otp, otpExpiresAt: expiry });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'EcoBook Password Reset OTP',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: 'OTP sent to your email' });

  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


// 2. Reset password using OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log('Request Body:', req.body);

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Logs for clarity
    const now = new Date();
    console.log('----- TIME DEBUG -----');
    console.log('Current UTC Time:', now.toISOString());
    console.log('Current Local Time:', now.toLocaleString());
    console.log('Stored OTP:', user.otp);
    console.log('Provided OTP:', otp);
    console.log('OTP Expiry UTC:', user.otpExpiresAt.toISOString());
    console.log('OTP Expiry Local:', user.otpExpiresAt.toLocaleString());
    console.log('----------------------');

    if (String(user.otp) !== String(otp) || now > user.otpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({
      passwordHash: hashed,
      otp: null,
      otpExpiresAt: null,
    });

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

//get profile

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};


//Listin materials

exports.createMaterial = async (req, res) => {
  try {
    const userId = req.user.userId;
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
      copies: type === 'recyclable' ? copies : null,   // copies are saved for recyclables
      location,
      available: true
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


exports.getMaterials = async (req, res) => {
  try {

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

    // For books; request existence to determine availability
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

    // For recyclables; both available flag and request check
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

    // Fetch requester details
    const requester = await User.findByPk(requesterId);

    if (!requester) {
      return res.status(404).json({ message: 'Requester not found.' });
    }

    // Create new request
    const newRequest = await MaterialRequest.create({
      materialId,
      requesterId,
      status: 'Pending',
      type,
    });

    // Notify donor with requester's name and location
    await Notification.create({
      userId: material.userId,
      message: `${requester.name} from ${material.location} has requested your ${material.type} "${material.title || material.category}".`,
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


// Get requests for a user's listed materials /
exports.getRequestsForMyMaterials = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await MaterialRequest.findAll({
      include: [
        { model: Material, as: 'material', where: { userId } },
        { model: User, as: 'requester', attributes: ['id', 'name', 'phone', 'email'] },
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

//delivered recyclables

exports.getDeliveredRecyclableRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.findAll({
      where: { requesterId: req.user.userId, status: 'Delivered' },
      include: [
        {
          model: Material,
          as: 'material',
          where: { type: 'recyclable' },
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] }
          ],
        },
      ],
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching delivered recyclable requests:', error);
    res.status(500).json({ message: 'Server error fetching delivered recyclable requests.' });
  }
};


// Update request status examples; Deliver or Mark as Received
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
//scheduling for pickups done by papermill user
exports.createSchedule = async (req, res) => {
  try {
    const { requestId, scheduledDate, pickupLocation } = req.body;

    // Create the schedule
    const schedule = await Schedule.create({
      requestId,
      scheduledDate,
      pickupLocation,
    });

    // Update request status
    await MaterialRequest.update(
      { status: 'Initiated-delivery' },
      { where: { id: requestId } }
    );

    // Get donor ID
    const request = await MaterialRequest.findByPk(requestId, {
      include: [{ model: Material, as: 'material' }],
    });

    const userId = request.material.userId;

    // Notify donor
    await Notification.create({
      userId: request.material.userId,
      message: `Pickup scheduled for your recyclable item "${request.material.title || request.material.category}" on ${scheduledDate}.`,
    });

    res.status(201).json({ schedule });
  } catch (err) {
    console.error('Error scheduling pickup:', err);
    res.status(500).json({ message: 'Server error scheduling pickup.' });
  }
};

//bonus payment to  the donor  listed the item

exports.processBonusPayment = async (req, res) => {
  const { userId, materialId, amount } = req.body;

  if (!userId || !materialId || !amount || isNaN(parseInt(amount, 10))) {
    return res.status(400).json({ message: 'Invalid payment request. Check all fields.' });
  }

  try {
    const donor = await User.findByPk(userId);
    if (!donor) return res.status(404).json({ message: 'Donor not found.' });

    const material = await Material.findByPk(materialId, {
      include: [{ model: User, as: 'user' }]
    });
    if (!material) return res.status(404).json({ message: 'Material not found.' });

    const materialRequest = await MaterialRequest.findOne({
      where: { materialId },
      include: [{ model: User, as: 'requester' }]
    });
    if (!materialRequest) return res.status(404).json({ message: 'Material request not found.' });

    //  Check if bonus already paid
    if (materialRequest.paid) {
      return res.status(400).json({ message: 'Bonus has already been paid for this request.' });
    }

    //  Simulate STK Push
    const paymentResult = await mpesaService.initiateSTKPush(donor.phone, amount);
    if (!paymentResult.success) {
      return res.status(400).json({ message: 'M-Pesa STK Push failed.' });
    }

    // Record Payment and mark request as paid
    await BonusPayment.create({
      userId,
      materialId,
      materialRequestId: materialRequest.id, // Link payment to specific request
      type: 'Reward-payment',
      amount,
      method: 'M-Pesa',
      status: 'Completed',
    });

    await MaterialRequest.update(
  { paid: true },
  { where: { id: materialRequest.id } }
);

    // Send Notifications
    await Notification.create({
      userId: materialRequest.requester.id,
      message: `Bonus payment of Ksh ${amount} has been made to ${donor.name} for the recyclable item (${material.category}).`
    });

    await Notification.create({
      userId: donor.id,
      message: `Bonus of Ksh ${amount} has been credited for your materials picked up on ${new Date().toLocaleDateString()}.`
    });

    res.status(200).json({ message: 'STK Push initiated. Bonus marked as paid. Notifications sent.' });

  } catch (err) {
    console.error('Error processing bonus payment:', err);
    res.status(500).json({ message: 'Server error processing bonus payment.' });
  }
};


exports.handleSTKCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('STK Push Callback Received:', JSON.stringify(callbackData, null, 2));

    const resultCode = callbackData?.Body?.stkCallback?.ResultCode;
    const metadata = callbackData?.Body?.stkCallback?.CallbackMetadata;

    if (resultCode === 0 && metadata) {
      const amount = metadata.Item.find(i => i.Name === 'Amount')?.Value;
      const phone = metadata.Item.find(i => i.Name === 'PhoneNumber')?.Value;

      const user = await User.findOne({ where: { phone } });
      if (!user) return res.status(200).json({ message: 'Callback processed, user unknown.' });

      const bonus = await BonusPayment.findOne({
        where: {
          userId: user.id,
          amount,
          status: 'Pending',
        },
        order: [['createdAt', 'DESC']],
      });

      if (bonus) {
        bonus.status = 'Completed';
        await bonus.save();
      }
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (err) {
    console.error('Error handling STK Push callback:', err);
    res.status(500).json({ message: 'Server error processing callback' });
  }
};

exports.getEcoPayRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.findAll({
      where: {
        requesterId: req.user.userId,
        status: 'Delivered'
      },
      include: [
        {
          model: Material,
          as: 'material',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching EcoPay requests:', err);
    res.status(500).json({ message: 'Failed to fetch EcoPay requests' });
  }
};


//ussd handler

exports.handleUSSD = async (req, res) => {
  const { text, phoneNumber } = req.body;
  const inputs = text.split('*');
  let response = '';

  const LOCATIONS = ['Kisumu', 'Mombasa', 'Nairobi', 'Eldoret'];

  let user = await User.findOne({ where: { phone: phoneNumber } });

  // Registration for unregistered users
  if (!user) {
    if (inputs.length === 1) {
      response = 'CON Welcome to EcoBook. Enter your name:';
    } else if (inputs.length === 2) {
      await User.create({
        name: inputs[1],
        phone: phoneNumber,
        email: `${phoneNumber}@ecobook.ussd`,
        passwordHash: 'ussdplaceholder'
      });
      response = 'END Registration complete. Dial again to use EcoBook.';
    }

  } else {
    // Main Menu
    if (inputs[0] === '') {
      response = `CON Welcome to EcoBook
1. Donate Book
2. Request Book
0. Exit`;

    // Book Donation Flow with Location Prompt
    } else if (inputs[0] === '1') {
      if (inputs.length === 1) {
        response = 'CON Enter book title:';
      } else if (inputs.length === 2) {
        response = 'CON Enter book condition (new, fairly used, old):';
      } else if (inputs.length === 3) {
        let locList = '';
        LOCATIONS.forEach((loc, idx) => {
          locList += `${idx + 1}. ${loc}\n`;
        });
        response = `CON Select location:\n${locList}`;
      } else if (inputs.length === 4) {
        const locIndex = parseInt(inputs[3], 10) - 1;

        if (locIndex < 0 || locIndex >= LOCATIONS.length) {
          response = 'END Invalid location selected.';
        } else {
          await Material.create({
            title: inputs[1],
            condition: inputs[2],
            type: 'book',
            available: true,
            userId: user.id,
            location: LOCATIONS[locIndex]
          });
          response = 'END Book donation successful. Thank you!';
        }
      }

    // Book Request Flow with Notification to Donor
    } else if (inputs[0] === '2') {
      if (inputs.length === 1) {
        const books = await Material.findAll({ where: { type: 'book', available: true } });

        if (books.length === 0) {
          response = 'END No available books at the moment.';
        } else {
          let bookList = '';
          books.forEach((book, index) => {
            bookList += `${index + 1}. ${book.title} (${book.location})\n`;
          });
          response = `CON Select book to request:\n${bookList}`;
        }
      } else if (inputs.length === 2) {
        const selectedIndex = parseInt(inputs[1], 10) - 1;
        const books = await Material.findAll({ where: { type: 'book', available: true } });

        if (selectedIndex < 0 || selectedIndex >= books.length) {
          response = 'END Invalid selection.';
        } else {
          const selectedBook = books[selectedIndex];

          await MaterialRequest.create({
            materialId: selectedBook.id,
            requesterId: user.id
          });

          selectedBook.available = false;
          await selectedBook.save();

          // Send notification to the donor
          await Notification.create({
            userId: selectedBook.userId,
            message: `Your book "${selectedBook.title}" has been requested via USSD.`
          });

          response = 'END Book request successful. The donor will be notified.';
        }
      }

    } else if (inputs[0] === '0') {
      response = 'END Thank you for using EcoBook.';

    } else {
      response = 'END Invalid option.';
    }
  }

  res.set('Content-Type', 'text/plain');
  return res.send(response);
};

exports.getBonusSum = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sum = await BonusPayment.sum('amount', {
      where: { userId, type: 'Reward-payment' }
    });

    res.status(200).json({ sum: sum || 0 });
  } catch (error) {
    console.error('Bonus sum fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching bonus sum' });
  }
};

// a list of all materials I ever listed
exports.getMyListings = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all user's listings with optional associated requests
    const listings = await Material.findAll({
      where: { userId },
      include: [
        {
          model: MaterialRequest,
          as: 'requests',
          required: false
        }
      ]
    });

    // Map to attach status based on latest request 
    const listingsWithStatus = listings.map(item => {
      const latestRequest = item.requests?.[0]; // Assuming one request 
      return {
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        status: latestRequest ? latestRequest.status : 'Unknown'
      };
    });

    res.status(200).json({ listings: listingsWithStatus });
  } catch (error) {
    console.error('Fetching listings error:', error);
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
};

//delete an item that' already delivered
exports.deleteListing = async (req, res) => {
  try {
    const userId = req.user.userId;
    const itemId = req.params.id;

    const item = await Material.findOne({ where: { id: itemId, userId } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    const requests = await MaterialRequest.findAll({
      where: { materialId: itemId }
    });

    if (requests.length > 0) {
      const undelivered = requests.some(req => req.status !== 'Delivered');
      if (undelivered) {
        return res.status(400).json({ message: 'Item cannot be deleted. It has pending or active requests.' });
      }

      const requestIds = requests.map(r => r.id);

      /* Delete dependent schedules first
      sequesntial deletion
*/
      await Schedule.destroy({ where: { requestId: requestIds } });

      // Delete material requests next
      await MaterialRequest.destroy({ where: { materialId: itemId } });
    }

    await item.destroy();
    return res.status(200).json({ message: 'Item and related records deleted successfully' });

  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error while deleting item' });
  }
};


//A summary ofall the user's activities
exports.getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookDeliveries = await MaterialRequest.findAll({
      where: { status: 'Delivered' },
      include: [
        {
          model: Material,
          as: 'material',
          where: { type: 'book', userId },
          required: true
        }
      ]
    });

    const recyclableReceipts = await MaterialRequest.findAll({
      where: { status: 'Delivered', requesterId: userId },
      include: [
        {
          model: Material,
          as: 'material',
          where: { type: 'recyclable' },
          required: true
        }
      ]
    });

    const summary = [
      ...bookDeliveries.map(r => ({
        type: 'book',
        title: r.material.title,
        deliveredAt: r.updatedAt
      })),
      ...recyclableReceipts.map(r => ({
        type: 'recyclable',
        category: r.material.category,
        receivedAt: r.updatedAt
      }))
    ];

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching summary' });
  }
};

//reports for the papermill users to generate and download

exports.generatePaperMillReport = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all recyclable deliveries marked as 'Delivered' for this paper mill
    const requests = await MaterialRequest.findAll({
      where: {
        requesterId: userId,
        status: 'Delivered'
      },
      include: [
        { model: Material, as: 'material', where: { type: 'recyclable' } }
      ],
    });

    // Fetch all relevant bonus payments for these materials
    const materialIds = requests.map(r => r.materialId);

    const bonuses = await BonusPayment.findAll({
      where: { materialId: materialIds },
    });

    const bonusMap = {};
    bonuses.forEach(b => {
      bonusMap[b.materialId] = b.amount;
    });

    // Prepare CSV rows
    const reportData = requests.map(r => ({
      'Material': r.material.category,
      'Copies Received': r.material.copies,
      'Delivery Date': new Date(r.updatedAt).toLocaleDateString(),
      'Bonus Paid (Ksh)': bonusMap[r.materialId] || 0
    }));

    const fields = ['Material', 'Copies Received', 'Delivery Date', 'Bonus Paid (Ksh)'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(reportData);

    res.header('Content-Type', 'text/csv');
    res.attachment('PaperMill_Report.csv');
    return res.send(csv);

  } catch (err) {
    console.error('Error generating report:', err);
    return res.status(500).json({ message: 'Failed to generate report' });
  }
};

// delete a notification once read

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    await notification.destroy();

    res.status(200).json({ message: 'Notification deleted successfully' });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
};

