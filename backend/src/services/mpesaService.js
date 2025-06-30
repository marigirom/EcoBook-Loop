

const axios = require('axios');
const moment = require('moment');

const config = {
  shortCode: '174379', // Replace with your Paybill or Till number for sandbox
  passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', // Get this from Safaricom Developer Portal
  consumerKey: 'wmdkWIoWoNG9PauLAEOVbNmNWNfQl25AyBvUaXMr9WrFwphj',
  consumerSecret: 'XS4kmw8d0rOxj1aLNgQ3u1CtBoiCFCSuDsdXUfLuvdgAyEYRvR7l7HMqb6z6CG9R',
  apiUrl: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  authUrl: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  callbackUrl: 'https://sandbox.safaricom.co.ke', // For testing, you can simulate callback or expose via ngrok
};

async function getAccessToken() {
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');

  try {
    const res = await axios.get(config.authUrl, {
      headers: { Authorization: `Basic ${credentials}` },
    });
    return res.data.access_token;
  } catch (err) {
    console.error('Access Token Error:', err.response?.data || err.message);
    throw new Error('Failed to generate access token');
  }
}

function generatePassword() {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const raw = `${config.shortCode}${config.passkey}${timestamp}`;
  return { password: Buffer.from(raw).toString('base64'), timestamp };
}

function sanitizePhoneNumber(phone) {
  if (phone.startsWith('0')) {
    return '254' + phone.substring(1);
  }
  if (phone.startsWith('+')) {
    return phone.substring(1);
  }
  return phone;
}


exports.initiateSTKPush = async (phone, amount, accountRef = 'EcoPay Bonus') => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();
    const sanitizedPhone = sanitizePhoneNumber(phone);


    const payload = {
  BusinessShortCode: config.shortCode,
  Password: password,
  Timestamp: timestamp,
  TransactionType: 'CustomerPayBillOnline',
  Amount: amount,
  PartyA: sanitizedPhone,
  PartyB: config.shortCode,
  PhoneNumber: sanitizedPhone,
  CallBackURL: config.callbackUrl,
  AccountReference: accountRef,
  TransactionDesc: 'EcoPay Bonus Payment',
};


    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const res = await axios.post(config.apiUrl, payload, { headers });

    return { success: true, data: res.data };
  } catch (err) {
    console.error('STK Push Error:', err.response?.data || err.message);
    return { success: false, error: err.message };
  }
};

