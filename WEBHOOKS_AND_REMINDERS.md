# Stripe Webhooks & Automated Reminders

This document explains the newly implemented features for automatic payment processing and scheduled invoice reminders.

## Features Implemented

### 1. Stripe Payment Webhooks
Automatically marks invoices as paid when Stripe payments succeed.

### 2. Automated Reminder Scheduler
Sends scheduled payment reminders based on reminder templates.

---

## 1. Stripe Webhook Setup

### Overview
When a customer pays an invoice via Stripe, the webhook automatically:
- Creates a payment record in the database
- Updates the invoice status to 'paid'
- Notifies the application in real-time

### Installation

First, install the required dependencies:

```bash
npm install express body-parser node-cron
```

### Local Setup

1. **Start the Application**
   - The webhook server starts automatically on port 3001
   - Endpoint: `http://localhost:3001/webhook/stripe`

2. **Configure Stripe Dashboard**
   - Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
   - Go to **Developers > Webhooks**
   - Click **Add endpoint**
   - For local testing, use a tool like [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3001
     ```
   - Use the ngrok URL: `https://your-ngrok-url.ngrok.io/webhook/stripe`

3. **Select Events to Listen**
   The webhook listens for these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`

4. **Important Notes**
   - For production, configure proper webhook signature verification
   - Add a webhook secret from Stripe Dashboard to your settings
   - Update the webhook handler to verify signatures:
     ```javascript
     const event = stripe.webhooks.constructEvent(
       req.body,
       sig,
       webhookSecret
     );
     ```

### Production Deployment

For production, you'll need to:
1. Deploy the application to a server with a public IP/domain
2. Configure Stripe webhook with your production URL
3. Enable webhook signature verification (add `stripe_webhook_secret` to settings)
4. Ensure port 3001 is accessible (or configure your preferred port)

---

## 2. Automated Reminder Scheduler

### Overview
The reminder scheduler automatically:
- Checks for invoices needing reminders every hour
- Sends emails based on reminder templates
- Records all sent reminders in the database

### How It Works

1. **Reminder Templates**
   - Default templates are created during database initialization
   - Templates include:
     - "Payment Due Soon" (3 days before due date)
     - "Payment Overdue" (7 days after due date)
     - "Second Reminder" (14 days after due date)

2. **Schedule**
   - Runs automatically every hour (cron: `0 * * * *`)
   - Runs once 30 seconds after app startup
   - Can be triggered manually via IPC call

3. **Template Variables**
   Use these placeholders in reminder templates:
   - `{invoice_number}` - Invoice number
   - `{client_name}` - Client's name
   - `{total}` - Invoice total amount
   - `{due_date}` - Invoice due date
   - `{company_name}` - Your company name

### Manual Trigger

You can manually trigger a reminder check from the frontend:

```javascript
const result = await window.electron.ipcRenderer.invoke('reminders:checkAndSend');
console.log(result.message); // "Reminder check completed"
```

### Configuration Requirements

For reminders to work, ensure these settings are configured:
- SMTP host, user, and password
- SMTP port (default: 587)
- From email and name
- Reminder templates are active

### Logs

Check the console for reminder activity:
```
Checking for invoices needing reminders...
Found 3 invoice(s) needing reminders
Reminder sent for invoice #INV-001 to client@example.com
Reminder recorded for invoice #INV-001
```

---

## Testing

### Test Webhook Locally

1. Start the application
2. Check console for: `Stripe webhook server listening on port 3001`
3. Use a tool like `curl` or Postman to test:

```bash
curl -X POST http://localhost:3001/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "amount_total": 10000,
        "metadata": {
          "invoice_id": "1"
        }
      }
    }
  }'
```

### Test Reminders

1. Create an invoice with a due date
2. Create a reminder template
3. Manually trigger reminder check:
   ```javascript
   window.electron.ipcRenderer.invoke('reminders:checkAndSend');
   ```
4. Check email for reminder

---

## Monitoring

### Webhook Events

Listen for payment events in your React components:

```javascript
useEffect(() => {
  window.electron.ipcRenderer.on('invoice-payment-received', (data) => {
    console.log('Payment received!', data);
    // { invoiceId, invoiceNumber, amount }

    // Refresh invoice list or show notification
  });

  return () => {
    window.electron.ipcRenderer.removeAllListeners('invoice-payment-received');
  };
}, []);
```

---

## Troubleshooting

### Webhooks Not Working

1. **Check webhook server is running**
   - Look for `Stripe webhook server listening on port 3001` in logs

2. **Verify Stripe configuration**
   - Ensure `stripe_enabled` is true in settings
   - Check `stripe_secret_key` is set

3. **Check webhook URL**
   - Ensure ngrok/public URL is correct
   - Verify firewall allows incoming connections

4. **Check Stripe Dashboard**
   - View webhook delivery attempts
   - Check for error messages

### Reminders Not Sending

1. **Check SMTP configuration**
   - Verify SMTP settings in app settings
   - Test email sending with a regular invoice

2. **Check reminder templates**
   - Ensure templates exist and are active
   - Verify template timing (days_before/days_after)

3. **Check client email**
   - Ensure clients have valid email addresses

4. **Check logs**
   - Look for error messages in console
   - Verify cron job is running

---

## Architecture Notes

### Webhook Server
- **Framework**: Express.js
- **Port**: 3001 (configurable)
- **Endpoint**: `/webhook/stripe`
- **Body Parser**: Raw body for signature verification

### Reminder Scheduler
- **Library**: node-cron
- **Schedule**: Every hour (`0 * * * *`)
- **Initial run**: 30 seconds after app start
- **Email**: Uses existing Nodemailer configuration

---

## Security Considerations

1. **Webhook Signature Verification**
   - TODO: Implement full signature verification for production
   - Store webhook secret securely
   - Never commit secrets to version control

2. **Email Rate Limiting**
   - Scheduler runs hourly to prevent spam
   - Only sends reminders once per template per invoice

3. **Input Validation**
   - Webhook validates Stripe configuration
   - Reminder checks for valid email addresses

---

## Future Enhancements

- [ ] Add webhook secret configuration to settings UI
- [ ] Implement webhook signature verification
- [ ] Add retry logic for failed reminder emails
- [ ] Create UI for monitoring sent reminders
- [ ] Add configurable reminder schedule
- [ ] Support for custom reminder conditions
- [ ] Webhook support for other payment providers
- [ ] Email delivery status tracking

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify all configuration settings
3. Review Stripe webhook logs in Dashboard
4. Test SMTP settings independently

---

**Last Updated**: 2025-11-12
**Version**: 1.0.0
