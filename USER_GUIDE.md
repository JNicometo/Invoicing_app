# InvoicePro Desktop - User Guide

Welcome to InvoicePro Desktop! This comprehensive guide will help you get the most out of your invoicing application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Invoices](#managing-invoices)
   - [PDF Export](#pdf-export)
   - [Payment Links](#payment-links)
4. [Managing Clients](#managing-clients)
5. [Saved Items](#saved-items)
6. [Archive](#archive)
7. [Settings](#settings)
8. [Search & Filters](#search--filters)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/invoicepro-desktop.git
   cd invoicepro-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm run electron:dev
   ```

### First Run

On first launch, InvoicePro will:
- Create a local SQLite database to store your data
- Initialize default settings
- Display the Dashboard with no data

**Important**: Your data is stored locally on your computer. Database location:
- **macOS**: `~/Library/Application Support/invoicepro-desktop/`
- **Windows**: `%APPDATA%\invoicepro-desktop\`
- **Linux**: `~/.config/invoicepro-desktop/`

---

## Dashboard

The Dashboard provides an at-a-glance view of your business:

### Statistics Cards

The dashboard displays five color-coded cards:

1. **Total Revenue** (Blue)
   - Shows all-time earnings
   - Displays total amount from all invoices

2. **Total Invoices** (Purple)
   - Number of invoices created
   - Includes all statuses

3. **Paid** (Green)
   - Amount received from paid invoices
   - Includes percentage of total revenue
   - Progress bar visualization

4. **Pending** (Yellow)
   - Amount awaiting payment
   - Includes percentage of total revenue
   - Progress bar visualization

5. **Overdue** (Red)
   - Amount from overdue invoices
   - Includes percentage of total revenue
   - Highlighted border when overdue invoices exist
   - Progress bar visualization

### Recent Invoices

Below the statistics, you'll see your 5 most recent invoices with:
- Invoice number and status badge
- Client name
- Amount and date
- Quick action buttons (View/Edit)
- Color-coded left border by status

**Status Colors:**
- **Green**: Paid
- **Yellow**: Pending
- **Red**: Overdue
- **Gray**: Draft

---

## Managing Invoices

### Creating an Invoice

1. Click **"New Invoice"** button or press `Ctrl/Cmd + N`
2. Fill in the invoice details:
   - **Client**: Select from dropdown or search by customer number
   - **Invoice Number**: Auto-generated, but can be customized
   - **Date & Due Date**: Invoice and payment due dates
   - **Status**: Draft, Pending, Paid, or Overdue

### Adding Line Items

InvoicePro offers two ways to add items:

#### Method 1: Enter Item Number (Quick)
1. Type the item number in the first field
2. Press `Enter` or click outside the field
3. Description and rate auto-populate from saved items
4. Adjust quantity as needed

#### Method 2: Browse Items (Search)
1. Click the magnifying glass icon next to the trash can
2. Browse all saved items
3. Click to select and auto-fill

**Line Item Fields:**
- **Item #**: Optional item number for quick lookup
- **Description**: What you're billing for (required)
- **Quantity**: Number of units
- **Rate**: Price per unit
- **Amount**: Auto-calculated (Quantity × Rate)

### Invoice Actions

- **Save**: Saves the invoice (auto-calculates totals)
- **Preview**: View full invoice with company branding
- **Edit**: Modify existing invoice
- **Archive**: Move to archive (keeps in database)
- **Delete**: Permanently remove (cannot be undone)

### Batch Operations

Select multiple invoices using checkboxes to:
- **Mark as Paid**: Update status to paid for all selected
- **Archive**: Move multiple invoices to archive
- **Delete**: Remove multiple invoices permanently

**To use batch operations:**
1. Check boxes next to invoices you want to modify
2. Use "Select All" checkbox in header to select all visible
3. Click desired action in the blue bar that appears
4. Confirm your action

### Status Management

Invoices automatically update to "Overdue" when:
- Due date has passed
- Current status is Pending (not Paid)
- Invoice is not archived

### PDF Export

1. Open invoice preview
2. Click **"Download PDF"** button
3. Choose save location
4. PDF includes all invoice details with professional formatting

**PDF Features:**
- Optimized for single-page layout
- Reduced margins for better space utilization
- Company branding and logo
- Professional formatting
- Ready to email or print

### Payment Links

Generate secure payment links for your clients to pay online via Stripe or PayPal.

#### Setting Up Payment Gateways

**Stripe Setup:**
1. Go to **Settings** → **Payment Gateway**
2. Toggle **Stripe** to ON
3. Sign up at [stripe.com](https://stripe.com) (free account)
4. Go to Stripe Dashboard → Developers → API keys
5. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
6. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
7. Paste both keys into InvoicePro settings
8. Click **Save Settings**

**PayPal Setup:**
1. Go to **Settings** → **Payment Gateway**
2. Toggle **PayPal** to ON
3. Create a PayPal account at [paypal.com](https://paypal.com)
4. Set up your PayPal.me link (e.g., paypal.me/yourname)
5. Enter your PayPal.me username (just "yourname" without the paypal.me/) OR your PayPal email
6. Click **Save Settings**

#### Generating Payment Links

1. Open an unpaid invoice
2. In the **Payment Tracking** section, you'll see:
   - **"Stripe Payment Link"** button (purple) - if Stripe is enabled
   - **"PayPal Payment Link"** button (blue) - if PayPal is enabled
3. Click the button for your preferred payment method
4. The link will be generated and displayed in a highlighted box
5. Click the **Copy** button to copy the link
6. Send the link to your client via email, text, or messaging app
7. Client clicks the link and pays securely
8. You manually record the payment when received

**Payment Link Features:**
- ✅ Secure, PCI-compliant payment processing
- ✅ One-click link generation
- ✅ Copy-to-clipboard for easy sharing
- ✅ Professional Stripe/PayPal hosted payment pages
- ✅ Support for all major credit/debit cards
- ✅ No complex webhooks or server setup needed

**Payment Methods Supported:**
When recording payments, you can track 17 different payment methods:
- Cash
- Check
- Credit Card
- Debit Card
- Bank Transfer
- ACH
- Wire Transfer
- PayPal
- Venmo
- Zelle
- Stripe
- Square
- Apple Pay
- Google Pay
- Cryptocurrency
- Money Order
- Other

---

## Managing Clients

### Adding a Client

1. Navigate to **Clients** section
2. Click **"New Client"** button
3. Fill in client details:
   - **Customer Number** (Optional): Unique identifier for quick searching
   - **Name** (Required): Client or company name
   - **Email** (Required): Contact email
   - **Phone**: Contact number
   - **Address Details**: Full address for invoicing

### Customer Numbers

Customer numbers help you:
- Quickly find clients when creating invoices
- Organize clients with your own numbering system
- Search by number instead of name

**Best Practices:**
- Use consistent format (e.g., CUST-001, CL-0001)
- Keep them short and memorable
- Document your numbering system

### Client Actions

- **View Invoices**: Click to see all invoices for this client
- **Edit**: Update client information
- **Delete**: Remove client (only if no associated invoices)

---

## Saved Items

Saved Items are reusable line items that speed up invoice creation.

### Creating a Saved Item

1. Navigate to **Saved Items**
2. Click **"New Item"** button
3. Fill in item details:
   - **Item Number** (Optional): Quick reference code
   - **Description** (Required): What this item is
   - **Rate** (Required): Default price
   - **Category**: Organize items by type

### Item Numbers

Item numbers enable:
- Fast invoice creation
- Easy item lookup
- Standardized pricing

**Suggested Formats:**
- Service codes: `SRV-001`, `DEV-001`
- Product codes: `PRD-001`, `ITEM-001`
- Category-based: `WEB-001`, `DESIGN-001`

### Using Saved Items

When creating an invoice:
1. Type the item number in the line item
2. Press Enter
3. Description and rate auto-fill
4. Adjust quantity as needed

OR

1. Click the magnifying glass icon
2. Browse and select from the modal

---

## Archive

The Archive stores completed or old invoices without deleting them.

### Archiving Invoices

- Single: Click Archive button on invoice
- Batch: Select multiple and click Archive

### Viewing Archived Invoices

1. Navigate to **Archive** section
2. View all archived invoices
3. Search and filter archived items

### Restoring Invoices

1. Find invoice in Archive
2. Click **"Restore"** button
3. Invoice returns to main invoice list

---

## Settings

Customize your company information and invoice appearance.

### Company Information

- **Company Name**: Appears on invoices
- **Contact Details**: Email, phone, address
- **Logo**: Upload company logo (optional)

### Invoice Settings

- **Invoice Prefix**: Default prefix for invoice numbers (e.g., "INV-")
- **Tax Rate**: Default tax percentage
- **Currency Symbol**: Default is "$"
- **Payment Terms**: Default payment terms text
- **Bank Details**: Payment instructions

### Theme

Choose your accent color:
- Blue (default)
- Green
- Purple
- Red

---

## Search & Filters

### Global Search (Ctrl/Cmd + F)

Search across ALL data:
- **Invoices**: By number, client name, or amount
- **Clients**: By name, email, or customer number
- **Saved Items**: By description or item number

**How to use:**
1. Press `Ctrl/Cmd + F` or click "Global Search" in sidebar
2. Start typing
3. Results appear grouped by category
4. Click any result to navigate to that section

**Tips:**
- Results update as you type (300ms delay)
- Shows top 5 matches per category
- Case-insensitive search

### Invoice Filters

The Invoice page offers powerful filtering:

#### Quick Status Filters
- **All**: Show all invoices
- **Unpaid**: Pending + Overdue invoices
- **Paid**: Only paid invoices
- **Overdue**: Only overdue invoices

#### Advanced Filters
- **Search Bar**: Filter by invoice number or client name
- **Client Dropdown**: Show invoices for specific client
- **Date Range**: Filter by invoice date
  - From Date: Show invoices after this date
  - To Date: Show invoices before this date

#### Clear Filters

Click **"Clear All Filters"** to reset all filters and show all invoices.

---

## Keyboard Shortcuts

InvoicePro includes comprehensive keyboard shortcuts for faster navigation.

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + D` | Go to Dashboard |
| `Ctrl/Cmd + I` | Go to Invoices |
| `Ctrl/Cmd + U` | Go to Clients |
| `Ctrl/Cmd + ,` | Go to Settings |

### Actions

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New Invoice (opens Invoice page) |
| `Ctrl/Cmd + F` | Global Search |
| `Ctrl/Cmd + S` | Save (in forms) |
| `Ctrl/Cmd + P` | Print (in preview) |
| `Escape` | Close modals/forms |

### Help

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + /` | Show keyboard shortcuts help |

**Notes:**
- Use `Cmd` on macOS, `Ctrl` on Windows/Linux
- Shortcuts work globally except when typing in input fields
- Press `Escape` to close any modal or form

---

## Troubleshooting

### Database Errors

**Problem**: "Column does not exist" errors

**Solution**: Run the database fix script:
```bash
npm run fix-db
```

This adds missing columns (customer_number, item_number) to the database.

### better-sqlite3 Module Error

**Problem**: "Module was compiled against a different Node.js version"

**Solution**: Rebuild the module for Electron:
```bash
npm uninstall better-sqlite3
npm install better-sqlite3
npx electron-rebuild -f -w better-sqlite3
```

### Application Won't Start

**Checklist:**
1. Ensure all dependencies are installed: `npm install`
2. Check Node.js version (should be v16+)
3. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```
4. Check console for error messages

### Data Recovery

Your database file is located at:
- **macOS**: `~/Library/Application Support/invoicepro-desktop/invoicepro.db`
- **Windows**: `%APPDATA%\invoicepro-desktop\invoicepro.db`
- **Linux**: `~/.config/invoicepro-desktop/invoicepro.db`

**To backup:**
1. Close InvoicePro
2. Copy the `invoicepro.db` file to a safe location

**To restore:**
1. Close InvoicePro
2. Replace the database file with your backup
3. Restart InvoicePro

### PDF Generation Issues

**Problem**: PDFs not generating or appearing blank

**Solutions:**
1. Ensure you have write permissions to the save location
2. Try saving to a different directory
3. Check that invoice has all required data (client, items, amounts)
4. Restart the application

### Search Not Working

**Problem**: Global search returns no results

**Solutions:**
1. Check your search term (must be at least 1 character)
2. Try different search terms
3. Verify data exists (check each section manually)
4. Restart the application to reload data

---

## Tips & Best Practices

### Invoice Management

1. **Use Consistent Numbering**: Stick to your invoice prefix format
2. **Set Due Dates**: Always specify clear payment due dates
3. **Add Notes**: Use the notes field for payment instructions or special terms
4. **Regular Review**: Check Dashboard weekly to monitor overdue invoices

### Client Organization

1. **Customer Numbers**: Implement a numbering system from the start
2. **Complete Information**: Fill in all client details for professional invoices
3. **Regular Updates**: Keep client contact information current

### Saved Items Library

1. **Standardize Pricing**: Use saved items for consistent pricing
2. **Item Numbers**: Create logical numbering system
3. **Categories**: Organize items by service type or product category
4. **Regular Audit**: Review and update rates periodically

### Data Management

1. **Regular Backups**: Backup your database file weekly
2. **Archive Old Invoices**: Keep active list manageable
3. **Clean Up Drafts**: Delete or complete draft invoices regularly

### Workflow Optimization

1. **Use Keyboard Shortcuts**: Learn shortcuts for faster navigation
2. **Batch Operations**: Process multiple invoices at once
3. **Templates**: Create saved items for common services
4. **Quick Search**: Use Ctrl/Cmd+F instead of navigating

---

## Support & Feedback

For issues, feature requests, or questions:
- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **Documentation**: Check this guide first
- **Community**: Engage with other users on GitHub

---

## Version History

### v1.0.0 - Current Release

**Features:**
- Dashboard with visual statistics
- Invoice creation and management
- Client management with customer numbers
- Saved items with item numbers
- PDF export functionality
- Archive system
- Global search
- Quick filters
- Batch operations
- Keyboard shortcuts
- Automatic overdue status updates

**Recent Improvements:**
- Enhanced dashboard with color-coded cards and progress bars
- Quick filter buttons for invoice status
- Date range and client filtering
- Batch operations (mark paid, archive, delete)
- Global search across all data
- Comprehensive keyboard shortcuts
- Better status color indicators

---

Thank you for using InvoicePro Desktop! We hope this guide helps you manage your invoices efficiently.
