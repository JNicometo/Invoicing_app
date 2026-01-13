# Invoice Test Data Generator

Generate realistic test data for performance testing your invoicing application.

## Features

- ✅ Realistic business names and contact information
- ✅ Proper data relationships (items sum to invoice totals, payments match invoices)
- ✅ Distribution patterns (some clients have many invoices, some have few)
- ✅ Status variety (paid, sent, overdue, partial, draft)
- ✅ Validation checks before writing files
- ✅ Fast generation (10k+ invoices in under 30 seconds)
- ✅ Memory efficient
- ✅ Command-line options for customization

## Installation

```bash
npm install
```

## Quick Start

Generate default dataset (500 clients, 10,000 invoices):

```bash
npm run generate
```

Or directly:

```bash
node generate-data.js
```

## Usage

### Default Configuration

```bash
node generate-data.js
```

Generates:
- 500 clients
- 100 saved items (reusable product/service catalog)
- 10,000 invoices
- ~25,000 invoice line items (avg 2.5 per invoice)
- ~8,000 payments (80% of paid/partial invoices)

### Custom Amounts

```bash
# Generate 1,000 clients and 50,000 invoices
node generate-data.js --clients 1000 --invoices 50000

# Generate 100 clients and 1,000 invoices (for quick testing)
node generate-data.js --clients 100 --invoices 1000

# Generate with 200 saved items
node generate-data.js --savedItems 200
```

### Custom Output Directory

```bash
node generate-data.js --output ./my-test-data
```

### Combine Options

```bash
node generate-data.js --clients 2000 --invoices 100000 --savedItems 200 --output ./large-dataset
```

## Generated Files

All files are created in the `./output` directory (or your specified directory):

### clients.csv
```csv
id,name,email,phone,address,city,state,zip,created_at
1,Balistreri Services,info@balistreriservices.com,(468) 760-9015,34253 Cedar Close,Haverhill,VT,07643,2025-01-18
```

**Fields:**
- `id`: Sequential (1-N)
- `name`: Realistic company names (various business name styles)
- `email`: Based on company name
- `phone`: US format (xxx) xxx-xxxx
- `address`, `city`, `state`, `zip`: Realistic US addresses
- `created_at`: Random dates in last 2 years

### saved_items.csv
```csv
id,description,rate,category,sku,barcode,unit_of_measure,cost_price,markup_percentage,taxable,is_active,notes,created_at,updated_at
1,Business Consulting - Hourly,280.87,Consulting,DM4GLHBW,332933283907,Hour,126.39,122.22,1,1,Premium offering,2024-10-13,2025-06-03
```

**Fields:**
- `id`: Sequential (1-N)
- `description`: Service/product name
- `rate`: Price per unit
- `category`: Consulting, Design, Development, Marketing, Photography, Video, Writing, Support, Products
- `sku`: 8-character alphanumeric code
- `barcode`: 12-digit numeric barcode
- `unit_of_measure`: Hour, Project, Session, Month, License, etc.
- `cost_price`: Internal cost (30-60% of rate)
- `markup_percentage`: Profit margin percentage
- `taxable`: 1 (taxable) or 0 (tax-exempt)
- `is_active`: 1 (active) or 0 (inactive)
- `notes`: Optional notes
- `created_at`, `updated_at`: Timestamps

**Purpose:** Saved items are your reusable product/service catalog. They speed up invoice creation by providing pre-defined items you can quickly add to invoices instead of typing descriptions and prices every time.

### invoices.csv
```csv
id,invoice_number,client_id,date,due_date,status,subtotal,tax,total,notes,created_at
1,INV-2025-00001,6,2025-12-24,2026-01-23,sent,1520.72,121.66,1642.38,,2025-12-24
```

**Fields:**
- `id`: Sequential (1-N)
- `invoice_number`: Format "INV-YYYY-XXXXX"
- `client_id`: References clients.csv
- `date`, `due_date`: Net 30 terms
- `status`: draft, sent, paid, overdue, partial
  - 60% paid
  - 20% sent
  - 10% overdue
  - 5% partial
  - 5% draft
- `subtotal`, `tax`, `total`: Realistic amounts ($100-$5000 typical)
- `notes`: Optional notes (30% of invoices)
- `created_at`: Same as date

### invoice_items.csv
```csv
id,invoice_id,description,quantity,rate,amount
1,1,Photography Services,15,59.51,892.70
2,1,Design Services,5,125.50,627.50
```

**Fields:**
- `id`: Sequential (1-N)
- `invoice_id`: References invoices.csv
- `description`: Realistic service descriptions
- `quantity`: 1-20 (usually hours or fixed items)
- `rate`: $50-$250 per unit
- `amount`: quantity × rate

**Note:** All line items for an invoice sum to the invoice subtotal!

### payments.csv
```csv
id,invoice_id,payment_date,amount,payment_method,notes,created_at
1,1,2024-02-10,1350.00,Bank Transfer,,2024-02-10
```

