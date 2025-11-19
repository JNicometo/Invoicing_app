# InvoicePro Testing Documentation & Checklist

**Version:** 1.0
**Last Updated:** 2025-11-18
**Application:** InvoicePro Desktop Invoicing Application

---

## Table of Contents
1. [Testing Overview](#testing-overview)
2. [Test Data Setup](#test-data-setup)
3. [Pre-Testing Checklist](#pre-testing-checklist)
4. [Functional Testing Checklist](#functional-testing-checklist)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [User Acceptance Testing](#user-acceptance-testing)
9. [Bug Reporting Template](#bug-reporting-template)
10. [Test Data Reference](#test-data-reference)

---

## Testing Overview

### Purpose
This document provides a comprehensive testing checklist for the InvoicePro application to ensure all features work correctly before deployment or integration with other applications.

### Testing Environment
- [ ] Testing database created (separate from production)
- [ ] Test data loaded from CSV files
- [ ] Application configured for test mode
- [ ] Backup of production data created (if applicable)

### Test Data Location
All test data CSV files are located in: `/test-data/`

---

## Test Data Setup

### Loading Test Data

**Option 1: Using CSV Import (Recommended)**
1. Navigate to Settings → Database → Import
2. Select CSV files from `/test-data/` folder
3. Import in this order:
   - [ ] `test_clients.csv` (10 test clients)
   - [ ] `test_saved_items.csv` (15 test products/services)
   - [ ] `test_invoices.csv` (20 test invoices)
   - [ ] `test_invoice_items.csv` (invoice line items)
   - [ ] `test_payments.csv` (payment records)
   - [ ] `test_estimates.csv` (estimate records)
   - [ ] `test_estimate_items.csv` (estimate line items)
   - [ ] `test_recurring_invoices.csv` (recurring invoice templates)
   - [ ] `test_recurring_invoice_items.csv` (recurring invoice line items)
   - [ ] `test_credit_notes.csv` (credit note records)
   - [ ] `test_credit_note_items.csv` (credit note line items)
   - [ ] `test_reminder_templates.csv` (email templates)
   - [ ] `test_users.csv` (test user accounts)

**Option 2: Manual Entry**
- Use test data reference section below to manually create records

**Option 3: SQL Import**
```bash
# From the test-data directory
sqlite3 /path/to/test-database.db < test_data_import.sql
```

### Verifying Test Data Load
- [ ] Check client count: Should have 10 clients
- [ ] Check invoice count: Should have 20 invoices
- [ ] Check saved items: Should have 15 items
- [ ] Verify relationships: Invoice items linked to invoices correctly
- [ ] Verify payments: Payment totals match invoice amounts where applicable

---

## Pre-Testing Checklist

### Application Setup
- [ ] Application launches without errors
- [ ] Database connection successful
- [ ] All menu items/tabs visible
- [ ] No console errors on startup
- [ ] Logo/branding displays correctly

### Initial Configuration
- [ ] Company settings configured
- [ ] Tax rate set
- [ ] Currency symbol correct
- [ ] Invoice prefix configured
- [ ] Payment terms set
- [ ] Theme loads correctly

### User Access
- [ ] Admin user can log in
- [ ] Standard user can log in
- [ ] Viewer user can log in
- [ ] Invalid credentials rejected
- [ ] Password reset works (if applicable)

---

## Functional Testing Checklist

### 1. Client Management

#### Create Client (CRUD - Create)
- [ ] Can create new client with all required fields
- [ ] Customer number auto-generates correctly
- [ ] Email validation works
- [ ] Can save client with minimal info (name + email only)
- [ ] Created timestamp recorded correctly
- [ ] Client appears in client list

#### View/Read Client (CRUD - Read)
- [ ] Client list displays all clients
- [ ] Can search/filter clients by name
- [ ] Can search/filter clients by email
- [ ] Client details page shows all information
- [ ] Associated invoices displayed correctly
- [ ] Customer number displays correctly

#### Update Client (CRUD - Update)
- [ ] Can edit client information
- [ ] Changes save correctly
- [ ] Updated timestamp changes
- [ ] Validation prevents invalid data
- [ ] Related invoices still linked after update

#### Delete Client (CRUD - Delete)
- [ ] Cannot delete client with active invoices (protection)
- [ ] Can delete client without invoices
- [ ] Confirmation dialog appears
- [ ] Audit log records deletion

#### Client Edge Cases
- [ ] Duplicate email handling
- [ ] Duplicate customer number handling
- [ ] Special characters in name/address
- [ ] Very long client names (100+ chars)
- [ ] International addresses
- [ ] Missing optional fields

---

### 2. Invoice Management

#### Create Invoice
- [ ] Can create new invoice
- [ ] Invoice number auto-generates with correct prefix
- [ ] Can select client from dropdown
- [ ] Date picker works correctly
- [ ] Due date validation (must be after invoice date)
- [ ] Default status is 'draft'
- [ ] Can add multiple line items
- [ ] Can add saved items to invoice
- [ ] Subtotal calculates correctly
- [ ] Tax applies correctly
- [ ] Discount (percentage) calculates correctly
- [ ] Discount (fixed amount) applies correctly
- [ ] Shipping adds to total correctly
- [ ] Adjustment (positive/negative) works
- [ ] Total = Subtotal + Tax - Discount + Shipping + Adjustment
- [ ] Can save as draft
- [ ] Can save and mark as sent

#### Invoice Line Items
- [ ] Can add new line item
- [ ] Description field required
- [ ] Quantity allows decimals (e.g., 2.5 hours)
- [ ] Rate allows decimals
- [ ] Line discount (percentage) works
- [ ] Line discount (fixed) works
- [ ] Amount = (Quantity × Rate) - Discount
- [ ] Can edit line item
- [ ] Can delete line item
- [ ] Totals recalculate when items change
- [ ] Can reorder line items (if feature exists)

#### View Invoice
- [ ] Invoice list displays all invoices
- [ ] Can filter by status (draft, sent, paid, overdue)
- [ ] Can filter by client
- [ ] Can filter by date range
- [ ] Can search by invoice number
- [ ] Status badges display correctly
- [ ] Overdue invoices marked visually
- [ ] Amount due displays correctly
- [ ] Can preview invoice PDF
- [ ] Preview shows all information correctly
- [ ] Company logo displays on preview
- [ ] Line items formatted correctly

#### Update Invoice
- [ ] Can edit draft invoice
- [ ] Can edit sent invoice (with warning)
- [ ] Cannot edit paid invoice (or restricted)
- [ ] Status changes work (draft → sent → paid)
- [ ] Can mark as paid manually
- [ ] Can mark as partially paid
- [ ] Updated timestamp changes
- [ ] Audit log records changes

#### Invoice Status Workflow
- [ ] Draft → Sent transition works
- [ ] Sent → Paid when full payment recorded
- [ ] Sent → Partial when partial payment recorded
- [ ] Overdue auto-detection (due_date < today && status = sent)
- [ ] Cannot skip from draft to paid without payment
- [ ] Status displayed correctly in all views

#### Invoice Payments
- [ ] Can add payment to invoice
- [ ] Payment date required
- [ ] Payment amount validates (cannot exceed invoice total)
- [ ] Payment method dropdown works
- [ ] Reference number optional
- [ ] Multiple payments allowed (partial payments)
- [ ] Invoice status updates when fully paid
- [ ] Invoice status shows partial when partially paid
- [ ] Amount due calculates correctly (total - sum of payments)
- [ ] Can edit payment
- [ ] Can delete payment (with confirmation)
- [ ] Deleting payment updates invoice status

#### Print/Export Invoice
- [ ] Can generate PDF
- [ ] PDF includes all invoice data
- [ ] PDF formatted correctly
- [ ] Can email invoice (if feature exists)
- [ ] Can download PDF
- [ ] Can print directly

#### Delete/Archive Invoice
- [ ] Can archive invoice
- [ ] Archived invoices hidden from main list
- [ ] Can view archived invoices
- [ ] Can restore from archive
- [ ] Can delete invoice (admin only)
- [ ] Deleting invoice deletes line items (cascade)
- [ ] Deleting invoice deletes payments (cascade)
- [ ] Confirmation required for delete

#### Invoice Edge Cases
- [ ] Invoice with 0 items (should prevent)
- [ ] Invoice with negative adjustment making total negative
- [ ] Invoice with 100% discount
- [ ] Invoice with very large amounts (999,999,999.99)
- [ ] Invoice with 50+ line items
- [ ] Duplicate invoice number prevention
- [ ] Future due dates
- [ ] Past invoice dates

---

### 3. Estimates (Quotes)

#### Create Estimate
- [ ] Can create new estimate
- [ ] Estimate number auto-generates
- [ ] Can select client
- [ ] Date and expiry date fields work
- [ ] Expiry date must be after estimate date
- [ ] Can add line items
- [ ] Calculations work correctly (subtotal, tax, total)
- [ ] Can save as draft
- [ ] Can save and mark as sent

#### View Estimate
- [ ] Estimate list displays all estimates
- [ ] Can filter by status
- [ ] Can filter by client
- [ ] Can preview estimate PDF
- [ ] Status displays correctly

#### Update Estimate
- [ ] Can edit estimate
- [ ] Can change status (draft → sent → accepted/declined)
- [ ] Can mark as expired manually
- [ ] Auto-expire detection (expiry_date < today)

#### Convert Estimate to Invoice
- [ ] Can convert accepted estimate to invoice
- [ ] All line items copied correctly
- [ ] Client copied correctly
- [ ] Estimate marked with invoice link
- [ ] Cannot convert already-converted estimate
- [ ] Cannot convert declined estimate

#### Delete/Archive Estimate
- [ ] Can archive estimate
- [ ] Can delete estimate
- [ ] Cascade deletes estimate items

---

### 4. Recurring Invoices

#### Create Recurring Invoice
- [ ] Can create recurring invoice template
- [ ] Can select client
- [ ] Frequency dropdown works (daily, weekly, monthly, etc.)
- [ ] Start date required
- [ ] End date optional (allows indefinite)
- [ ] Next generation date calculates correctly
- [ ] Can add line items
- [ ] Can set payment terms
- [ ] Template name optional
- [ ] Active by default

#### Automatic Generation
- [ ] Recurring invoices generate on schedule
- [ ] Generated invoice has unique number
- [ ] All line items copied correctly
- [ ] Client linked correctly
- [ ] Last generated date updates
- [ ] Next generation date increments correctly
- [ ] Respects end date (stops generating after end date)
- [ ] Inactive templates don't generate

#### Manage Recurring Invoices
- [ ] Can view all recurring invoice templates
- [ ] Can edit template
- [ ] Can pause/activate template
- [ ] Can delete template
- [ ] Can see generated invoices linked to template
- [ ] Can manually trigger generation (if feature exists)

#### Edge Cases
- [ ] Daily frequency over 30 days
- [ ] Monthly on 31st (handles months with fewer days)
- [ ] Leap year handling (Feb 29)
- [ ] Very far end dates (10 years)
- [ ] No end date (indefinite)

---

### 5. Credit Notes

#### Create Credit Note
- [ ] Can create credit note
- [ ] Credit note number auto-generates
- [ ] Must select related invoice
- [ ] Client auto-populates from invoice
- [ ] Date required
- [ ] Reason field optional
- [ ] Can add line items
- [ ] Calculations work correctly
- [ ] Credit amount cannot exceed invoice total (warning)
- [ ] Status defaults to draft

#### View Credit Note
- [ ] Credit note list displays all credit notes
- [ ] Can filter by status
- [ ] Can filter by client
- [ ] Can preview PDF
- [ ] Linked invoice shown

#### Apply Credit Note
- [ ] Can mark as issued
- [ ] Can mark as applied
- [ ] Applied credit reduces invoice balance (if feature exists)

#### Delete/Archive Credit Note
- [ ] Can archive credit note
- [ ] Can delete credit note
- [ ] Cascade deletes credit note items

---

### 6. Saved Items (Product/Service Catalog)

#### Create Saved Item
- [ ] Can create new saved item
- [ ] Item number optional (auto-generates if blank)
- [ ] Description required
- [ ] Rate (price) allows decimals
- [ ] Category dropdown/entry works
- [ ] Duplicate item number prevented

#### Use Saved Items
- [ ] Can add saved item to invoice
- [ ] Description and rate populate correctly
- [ ] Can modify rate after adding (doesn't affect saved item)
- [ ] Can add saved item to estimate
- [ ] Can add saved item to recurring invoice

#### Manage Saved Items
- [ ] Can edit saved item
- [ ] Editing saved item doesn't affect existing invoices
- [ ] Can delete saved item
- [ ] Can filter/search saved items by description
- [ ] Can filter by category

---

### 7. Payment Reminders

#### Reminder Templates
- [ ] Default templates exist (3 templates)
- [ ] Can create new reminder template
- [ ] Template variables work: {invoice_number}, {client_name}, {total}, {due_date}, {company_name}
- [ ] Subject and body required
- [ ] Days before/after due configurable
- [ ] Can activate/deactivate template
- [ ] Can edit template
- [ ] Can delete custom template
- [ ] Cannot delete system templates (or with warning)

#### Send Reminders
- [ ] Can send manual reminder from invoice
- [ ] Can select reminder template
- [ ] Variables replaced with actual values
- [ ] Email preview shows correctly
- [ ] Email sends successfully
- [ ] Reminder recorded in invoice_reminders table
- [ ] Reminder appears in reminder history

#### Automatic Reminders
- [ ] Automatic reminder system runs (if configured)
- [ ] Reminders sent based on template timing
- [ ] Only active templates used
- [ ] Only sent/overdue invoices receive reminders
- [ ] Duplicate reminders prevented (configurable interval)

---

### 8. Reports

#### Dashboard
- [ ] Total revenue displays correctly
- [ ] Outstanding invoices total correct
- [ ] Overdue invoices total correct
- [ ] Recent invoices list shows correctly
- [ ] Charts/graphs display (if applicable)
- [ ] Date range filter works

#### Invoice Reports
- [ ] Can generate invoice report by date range
- [ ] Can filter by client
- [ ] Can filter by status
- [ ] Totals calculate correctly
- [ ] Can export to CSV
- [ ] Can export to PDF

#### Payment Reports
- [ ] Payment history report shows all payments
- [ ] Can filter by date range
- [ ] Can filter by payment method
- [ ] Totals correct
- [ ] Can export

#### Client Reports
- [ ] Client statement shows all invoices for client
- [ ] Shows payments
- [ ] Shows outstanding balance
- [ ] Can export/print

#### Accounts Receivable Aging Report
- [ ] Shows invoices grouped by age (0-30, 31-60, 61-90, 90+ days)
- [ ] Totals per aging bucket correct
- [ ] Grand total matches outstanding invoices
- [ ] Can export

#### Tax Reports
- [ ] Tax collected report shows all tax amounts
- [ ] Can filter by date range
- [ ] Totals correct for tax filing

---

### 9. User Management (Multi-User Mode)

#### User Accounts
- [ ] Admin can create new user
- [ ] Username must be unique
- [ ] Email must be unique
- [ ] Password requirements enforced
- [ ] Role selection works (admin, user, viewer)
- [ ] Can activate/deactivate user
- [ ] Cannot deactivate yourself (logged-in admin)

#### User Permissions
- [ ] Admin has full access
- [ ] User can create/edit invoices, clients, estimates
- [ ] User cannot access user management
- [ ] Viewer has read-only access
- [ ] Viewer cannot create/edit/delete anything

#### Login/Logout
- [ ] Login page displays
- [ ] Valid credentials allow login
- [ ] Invalid credentials rejected
- [ ] Password visibility toggle works
- [ ] Session created on login
- [ ] Session expires after inactivity
- [ ] Logout destroys session
- [ ] Cannot access app without login

#### Password Management
- [ ] Can change own password
- [ ] Current password required
- [ ] New password validation
- [ ] Admin can reset user password
- [ ] First login password change prompt (for default admin)

---

### 10. Audit Log

#### Audit Logging
- [ ] User login recorded
- [ ] User logout recorded
- [ ] Failed login attempts recorded
- [ ] Invoice creation logged
- [ ] Invoice update logged
- [ ] Invoice deletion logged
- [ ] Client creation/update/delete logged
- [ ] Payment addition logged
- [ ] User creation logged (who created whom)

#### Audit Log Viewing
- [ ] Admin can view audit log
- [ ] Can filter by user
- [ ] Can filter by action type
- [ ] Can filter by date range
- [ ] Can search by resource ID
- [ ] Pagination works for large logs
- [ ] Can export audit log

---

### 11. Settings

#### Company Settings
- [ ] Can update company name
- [ ] Can update contact information
- [ ] Can upload logo
- [ ] Logo preview displays
- [ ] Can remove logo
- [ ] Changes save correctly

#### Invoice Settings
- [ ] Can change invoice prefix
- [ ] Can change tax rate
- [ ] Tax rate applies to new invoices
- [ ] Can change currency symbol
- [ ] Can change default payment terms

#### Theme Settings
- [ ] Can change theme color
- [ ] Theme applies immediately
- [ ] Theme persists after restart

#### Tab Configuration
- [ ] Can enable/disable tabs
- [ ] Can reorder tabs
- [ ] Changes apply immediately
- [ ] Disabled tabs hidden from navigation

#### Stripe Settings (if applicable)
- [ ] Can enter Stripe API keys
- [ ] Can enable/disable Stripe
- [ ] Stripe payment button appears on invoices when enabled
- [ ] Stripe payments process correctly

#### Database Settings
- [ ] Can view database location
- [ ] Can backup database
- [ ] Backup creates ZIP file
- [ ] Can restore from backup
- [ ] Restore works correctly
- [ ] Can export to CSV
- [ ] Can import from CSV

#### Multi-Database Support
- [ ] Can configure MySQL connection
- [ ] Can configure PostgreSQL connection
- [ ] Can configure MS SQL Server connection
- [ ] Connection test works
- [ ] Schema migration works
- [ ] Data exports to new database

---

## Integration Testing

### Database Integration
- [ ] SQLite database creates correctly
- [ ] Schema migrations apply successfully
- [ ] Foreign keys enforced
- [ ] Cascade deletes work correctly
- [ ] Indexes improve query performance
- [ ] Transactions work (rollback on error)

### Multi-Database Support
- [ ] Can switch to MySQL
- [ ] Can switch to PostgreSQL
- [ ] Can switch to MS SQL Server
- [ ] Schema converts correctly
- [ ] Data migrates without loss
- [ ] All features work on each database type

### PDF Generation
- [ ] PDF library loads correctly
- [ ] Invoices generate as PDF
- [ ] Estimates generate as PDF
- [ ] Credit notes generate as PDF
- [ ] PDFs display correctly in viewer
- [ ] PDFs print correctly

### Email Integration (if applicable)
- [ ] Email configuration works
- [ ] Can send test email
- [ ] Invoice emails send with PDF attachment
- [ ] Reminder emails send correctly
- [ ] Email templates render correctly

### Backup/Restore Integration
- [ ] Backup creates complete database snapshot
- [ ] Backup includes all tables
- [ ] Backup compresses correctly
- [ ] Restore recreates database exactly
- [ ] No data loss in backup/restore cycle

---

## Performance Testing

### Load Testing
- [ ] 100 clients load quickly
- [ ] 500 invoices load quickly
- [ ] 1000 invoice items handle correctly
- [ ] Search performs well with large dataset
- [ ] Reports generate in reasonable time (<5 seconds for 1000 invoices)

### Response Time
- [ ] Invoice creation < 1 second
- [ ] Client search < 500ms
- [ ] Invoice list loads < 2 seconds (100 invoices)
- [ ] PDF generation < 3 seconds

### Memory Usage
- [ ] Application doesn't leak memory with extended use
- [ ] Large PDF generation doesn't crash app
- [ ] Bulk import handles 1000+ records

---

## Security Testing

### Authentication
- [ ] Cannot access app without login
- [ ] Session timeout works
- [ ] Logout completely ends session
- [ ] Session hijacking prevented (secure tokens)

### Authorization
- [ ] Role permissions enforced
- [ ] Cannot escalate privileges
- [ ] Cannot access other users' data (if multi-tenant)

### Input Validation
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS attacks prevented (input sanitization)
- [ ] File upload validation (logo only allows images)
- [ ] Path traversal prevented

### Data Protection
- [ ] Passwords hashed (bcrypt)
- [ ] Session tokens secure
- [ ] Sensitive data not in logs
- [ ] Audit log doesn't expose passwords

### Database Security
- [ ] Database file permissions correct
- [ ] Backup files protected
- [ ] Cannot access database directly from web (if web version)

---

## User Acceptance Testing (UAT)

### End-to-End Scenarios

#### Scenario 1: New Client and Invoice
- [ ] Create new client: "Acme Corp"
- [ ] Create invoice for Acme Corp
- [ ] Add 3 line items
- [ ] Apply 10% discount
- [ ] Generate PDF
- [ ] Mark as sent
- [ ] Record payment
- [ ] Verify invoice shows as paid

#### Scenario 2: Estimate to Invoice Conversion
- [ ] Create new estimate for existing client
- [ ] Add 5 line items
- [ ] Save and send estimate
- [ ] Mark estimate as accepted
- [ ] Convert to invoice
- [ ] Verify invoice created with same items
- [ ] Generate and send invoice

#### Scenario 3: Recurring Invoice
- [ ] Create monthly recurring invoice template
- [ ] Set to start next month
- [ ] Add line items
- [ ] Wait for auto-generation (or manually trigger)
- [ ] Verify invoice created automatically
- [ ] Verify template updated with next generation date

#### Scenario 4: Overdue Invoice with Reminders
- [ ] Create invoice with due date in past (or modify existing)
- [ ] Verify shows as overdue
- [ ] Send payment reminder
- [ ] Verify reminder logged
- [ ] Record payment
- [ ] Verify status changes to paid

#### Scenario 5: Credit Note Workflow
- [ ] Select paid invoice
- [ ] Create credit note (partial refund)
- [ ] Add items being credited
- [ ] Issue credit note
- [ ] Generate PDF
- [ ] Send to client

#### Scenario 6: Multi-User Workflow
- [ ] Admin creates new user account
- [ ] User logs in
- [ ] User creates invoice
- [ ] Viewer logs in
- [ ] Viewer can view but not edit invoice
- [ ] Admin views audit log showing all actions

---

## Bug Reporting Template

When a test fails, document the bug using this template:

**Bug ID:** [Unique identifier]
**Date Found:** [Date]
**Found By:** [Tester name]
**Severity:** [Critical / High / Medium / Low]

**Test Case:** [Which test case failed]
**Module:** [Client Management / Invoice / Estimates / etc.]

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]

**Screenshots:** [Attach if applicable]
**Error Messages:** [Copy any error messages]

**Environment:**
- OS: [Windows / Mac / Linux]
- Database: [SQLite / MySQL / PostgreSQL / MS SQL]
- Version: [App version]

**Additional Notes:** [Any other relevant information]

---

## Test Data Reference

### Test Clients (10 clients)
1. Acme Corporation - Large corporate client
2. Smith & Associates - Medium law firm
3. Tech Innovations LLC - Software company
4. Green Earth Landscaping - Service business
5. Creative Designs Studio - Design agency
6. Metro Construction Co - Construction company
7. Healthy Living Clinic - Healthcare
8. Fast Delivery Services - Logistics
9. Elite Consulting Group - Consulting firm
10. Sunrise Bakery - Retail business

### Test Invoice Statuses
- 5 Draft invoices
- 8 Sent invoices
- 5 Paid invoices
- 2 Overdue invoices

### Test Payment Methods
- Cash
- Check
- Bank Transfer
- Credit Card
- PayPal
- Stripe

### Test Users (3 users)
1. admin / admin123 - Administrator
2. testuser / test123 - Standard User
3. viewer / view123 - Viewer Only

**IMPORTANT:** Change all test passwords before production use!

---

## Testing Sign-off

### Test Completion
- [ ] All functional tests passed
- [ ] All integration tests passed
- [ ] Performance tests acceptable
- [ ] Security tests passed
- [ ] UAT scenarios completed
- [ ] All critical bugs resolved
- [ ] All high-priority bugs resolved

### Approval

**Tested By:** _____________________ **Date:** _________

**Approved By:** _____________________ **Date:** _________

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## Appendix: Quick Test Commands

### Database Verification
```sql
-- Count all records
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'Payments', COUNT(*) FROM payments
UNION ALL SELECT 'Estimates', COUNT(*) FROM estimates;

-- Check data integrity
SELECT i.invoice_number, c.name as client_name, i.total, SUM(p.amount) as paid
FROM invoices i
LEFT JOIN clients c ON i.client_id = c.id
LEFT JOIN payments p ON i.invoice_id = p.id
GROUP BY i.id;
```

### Cleanup Test Data
```sql
-- WARNING: This will delete all test data!
DELETE FROM invoices WHERE invoice_number LIKE 'TEST-%';
DELETE FROM clients WHERE email LIKE '%@testclient.com';
```

---

**End of Testing Documentation**
