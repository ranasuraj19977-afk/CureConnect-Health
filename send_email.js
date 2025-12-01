/**
 * send_email.js
 * Simple email sender using nodemailer.
 * Configure SMTP using environment variables below, or use SendGrid SMTP.
 */

const nodemailer = require('nodemailer');

const TRANSPORT_OPTIONS = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const transporter = nodemailer.createTransport(TRANSPORT_OPTIONS);

async function sendEmail({to, subject, text, html}) {
  const from = process.env.EMAIL_FROM || 'no-reply@easydoc.local';
  const info = await transporter.sendMail({from, to, subject, text, html});
  console.log('Email sent:', info.messageId);
  return info;
}

module.exports = { sendEmail };