**Fields:**
- `id`: Sequential (1-N)
- `invoice_id`: References invoices.csv (only paid/partial invoices)
- `payment_date`: Between due_date and today
- `amount`: Full amount for "paid" invoices, partial for "partial" invoices
- `payment_method`: Bank Transfer, Credit Card, PayPal, Check, Cash
- `notes`: Optional (20% of payments)

## Data Characteristics

### Realistic Distributions

- **Client Activity**:
  - 10% of clients are "heavy" users (many invoices)
  - 20% are regular users (moderate invoices)
  - 70% are occasional users (few invoices)

- **Invoice Amounts**:
  - 5% small ($50-$200)
  - 10% low ($200-$500)
  - 55% mid-range ($500-$2000) ← most common
  - 25% high ($2000-$5000)
  - 5% very high ($5000-$15000)

- **Line Items per Invoice**: Average 2.5 (ranges 1-5)

- **Payment Coverage**: ~80% of paid/partial invoices have recorded payments

### Data Integrity

The generator ensures:

✅ All invoice line items sum exactly to invoice subtotal (within 2¢ rounding)
✅ All payments for "paid" invoices equal the invoice total
✅ No duplicate IDs across all entities
✅ Dates are realistic (not in future, not before 2020)
✅ Invoice status correctly reflects due dates (auto-marks "sent" as "overdue" if past due)

### Validation

The script performs automatic validation before writing files:

```
Validating data...
✓ All validation checks passed
```

If issues are found, warnings are displayed (but files are still generated).

## Import to Your App

### Order Matters!

Import files in this order to maintain referential integrity:

1. **clients.csv** (no dependencies)
2. **saved_items.csv** (no dependencies)
3. **invoices.csv** (references clients)
4. **invoice_items.csv** (references invoices)
5. **payments.csv** (references invoices)

### Import Instructions

1. Open your invoicing app
2. Go to **Settings → Import** (or your import interface)
3. Select CSV files from `./output` directory
4. Import in the order shown above
5. Wait for each import to complete before importing the next file

## Performance Testing Scenarios

Use this data to test:

### 1. Import Performance
```bash
# Generate large dataset
node generate-data.js --clients 1000 --invoices 50000

# Time the import process
# Goal: Import 50k invoices in under 2 minutes
```

### 2. Search Performance
- Search by client name across 10k+ invoices
- Filter by status, date range, amount
- Test autocomplete performance

### 3. Report Generation
- Generate reports with 10k+ invoices
- Test PDF generation with large datasets
- Measure query performance

### 4. Dashboard Loading
- Test dashboard with years of data
- Measure chart rendering speed
- Test pagination with large result sets

### 5. Export Performance
- Export 10k+ invoices to CSV
- Export filtered results
- Test PDF bulk generation

## Examples

### Small Dataset (Quick Testing)
```bash
node generate-data.js --clients 50 --invoices 500 --savedItems 50
```
Generated in ~3 seconds. Good for:
- UI testing
- Feature development
- Quick iterations

### Medium Dataset (Realistic)
```bash
node generate-data.js --clients 500 --invoices 10000 --savedItems 100
```
Generated in ~25 seconds. Good for:
- Performance baselines
- User acceptance testing
- Demo environments

### Large Dataset (Stress Testing)
```bash
node generate-data.js --clients 2000 --invoices 100000 --savedItems 200
```
Generated in ~4 minutes. Good for:
- Load testing
- Database optimization
- Scalability testing

## Troubleshooting

### "Module not found: @faker-js/faker"

Run: `npm install`

### Files not created

Check that you have write permissions to the output directory.

### Out of memory errors (with very large datasets)

Try breaking generation into smaller batches or increase Node.js heap size:

```bash
node --max-old-space-size=4096 generate-data.js --invoices 200000
```

### Data looks wrong after import

Verify you imported files in the correct order (clients → saved_items → invoices → invoice_items → payments).

## Customization

To customize the data generation:

1. Edit `generate-data.js`
2. Modify these sections:
   - **Service descriptions** (line ~220): Add your own invoice line item services
   - **Company name styles** (line ~90): Change company naming patterns
   - **Amount distributions** (line ~60): Adjust invoice amount ranges
   - **Status weights** (line ~145): Change invoice status distribution
   - **Saved item categories** (line ~367): Add/modify product/service catalog

## Performance

Typical generation times on modern hardware:

| Invoices | Time    | Total Records |
|----------|---------|---------------|
| 1,000    | ~5s     | ~5,000        |
| 10,000   | ~25s    | ~45,000       |
| 50,000   | ~2m     | ~215,000      |
| 100,000  | ~4m     | ~430,000      |

## Data Statistics

After generation completes, you'll see a summary:

```
✅ Complete! Files saved to /path/to/output

Generated in 24.3s:
  500 clients
  100 saved items
  10,000 invoices
  24,891 invoice items
  7,982 payments

Total records: 43,473
```

## License

MIT

## Support

For issues or questions, please check:
- The validation output for data integrity issues
- The troubleshooting section above
- Your Node.js version (v14+ recommended)
