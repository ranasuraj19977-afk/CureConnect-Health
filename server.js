/**
 * EASY DOC IN - Backend (Express)
 * - Receives text consults (stores in SQLite & sends confirmation email)
 * - Creates Stripe Checkout session for video consults
 * - Handles Stripe webhook to mark payment complete, create Jitsi meeting link, and email the user
 *
 * Requirements:
 *  - Node >= 18
 *  - npm install
 *  - Set environment variables as in .env.example
 *
 * Notes:
 *  - This is a demo implementation. For production, follow security and legal/privacy requirements.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Stripe = require('stripe');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const { sendEmail } = require('./send_email');
const { createJitsiMeeting } = require('./create_meeting');

const app = express();
const port = process.env.PORT || 3000;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files (if deploying together)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint: receive free text consult
app.post('/api/text-consult', async (req, res) => {
  try {
    const { name, age, contact, message } = req.body;
    if (!name || !contact || !message) return res.status(400).json({error: 'Missing required fields'});
    const id = db.saveConsult({name, age, contact, message, type: 'text'});
    // send confirmation email
    await sendEmail({
      to: contact,
      subject: 'EASY DOC IN — Consultation Received',
      text: `Thanks ${name}. We received your consultation (id: ${id}). We'll reply shortly.`
    });
    res.json({ok: true, id});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Server error'});
  }
});

// Endpoint: create Stripe Checkout session for paid video consult
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { name, contact, price = 500 } = req.body;
    if (!name || !contact) return res.status(400).json({error: 'Missing name or contact'});
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'Video Consultation (15 min) — EASY DOC IN' },
            unit_amount: Math.round(price * 100)
          },
          quantity: 1
        }
      ],
      metadata: { name, contact },
      success_url: (process.env.SUCCESS_URL || 'http://localhost:3000/success') + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: (process.env.CANCEL_URL || 'http://localhost:3000/cancel'),
    });
    res.json({url: session.url});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Stripe error'});
  }
});

// Stripe webhook to handle completed payments
app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { name, contact } = session.metadata || {};
    // create meeting and send email
    const meeting = await createJitsiMeeting({name, contact});
    // store as paid consult in DB
    db.saveConsult({name, contact, type: 'video', meta: JSON.stringify({sessionId: session.id, meeting})});
    await sendEmail({
      to: contact,
      subject: 'EASY DOC IN — Video Consultation Booked',
      text: `Thanks ${name}. Your booking is confirmed. Join the meeting at: ${meeting.url}
Meeting ID: ${meeting.room}
Note: This email was sent by demo backend.`
    });
  }

  res.json({received: true});
});

// Simple success/cancel pages (for local testing)
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});
app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
