# InvoicePro Database Schema Summary

This document provides a comprehensive overview of all database tables in the InvoicePro application. Use this as a reference when integrating with other applications.

**Database Type:** SQLite (with support for MySQL, PostgreSQL, MS SQL Server via adapter)
**Total Tables:** 15 active tables
**Last Updated:** 2025-11-17

---

## Table of Contents
1. [Settings](#1-settings)
2. [Clients](#2-clients)
3. [Invoices](#3-invoices)
4. [Invoice Items](#4-invoice_items)
5. [Payments](#5-payments)
6. [Recurring Invoices](#6-recurring_invoices)
7. [Recurring Invoice Items](#7-recurring_invoice_items)
8. [Estimates](#8-estimates)
9. [Estimate Items](#9-estimate_items)
10. [Credit Notes](#10-credit_notes)
11. [Credit Note Items](#11-credit_note_items)
12. [Saved Items](#12-saved_items)
13. [Reminder Templates](#13-reminder_templates)
14. [Invoice Reminders](#14-invoice_reminders)
15. [Users](#15-users)
16. [Sessions](#16-sessions)
17. [Audit Log](#17-audit_log)

---

## 1. settings

**Purpose:** Application configuration and company information storage

**Type:** Singleton table (only 1 row, id=1)

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | PRIMARY KEY | Always 1 |
| company_name | TEXT | 'Your Company' | Business name |
| company_email | TEXT | 'info@company.com' | Business email |
| company_phone | TEXT | '' | Business phone number |
| company_address | TEXT | '' | Street address |
| company_city | TEXT | '' | City |
| company_state | TEXT | '' | State/Province |
| company_zip | TEXT | '' | Postal code |
| logo_url | TEXT | '' | Path to company logo |
| invoice_prefix | TEXT | 'INV-' | Prefix for invoice numbers |
| tax_rate | REAL | 0.0 | Default tax rate (percentage) |
| currency_symbol | TEXT | '$' | Currency symbol to display |
| payment_terms | TEXT | 'Payment due within 30 days' | Default payment terms text |
| bank_details | TEXT | '' | Banking information for invoices |
| theme | TEXT | 'blue' | UI theme color |
| tab_configuration | TEXT | NULL | JSON array of tab visibility/order settings |
| stripe_secret_key | TEXT | '' | Stripe API secret key |
| stripe_publishable_key | TEXT | '' | Stripe API publishable key |
| stripe_enabled | INTEGER | 0 | Enable/disable Stripe payments (0=off, 1=on) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:** None

**Indexes:** None

---

## 2. clients

**Purpose:** Customer/client information storage

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| customer_number | TEXT | NULL | Unique customer identifier |
| name | TEXT | NOT NULL | Client/company name |
| email | TEXT | NOT NULL | Client email address |
| phone | TEXT | '' | Phone number |
| address | TEXT | '' | Street address |
| city | TEXT | '' | City |
| state | TEXT | '' | State/Province |
| zip | TEXT | '' | Postal code |
| notes | TEXT | '' | Internal notes about client |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:**
- One-to-many with `invoices` (client can have multiple invoices)
- One-to-many with `recurring_invoices` (client can have multiple recurring invoices)
- One-to-many with `estimates` (client can have multiple estimates)
- One-to-many with `credit_notes` (client can have multiple credit notes)

**Indexes:**
- `idx_clients_email` on `email`
- `idx_clients_customer_number` on `customer_number` (UNIQUE, when NOT NULL)

---

## 3. invoices

**Purpose:** Invoice header information and totals

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| invoice_number | TEXT | NOT NULL UNIQUE | Unique invoice number |
| client_id | INTEGER | NOT NULL | Foreign key to clients table |
| date | TEXT | NOT NULL | Invoice issue date (ISO format) |
| due_date | TEXT | NOT NULL | Payment due date (ISO format) |
| status | TEXT | 'draft' | Status: draft, sent, paid, overdue, partial |
| subtotal | REAL | 0 | Sum of all line items before tax/discounts |
| tax | REAL | 0 | Tax amount |
| discount_type | TEXT | 'none' | Discount type: none, percentage, fixed |
| discount_value | REAL | 0 | Discount value (% or amount) |
| discount_amount | REAL | 0 | Calculated discount amount |
| shipping | REAL | 0 | Shipping/delivery charges |
| adjustment | REAL | 0 | Manual adjustment amount (+/-) |
| adjustment_label | TEXT | '' | Label for adjustment line |
| total | REAL | 0 | Final total amount |
| notes | TEXT | '' | Notes visible on invoice |
| payment_terms | TEXT | '' | Payment terms for this invoice |
| archived | INTEGER | 0 | Archive status (0=active, 1=archived) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-one with `clients` (invoice belongs to one client)
- One-to-many with `invoice_items` (invoice has multiple line items)
- One-to-many with `payments` (invoice can have multiple payments)
- One-to-many with `credit_notes` (invoice can have credit notes)
- One-to-many with `invoice_reminders` (invoice can have multiple reminders)
- One-to-one with `estimates` (estimate can be converted to invoice)

**Indexes:**
- `idx_invoices_client_id` on `client_id`
- `idx_invoices_status` on `status`
- `idx_invoices_archived` on `archived`

---

## 4. invoice_items

**Purpose:** Line items for invoices (products/services sold)

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| invoice_id | INTEGER | NOT NULL | Foreign key to invoices table |
| description | TEXT | NOT NULL | Product/service description |
| quantity | REAL | 1 | Quantity (supports decimals) |
| rate | REAL | 0 | Price per unit |
| discount_type | TEXT | 'none' | Item-level discount: none, percentage, fixed |
| discount_value | REAL | 0 | Discount value (% or amount) |
| discount_amount | REAL | 0 | Calculated discount amount |
| amount | REAL | 0 | Line total (quantity × rate - discount) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `invoices` (item belongs to one invoice)

**Cascade Behavior:**
- DELETE CASCADE: Deleting an invoice deletes all its items

**Indexes:**
- `idx_invoice_items_invoice_id` on `invoice_id`

---

## 5. payments

**Purpose:** Track payments received against invoices

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| invoice_id | INTEGER | NOT NULL | Foreign key to invoices table |
| amount | REAL | NOT NULL | Payment amount received |
| payment_date | TEXT | NOT NULL | Date payment was received (ISO format) |
| payment_method | TEXT | 'Other' | Method: Cash, Check, Bank Transfer, Credit Card, PayPal, Stripe, Other |
| reference_number | TEXT | '' | Transaction/check number |
| notes | TEXT | '' | Internal payment notes |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `invoices` (payment applies to one invoice)

**Cascade Behavior:**
- DELETE CASCADE: Deleting an invoice deletes all its payments

**Indexes:**
- `idx_payments_invoice_id` on `invoice_id`

---

## 6. recurring_invoices

**Purpose:** Templates for automatically generating recurring invoices

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| client_id | INTEGER | NOT NULL | Foreign key to clients table |
| frequency | TEXT | NOT NULL | Frequency: daily, weekly, biweekly, monthly, quarterly, yearly |
| start_date | TEXT | NOT NULL | When to start generating (ISO format) |
| end_date | TEXT | NULL | When to stop generating (NULL = indefinite) |
| last_generated | TEXT | NULL | Date of last invoice generation |
| next_generation | TEXT | NOT NULL | Date of next scheduled generation |
| template_name | TEXT | '' | Descriptive name for template |
| subtotal | REAL | 0 | Template subtotal |
| tax | REAL | 0 | Template tax amount |
| total | REAL | 0 | Template total |
| notes | TEXT | '' | Notes to include in generated invoices |
| payment_terms | TEXT | '' | Payment terms for generated invoices |
| active | INTEGER | 1 | Active status (0=paused, 1=active) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-one with `clients` (recurring invoice belongs to one client)
- One-to-many with `recurring_invoice_items` (template has multiple line items)

**Indexes:**
- `idx_recurring_invoices_client_id` on `client_id`
- `idx_recurring_invoices_active` on `active`

---

## 7. recurring_invoice_items

**Purpose:** Line items for recurring invoice templates

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| recurring_invoice_id | INTEGER | NOT NULL | Foreign key to recurring_invoices table |
| description | TEXT | NOT NULL | Product/service description |
| quantity | REAL | 1 | Quantity (supports decimals) |
| rate | REAL | 0 | Price per unit |
| amount | REAL | 0 | Line total (quantity × rate) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `recurring_invoices` (item belongs to one template)

**Cascade Behavior:**
- DELETE CASCADE: Deleting a recurring invoice deletes all its items

**Indexes:**
- `idx_recurring_invoice_items_recurring_invoice_id` on `recurring_invoice_id`

---

## 8. estimates

**Purpose:** Price quotes/estimates for potential work

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| estimate_number | TEXT | NOT NULL UNIQUE | Unique estimate number |
| client_id | INTEGER | NOT NULL | Foreign key to clients table |
| date | TEXT | NOT NULL | Estimate issue date (ISO format) |
| expiry_date | TEXT | NOT NULL | Expiration date (ISO format) |
| status | TEXT | 'draft' | Status: draft, sent, accepted, declined, expired |
| subtotal | REAL | 0 | Sum of all line items |
| tax | REAL | 0 | Tax amount |
| total | REAL | 0 | Total amount |
| notes | TEXT | '' | Notes visible on estimate |
| terms | TEXT | '' | Terms and conditions |
| converted_to_invoice_id | INTEGER | NULL | Foreign key to invoices if converted |
| archived | INTEGER | 0 | Archive status (0=active, 1=archived) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-one with `clients` (estimate belongs to one client)
- One-to-many with `estimate_items` (estimate has multiple line items)
- One-to-one with `invoices` (estimate can be converted to one invoice)

**Indexes:**
- `idx_estimates_client_id` on `client_id`
- `idx_estimates_status` on `status`
- `idx_estimates_archived` on `archived`

---

## 9. estimate_items

**Purpose:** Line items for estimates

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| estimate_id | INTEGER | NOT NULL | Foreign key to estimates table |
| description | TEXT | NOT NULL | Product/service description |
| quantity | REAL | 1 | Quantity (supports decimals) |
| rate | REAL | 0 | Price per unit |
| amount | REAL | 0 | Line total (quantity × rate) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `estimates` (item belongs to one estimate)

**Cascade Behavior:**
- DELETE CASCADE: Deleting an estimate deletes all its items

**Indexes:**
- `idx_estimate_items_estimate_id` on `estimate_id`

---

## 10. credit_notes

**Purpose:** Credit memos for refunds, returns, or invoice adjustments

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| credit_note_number | TEXT | NOT NULL UNIQUE | Unique credit note number |
| invoice_id | INTEGER | NOT NULL | Foreign key to related invoice |
| client_id | INTEGER | NOT NULL | Foreign key to clients table |
| date | TEXT | NOT NULL | Credit note issue date (ISO format) |
| reason | TEXT | '' | Reason for credit note |
| subtotal | REAL | 0 | Sum of all line items |
| tax | REAL | 0 | Tax amount credited |
| total | REAL | 0 | Total credit amount |
| status | TEXT | 'draft' | Status: draft, issued, applied |
| notes | TEXT | '' | Notes visible on credit note |
| archived | INTEGER | 0 | Archive status (0=active, 1=archived) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-one with `invoices` (credit note relates to one invoice)
- Many-to-one with `clients` (credit note belongs to one client)
- One-to-many with `credit_note_items` (credit note has multiple line items)

**Indexes:**
- `idx_credit_notes_invoice_id` on `invoice_id`
- `idx_credit_notes_client_id` on `client_id`
- `idx_credit_notes_status` on `status`
- `idx_credit_notes_archived` on `archived`

---

## 11. credit_note_items

**Purpose:** Line items for credit notes

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| credit_note_id | INTEGER | NOT NULL | Foreign key to credit_notes table |
| description | TEXT | NOT NULL | Product/service being credited |
| quantity | REAL | 1 | Quantity (supports decimals) |
| rate | REAL | 0 | Price per unit |
| amount | REAL | 0 | Line total (quantity × rate) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `credit_notes` (item belongs to one credit note)

**Cascade Behavior:**
- DELETE CASCADE: Deleting a credit note deletes all its items

**Indexes:**
- `idx_credit_note_items_credit_note_id` on `credit_note_id`

---

## 12. saved_items

**Purpose:** Reusable catalog of products/services for quick invoice creation

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| item_number | TEXT | NULL | Unique SKU/product code |
| description | TEXT | NOT NULL | Product/service description |
| rate | REAL | 0 | Default price per unit |
| category | TEXT | 'General' | Item category for organization |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Relationships:** None (referenced when creating invoice/estimate items)

**Indexes:**
- `idx_saved_items_item_number` on `item_number` (UNIQUE, when NOT NULL)

---

## 13. reminder_templates

**Purpose:** Email templates for automated/manual invoice reminders

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | PRIMARY KEY | Primary key |
| name | TEXT | NOT NULL | Template name for identification |
| subject | TEXT | NOT NULL | Email subject line (supports variables) |
| body | TEXT | NOT NULL | Email body text (supports variables) |
| days_before_due | INTEGER | 0 | Trigger timing (positive = before due, negative = after due/overdue) |
| active | INTEGER | 1 | Active status (0=disabled, 1=enabled) |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TEXT | CURRENT_TIMESTAMP | Record update timestamp |

**Template Variables:**
- `{invoice_number}` - Invoice number
- `{client_name}` - Client name
- `{total}` - Invoice total with currency
- `{due_date}` - Due date
- `{company_name}` - Your company name

**Default Templates:**
1. Payment Due Soon (3 days before due)
2. Payment Overdue (7 days after due)
3. Second Reminder (14 days after due)

**Relationships:**
- One-to-many with `invoice_reminders` (template can be used for multiple reminders)

**Indexes:**
- `idx_reminder_templates_active` on `active`

---

## 14. invoice_reminders

**Purpose:** Track sent payment reminders for invoices

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| invoice_id | INTEGER | NOT NULL | Foreign key to invoices table |
| template_id | INTEGER | NULL | Foreign key to reminder_templates (NULL if manual) |
| sent_date | TEXT | NOT NULL | Date reminder was sent (ISO format) |
| reminder_type | TEXT | 'manual' | Type: manual, automatic |
| days_overdue | INTEGER | 0 | Days overdue when sent (negative = before due) |
| status | TEXT | 'sent' | Status: sent, bounced, opened |
| notes | TEXT | '' | Internal notes about reminder |
| created_at | TEXT | CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships:**
- Many-to-one with `invoices` (reminder relates to one invoice)
- Many-to-one with `reminder_templates` (reminder may use one template)

**Cascade Behavior:**
- DELETE CASCADE: Deleting an invoice deletes all its reminders

**Indexes:**
- `idx_invoice_reminders_invoice_id` on `invoice_id`
- `idx_invoice_reminders_template_id` on `template_id`
- `idx_invoice_reminders_sent_date` on `sent_date`

---

## 15. users

**Purpose:** Multi-user authentication and authorization

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| username | TEXT | UNIQUE NOT NULL | Login username |
| email | TEXT | UNIQUE NOT NULL | Email address |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| full_name | TEXT | '' | Display name |
| role | TEXT | 'user' | Role: admin, user, viewer |
| active | INTEGER | 1 | Account status (0=disabled, 1=active) |
| created_at | TEXT | CURRENT_TIMESTAMP | Account creation timestamp |
| last_login | TEXT | NULL | Last successful login timestamp |
| created_by | INTEGER | NULL | Foreign key to user who created this account |

**Role Permissions:**
- `admin` - Full access to all features including user management
- `user` - Can create/edit invoices, clients, etc. but not manage users
- `viewer` - Read-only access to data

**Default Account:**
- Username: `admin`
- Password: `admin123` (MUST be changed on first login)
- Role: `admin`

**Relationships:**
- Self-referential: `created_by` references `users.id`
- One-to-many with `sessions` (user can have multiple active sessions)
- One-to-many with `audit_log` (user actions are logged)

**Indexes:**
- `idx_users_username` on `username`
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_active` on `active`

---

## 16. sessions

**Purpose:** Track active user sessions for authentication

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | TEXT | PRIMARY KEY | Session UUID |
| user_id | INTEGER | NOT NULL | Foreign key to users table |
| token | TEXT | UNIQUE NOT NULL | Session authentication token |
| expires_at | TEXT | NOT NULL | Session expiration timestamp (ISO format) |
| ip_address | TEXT | '' | IP address of session |
| user_agent | TEXT | '' | Browser/client user agent string |
| created_at | TEXT | CURRENT_TIMESTAMP | Session creation timestamp |

**Relationships:**
- Many-to-one with `users` (session belongs to one user)

**Cascade Behavior:**
- DELETE CASCADE: Deleting a user deletes all their sessions

**Indexes:**
- `idx_sessions_user_id` on `user_id`
- `idx_sessions_token` on `token`
- `idx_sessions_expires_at` on `expires_at`

---

## 17. audit_log

**Purpose:** Comprehensive audit trail of all user actions

| Column Name | Type | Default | Description |
|------------|------|---------|-------------|
| id | INTEGER | AUTOINCREMENT | Primary key |
| user_id | INTEGER | NULL | Foreign key to users table (NULL for system actions) |
| username | TEXT | 'system' | Username snapshot (preserved if user deleted) |
| action | TEXT | NOT NULL | Action performed (e.g., 'create_invoice', 'delete_client') |
| resource_type | TEXT | '' | Type of resource (e.g., 'invoice', 'client') |
| resource_id | INTEGER | NULL | ID of affected resource |
| details | TEXT | '' | JSON or text details about the action |
| ip_address | TEXT | '' | IP address of user |
| created_at | TEXT | CURRENT_TIMESTAMP | When action occurred |

**Common Actions:**
- `create_invoice`, `update_invoice`, `delete_invoice`
- `create_client`, `update_client`, `delete_client`
- `add_payment`, `delete_payment`
- `send_reminder`
- `login`, `logout`, `failed_login`
- `create_user`, `update_user`, `delete_user`

**Relationships:**
- Many-to-one with `users` (log entry relates to one user)

**Cascade Behavior:**
- DELETE SET NULL: Deleting a user sets `user_id` to NULL but preserves `username`

**Indexes:**
- `idx_audit_log_user_id` on `user_id`
- `idx_audit_log_resource_type` on `resource_type`
- `idx_audit_log_created_at` on `created_at`

---

## Entity Relationship Diagram (Text Format)

```
clients (1) ----< (M) invoices
clients (1) ----< (M) recurring_invoices
clients (1) ----< (M) estimates
clients (1) ----< (M) credit_notes

invoices (1) ----< (M) invoice_items
invoices (1) ----< (M) payments
invoices (1) ----< (M) invoice_reminders
invoices (1) ----< (M) credit_notes
invoices (1) ---< (1) estimates (converted_to_invoice_id)

recurring_invoices (1) ----< (M) recurring_invoice_items

estimates (1) ----< (M) estimate_items

credit_notes (1) ----< (M) credit_note_items

reminder_templates (1) ----< (M) invoice_reminders

users (1) ----< (M) sessions
users (1) ----< (M) audit_log
users (1) ---< (M) users (created_by - self-referential)
```

---

## Data Flow Overview

### Invoice Lifecycle
1. **Draft Creation**: Create invoice with status='draft'
2. **Add Items**: Create invoice_items records
3. **Send to Client**: Update status='sent'
4. **Payment Received**: Create payment record, update status='paid' or 'partial'
5. **Overdue**: Automatically detected by comparing due_date to current date
6. **Reminders**: Create invoice_reminders entries when reminders sent
7. **Credit Notes**: If needed, create credit_note linked to invoice
8. **Archive**: Set archived=1 when no longer active

### Estimate to Invoice Conversion
1. Create estimate with items
2. Client accepts estimate
3. System creates new invoice copying all estimate data
4. Links estimate to invoice via converted_to_invoice_id

### Recurring Invoice Generation
1. Create recurring_invoice template with items
2. System checks next_generation date daily
3. Creates new invoice automatically from template
4. Updates last_generated and next_generation dates

---

## Database Statistics Queries

### Count All Records
```sql
SELECT
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM invoices) as invoices,
  (SELECT COUNT(*) FROM estimates) as estimates,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM credit_notes) as credit_notes,
  (SELECT COUNT(*) FROM recurring_invoices) as recurring_invoices,
  (SELECT COUNT(*) FROM saved_items) as saved_items,
  (SELECT COUNT(*) FROM users) as users;
```

### Revenue Summary
```sql
SELECT
  SUM(total) as total_invoiced,
  SUM(CASE WHEN status='paid' THEN total ELSE 0 END) as total_paid,
  SUM(CASE WHEN status='overdue' THEN total ELSE 0 END) as total_overdue,
  COUNT(*) as invoice_count
FROM invoices
WHERE archived = 0;
```

---

## Integration Guidelines

### When Integrating with Other Applications

1. **Primary Keys**: All tables use INTEGER AUTOINCREMENT for id (except settings which uses id=1, and sessions which uses TEXT UUID)

2. **Foreign Keys**: Enabled by default in SQLite, ensure CASCADE behavior is respected

3. **Timestamps**: All timestamps use ISO 8601 format (YYYY-MM-DD HH:MM:SS) stored as TEXT

4. **Decimal Values**: Financial amounts use REAL type, recommend rounding to 2 decimal places for currency

5. **Status Fields**: Use exact string values as defined (case-sensitive)

6. **Unique Constraints**:
   - invoice_number (invoices)
   - estimate_number (estimates)
   - credit_note_number (credit_notes)
   - customer_number (clients) - when not NULL
   - item_number (saved_items) - when not NULL
   - username, email (users)
   - token (sessions)

7. **Archive Pattern**: Soft delete using archived=1 instead of hard deletes (preserves history)

8. **Multi-Database Support**: Use the sqlServerAdapter.js for MySQL/PostgreSQL/MS SQL Server compatibility

---

## Backup and Restore

The application includes built-in backup/restore functionality:
- Location: `/database/backup.js`
- Format: ZIP file containing CSV exports of all tables + metadata.json
- Retention: Last 30 backups kept automatically
- Tables backed up: All tables listed in this document

---

## Security Considerations

1. **Password Storage**: Uses bcrypt hashing (password_hash in users table)
2. **Session Management**: Token-based with expiration (sessions table)
3. **Audit Trail**: All user actions logged (audit_log table)
4. **Role-Based Access**: Three roles defined (admin, user, viewer)
5. **Default Admin**: MUST change default password on first login

---

## Version History

- **v1.0**: Initial schema with 15 tables
- **v1.1**: Added customer_number to clients, item_number to saved_items
- **v1.2**: Added tab_configuration and Stripe settings to settings table
- **v1.3**: Current version with multi-database support

---

**For questions or integration assistance, refer to:**
- `/database/db.js` - Main database operations
- `/database/schema.sql` - Complete schema definition
- `/database/sqlServerAdapter.js` - Multi-database adapter
- `/database/backup.js` - Backup/restore functionality
