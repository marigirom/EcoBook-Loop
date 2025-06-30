require('dotenv').config({ path: './backend/.env' });
const transporter = require('./mailer');


const testEmail = async () => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: 'romarsmarigi@gmail.com', 
      subject: 'EcoBook Test Email',
      text: 'This is a test email from your EcoBook project!',
    });

    console.log('Test email sent successfully');
  } catch (error) {
    console.error(' Failed to send test email:', error);
  }
};

testEmail();
