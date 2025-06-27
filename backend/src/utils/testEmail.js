require('dotenv').config({ path: './backend/.env' });  // Adjust if your .env is elsewhere
const transporter = require('./mailer');


const testEmail = async () => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: 'recipient@example.com',  // Replace with the real email you want to test with
      subject: 'EcoBook Test Email',
      text: 'This is a test email from your EcoBook project!',
    });

    console.log('Test email sent successfully');
  } catch (error) {
    console.error(' Failed to send test email:', error);
  }
};

testEmail();
