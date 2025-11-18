# Test Data for InvoicePro

This directory contains CSV files with realistic test data for the InvoicePro invoicing application.

## Contents

### Client Data
- **test_clients.csv** - 10 diverse business clients
  - Includes corporations, law firms, tech companies, service businesses, etc.
  - Complete with addresses, emails, phone numbers, and notes

### Product/Service Catalog
- **test_saved_items.csv** - 15 reusable products/services
  - Various categories: Development, Design, Marketing, Consulting, Support, etc.
  - Hourly rates and fixed-price items

### Invoices
- **test_invoices.csv** - 20 invoices with various statuses
  - 5 Paid invoices
  - 8 Sent invoices
  - 5 Draft invoices
  - 2 Overdue invoices
  - Various discounts, tax calculations, and adjustments

- **test_invoice_items.csv** - 42 invoice line items
  - Multiple items per invoice showing realistic billing scenarios

### Payments
- **test_payments.csv** - 6 payment records
  - Various payment methods: Bank Transfer, Check, Credit Card
  - Full and partial payments
  - Reference numbers and notes

### Estimates (Quotes)
- **test_estimates.csv** - 8 estimates with different statuses
  - 3 Accepted (and converted to invoices)
  - 1 Declined
  - 2 Sent (pending)
  - 2 Draft

- **test_estimate_items.csv** - 20 estimate line items

### Recurring Invoices
- **test_recurring_invoices.csv** - 5 recurring invoice templates
  - Monthly, weekly, and quarterly frequencies
  - Active templates with generation dates

- **test_recurring_invoice_items.csv** - 6 recurring line items

### Credit Notes
- **test_credit_notes.csv** - 3 credit notes
  - Various reasons: refunds, billing adjustments, service quality issues
  - Different statuses: issued and applied

- **test_credit_note_items.csv** - 3 credit note line items

### Reminders
- **test_reminder_templates.csv** - 4 email reminder templates
  - Pre-due reminders
  - Overdue reminders (1st, 2nd, and final notice)
  - Template variables for personalization

- **test_invoice_reminders.csv** - 6 reminder records
  - Automatic and manual reminders
  - Linked to overdue and upcoming invoices

### Users
- **test_users.csv** - 5 user accounts
  - 1 Admin (admin / admin123)
  - 2 Standard Users (testuser / test123, jsmith / john123)
  - 1 Viewer (viewer / view123)
  - 1 Inactive User

**IMPORTANT:** All passwords are test passwords and must be changed before production use!

## Data Relationships

The test data includes proper relationships:

1. **Invoices → Clients**: All invoices linked to valid clients
2. **Invoice Items → Invoices**: All items properly associated
3. **Payments → Invoices**: Payments linked to correct invoices
4. **Estimates → Invoices**: 3 estimates converted to invoices (IDs match)
5. **Credit Notes → Invoices**: Credit notes reference original invoices
6. **Recurring Invoices → Clients**: Templates assigned to clients
7. **Reminders → Invoices**: Reminders track invoice communications

## Test Data Statistics

- **Total Clients**: 10
- **Total Invoices**: 20
- **Total Invoice Amount**: $127,865.00
- **Total Paid**: $32,542.50
- **Total Outstanding**: $95,322.50
- **Total Overdue**: $4,358.50 (2 invoices)
- **Estimates**: 8 ($74,261.00 total value)
- **Recurring Templates**: 5 (generating ongoing revenue)
- **Credit Notes**: 3 ($4,547.50 total credits)

## How to Import Test Data

### Method 1: Using Application Import Feature (Recommended)

1. Open InvoicePro application
2. Go to **Settings → Database → Import**
3. Import files in this specific order:
   - test_clients.csv
   - test_saved_items.csv
   - test_invoices.csv
   - test_invoice_items.csv
   - test_payments.csv
   - test_estimates.csv
   - test_estimate_items.csv
   - test_recurring_invoices.csv
   - test_recurring_invoice_items.csv
   - test_credit_notes.csv
   - test_credit_note_items.csv
   - test_reminder_templates.csv
   - test_invoice_reminders.csv
   - test_users.csv

**Order is important** to maintain foreign key relationships!

### Method 2: Direct SQL Import

```bash
# Create a test database
sqlite3 test_invoicepro.db < ../database/schema.sql

# Import CSV files (example for clients)
sqlite3 test_invoicepro.db <<EOF
.mode csv
.import test_clients.csv clients
.import test_saved_items.csv saved_items
.import test_invoices.csv invoices
.import test_invoice_items.csv invoice_items
.import test_payments.csv payments
.import test_estimates.csv estimates
.import test_estimate_items.csv estimate_items
.import test_recurring_invoices.csv recurring_invoices
.import test_recurring_invoice_items.csv recurring_invoice_items
.import test_credit_notes.csv credit_notes
.import test_credit_note_items.csv credit_note_items
.import test_reminder_templates.csv reminder_templates
.import test_invoice_reminders.csv invoice_reminders
.import test_users.csv users
EOF
```

