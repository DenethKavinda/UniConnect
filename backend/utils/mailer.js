const nodemailer = require('nodemailer');

// Email mailer configuration

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    // Email sending logic
  } catch (error) {
    console.error('Email send failed:', error);
  }
};

module.exports = {
  sendEmail
};
