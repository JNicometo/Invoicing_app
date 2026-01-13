# InvoicePro Desktop - Quick Start Guide

Welcome to InvoicePro Desktop! This guide will help you get started in minutes.

## 🚀 Getting Started

### First Launch

When you first open InvoicePro Desktop, you'll see the Dashboard. Don't worry if it looks empty - we'll fill it with your business data!

### Step 1: Configure Your Company Settings

1. Click the **Settings** icon (⚙️) in the sidebar
2. Fill in your company information:
   - Company Name
   - Address
   - Email
   - Phone
   - Logo (optional but recommended)
3. Configure your invoice preferences:
   - Invoice prefix (e.g., "INV-")
   - Starting number
   - Payment terms
   - Currency
4. Click **Save Settings**

### Step 2: Add Your First Client

1. Click **Clients** in the sidebar
2. Click **+ New Client**
3. Fill in the client details:
   - Name (required)
   - Email (required)
   - Address
   - Phone
   - Customer Number (auto-generated)
4. Click **Create Client**

### Step 3: Create Your First Invoice

1. Click **Invoices** in the sidebar
2. Click **+ New Invoice**
3. Select your client from the dropdown
4. Add line items:
   - Click **+ Add Item**
   - Enter description, quantity, and rate
   - Add more items as needed
5. Set the due date
6. Add notes (optional)
7. Click **Create Invoice**

### Step 4: Export or Email Your Invoice

**To Export as PDF:**
1. Open the invoice
2. Click **Download PDF**
3. Choose where to save it
4. Done!

**To Email the Invoice:**
1. First, configure SMTP settings (Settings → Email)
2. Open the invoice
3. Click **Send Email**
4. Review the email details
5. Click **Send**

## 📊 Key Features

### Dashboard
- View total revenue, pending payments, and overdue invoices
- See recent activity at a glance
- Quick access to common actions

### Clients Management
- Store all client information in one place
- View client payment history
- Track client statistics

### Invoices
- Create professional invoices quickly
- Track payment status (Pending, Paid, Overdue)
- Generate recurring invoices
- Archive old invoices

### Quotes
- Create quotes for potential clients
- Convert quotes to invoices with one click
- Track quote acceptance

### Saved Items
- Save frequently used products/services
- Quickly add items to invoices
- Maintain consistent pricing

### Expenses
- Track business expenses
- Categorize expenses
- Mark expenses as billable

### Reports
- Generate financial reports
- Export data to CSV
- Analyze business performance

### Backup & Restore
- Automatic scheduled backups
- Manual backup anytime
- Easy restore from backup files

## ⚙️ Important Settings

### Email Configuration (SMTP)

To send invoices via email:

1. Go to **Settings → Email**
2. Enter your SMTP details:
   - **Gmail:** smtp.gmail.com, Port 587
   - **Outlook:** smtp-mail.outlook.com, Port 587
   - **Other:** Contact your email provider
3. Enable "Use TLS/SSL"
4. Test the connection

**Gmail Users:** You'll need to:
- Enable 2-factor authentication
- Generate an "App Password" (not your regular password)
- Use the app password in InvoicePro

### Payment Gateways

Accept online payments by configuring:

1. **Stripe** (Credit/Debit cards)
   - Get API keys from stripe.com
   - Enter in Settings → Payments
   - Generate payment links for invoices

2. **PayPal**
   - Enter your PayPal.me username
   - Generate payment links instantly

3. **Other Gateways**
   - Square, Authorize.Net, and more supported

### Automatic Backups

Protect your data with automatic backups:

1. Go to **Settings → Backup & Restore**
2. Enable **Scheduled Backups**
3. Choose frequency (Daily, Weekly, Monthly)
4. Select backup location
5. Set retention period

## 🎨 Customization

### Invoice Templates

Customize how your invoices look:

1. Go to **Settings → Invoice Settings**
2. Choose your template style
3. Customize colors and fonts
4. Add your logo for branding

### Number Formats

Configure numbering for:
- Invoices
- Quotes
- Credit Notes
- Purchase Orders

Each can have its own prefix and starting number.

## 💾 Data Management

### Where is My Data Stored?

Your data is stored locally on your computer:

- **Windows:** `%APPDATA%\invoicepro-desktop\`
- **macOS:** `~/Library/Application Support/invoicepro-desktop/`
- **Linux:** `~/.config/invoicepro-desktop/`

### Backing Up Data

**Manual Backup:**
1. Go to **Settings → Backup & Restore**
2. Click **Create Backup Now**
3. Choose where to save the backup file
4. Keep this file safe!

**Automatic Backup:**
- Enable scheduled backups in settings
- Backups run automatically at your chosen time
- Old backups are cleaned up based on retention settings

### Restoring Data

If you need to restore from a backup:

1. Go to **Settings → Backup & Restore**
2. Click **Restore from Backup**
3. Select your backup file
4. Confirm the restore
5. The app will restart with your restored data

## 🔐 Security Best Practices

1. **Keep your data backed up** - Enable automatic backups
2. **Protect your SMTP password** - Never share it
3. **Keep the app updated** - Install updates when available
4. **Secure your computer** - Use a strong login password
5. **Be careful with exports** - Backup files contain all your data

## 📱 Keyboard Shortcuts

Speed up your workflow:

- `Ctrl/Cmd + N` - New invoice
- `Ctrl/Cmd + S` - Save
- `Ctrl/Cmd + P` - Print/Export PDF
- `Ctrl/Cmd + F` - Search
- `Ctrl/Cmd + ,` - Settings

## 🆘 Need Help?

### Common Issues

**Invoice won't send via email:**
- Check SMTP settings
- Verify your password/app password
- Test the connection in settings

**App won't start:**
- Restart your computer
- Reinstall the app
- Check the logs (Help → Open Logs)

**Database error:**
- Go to Settings → Backup & Restore
- Create a backup
- Use the repair database tool

### Getting Support

- **Documentation:** Check README.md for detailed info
- **Issues:** Report bugs on GitHub
- **Updates:** Check for updates regularly (Help → Check for Updates)

## 🎯 Pro Tips

1. **Use Saved Items** - Save time by creating a library of common products/services
2. **Set Up Recurring Invoices** - Automate regular billing
3. **Enable Payment Links** - Make it easy for clients to pay online
4. **Use Categories** - Organize expenses with categories
5. **Schedule Backups** - Never lose your data
6. **Customize Templates** - Brand your invoices professionally
7. **Track Everything** - Use expenses and reports for tax time
8. **Send Reminders** - Set up automatic payment reminders

## 📈 Next Steps

Now that you're set up:

1. ✅ Add all your clients
2. ✅ Create your first few invoices
3. ✅ Set up email and payment gateways
4. ✅ Enable automatic backups
5. ✅ Explore reports and analytics
6. ✅ Customize your invoice template

**Ready to invoice like a pro? Let's go! 🚀**

---

**Questions?** Check the full documentation in README.md or visit our GitHub repository.

**Happy Invoicing!** 🎉