### Method 3: Application Restore from Backup

If the application has a restore feature, you could create a backup ZIP containing these CSV files.

## Verification After Import

Run these queries to verify data loaded correctly:

```sql
-- Count records
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'Invoice Items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'Payments', COUNT(*) FROM payments
UNION ALL SELECT 'Estimates', COUNT(*) FROM estimates
UNION ALL SELECT 'Saved Items', COUNT(*) FROM saved_items;

-- Expected results:
-- Clients: 10
-- Invoices: 20
-- Invoice Items: 42
-- Payments: 6
-- Estimates: 8
-- Saved Items: 15

-- Verify invoice totals
SELECT
  COUNT(*) as total_invoices,
  SUM(total) as total_amount,
  SUM(CASE WHEN status='paid' THEN total ELSE 0 END) as paid_amount,
  SUM(CASE WHEN status='overdue' THEN total ELSE 0 END) as overdue_amount
FROM invoices;

-- Verify relationships
SELECT
  i.invoice_number,
  c.name as client_name,
  COUNT(ii.id) as line_items,
  i.total as invoice_total
FROM invoices i
JOIN clients c ON i.client_id = c.id
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id
ORDER BY i.invoice_number;
```

## Test Scenarios

This test data supports the following test scenarios:

1. **Paid Invoice Flow**: Test viewing and reporting on completed transactions
2. **Overdue Invoice Flow**: Test reminder system and overdue handling
3. **Partial Payment**: Invoice #6 has partial payment ($10,000 of $16,150)
4. **Estimate Conversion**: Estimates 1, 2, 3 were converted to invoices
5. **Credit Note Workflow**: Test refund/adjustment processing
6. **Recurring Invoice Generation**: Test automatic invoice creation
7. **Multi-User Access**: Test different permission levels
8. **Payment Reminders**: Test automated reminder system

## Cleaning Up Test Data

To remove test data (if needed):

```sql
-- WARNING: This will delete all test data!
DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE invoice_number LIKE 'INV-2024-%');
DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE invoice_number LIKE 'INV-2024-%');
DELETE FROM invoice_reminders WHERE invoice_id IN (SELECT id FROM invoices WHERE invoice_number LIKE 'INV-2024-%');
DELETE FROM invoices WHERE invoice_number LIKE 'INV-2024-%';

DELETE FROM estimate_items WHERE estimate_id IN (SELECT id FROM estimates WHERE estimate_number LIKE 'EST-2024-%');
DELETE FROM estimates WHERE estimate_number LIKE 'EST-2024-%';

DELETE FROM credit_note_items WHERE credit_note_id IN (SELECT id FROM credit_notes WHERE credit_note_number LIKE 'CN-2024-%');
DELETE FROM credit_notes WHERE credit_note_number LIKE 'CN-2024-%';

DELETE FROM recurring_invoice_items;
DELETE FROM recurring_invoices;

DELETE FROM clients WHERE customer_number LIKE 'CUS-%';
DELETE FROM saved_items WHERE item_number LIKE 'ITEM-%';

DELETE FROM users WHERE username IN ('testuser', 'viewer', 'jsmith', 'inactive_user');

-- Keep default reminder templates or delete if desired
-- DELETE FROM reminder_templates WHERE id > 3;
```

## Notes

- All dates in test data are from 2024 and may need adjustment based on testing needs
- Email addresses use test domains (@testclient.com, @invoicepro.com)
- Phone numbers use 555 prefix (reserved for testing)
- Addresses are fictional
- Financial amounts are realistic for small-medium business scenarios
- Currency is USD ($)
- Tax rate of 7% applied consistently

## Password Information

**Test User Passwords (MUST CHANGE BEFORE PRODUCTION):**
- admin / admin123
- testuser / test123
- jsmith / john123
- viewer / view123
- inactive_user / inactive123

**Password hashes in CSV are placeholders** - the application should re-hash these on import or you should use the application's user creation feature instead.

## Integration Testing

This test data set is designed to support:
- Functional testing of all CRUD operations
- Report generation testing
- Payment workflow testing
- Reminder system testing
- Multi-user permission testing
- Data export/import testing
- Database migration testing
- Integration with other applications

For comprehensive testing procedures, see **TESTING_DOCUMENTATION.md** in the root directory.

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Compatible with**: InvoicePro v1.0+
