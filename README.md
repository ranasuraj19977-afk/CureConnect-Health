# EASY DOC IN — Fullstack Demo

This project contains:
- A static frontend (in /public) for text consults and paid video consult booking.
- A Node.js + Express backend that:
  - Accepts free text consults and stores them in a local SQLite database.
  - Creates Stripe Checkout sessions for paid video consults.
  - Handles Stripe webhook `checkout.session.completed` to create a meeting (Jitsi) and send the meeting link by email.
  - Sends emails via SMTP (e.g., SendGrid).

## Quick start (local)
1. Install Node.js (v18+ recommended).
2. Unzip the project and open a terminal in the project folder.
3. Copy `.env.example` to `.env` and fill the values (Stripe keys, SMTP credentials).
4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```
6. Open `http://localhost:3000` in your browser.

## Stripe setup (test mode)
1. Create a Stripe account and get test API keys.
2. Set `STRIPE_SECRET_KEY` in `.env`.
3. Set `SUCCESS_URL` and `CANCEL_URL` to your server URLs.
4. To receive webhook events (locally), use `stripe listen --forward-to localhost:3000/webhook` and copy the webhook secret into `STRIPE_WEBHOOK_SECRET`.

## Email (SendGrid)
- Use SendGrid SMTP (`smtp.sendgrid.net`) or any SMTP provider.
- Put SMTP credentials in `.env`. The project uses nodemailer.

## Payments & meeting flow (overview)
1. User fills video booking form and clicks Pay.
2. Frontend calls `/api/create-checkout-session` which creates a Stripe Checkout session and returns a URL.
3. User pays on Stripe Checkout.
4. Stripe sends `checkout.session.completed` webhook to `/webhook`.
5. Server handles webhook: creates a Jitsi meeting URL and emails it to the user.

## Notes & next steps
- This is a demo. For production:
  - Use HTTPS and secure environment storage for keys.
  - Verify and sanitize all inputs.
  - Implement authentication for doctors/admins.
  - Consider using a reliable transactional email provider (SendGrid, Mailgun).
  - For private/secure video calls, integrate Zoom or a self-hosted Jitsi and require authentication.
  - Implement logging, monitoring, backups, and follow local health data privacy laws.

If you want, I can:
- Replace Jitsi with Zoom meeting creation (requires Zoom OAuth/credentials) — tell me if you prefer Zoom.
- Add an admin dashboard to view consults and mark them closed.
- Deploy this to a free host (Render, Railway, or Vercel for frontend + Heroku/Render for backend). I can provide step-by-step commands.

