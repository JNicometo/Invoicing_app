# Usage Examples

## Quick Start

### 1. Install Dependencies

```bash
cd data-generator
npm install
```

### 2. Generate Default Dataset

```bash
npm run generate
```

Expected output:
```
=== Invoice Test Data Generator ===

Configuration:
  Clients: 500
  Invoices: 10000
  Expenses: 5000
  Output: ./output

Generating 500 clients...
✓ clients.csv (500 records)
Generating 10000 invoices...
✓ invoices.csv (10000 records)
Generating 25000 invoice items...
✓ invoice_items.csv (24891 records)
Generating 5000 expenses...
✓ expenses.csv (5000 records)
Generating payments...
✓ payments.csv (7982 records)

Validating data...
✓ All validation checks passed

Writing CSV files...

✅ Complete! Files saved to /path/to/output

Generated in 24.3s:
  500 clients
  10,000 invoices
  24,891 invoice items
  5,000 expenses
  7,982 payments

Total records: 48,373
```

## Common Scenarios

### Small Dataset for Quick Testing

Generate 100 clients and 1,000 invoices:

```bash
node generate-data.js --clients 100 --invoices 1000 --expenses 500
```

**Use for:**
- Quick testing
- Development
- UI iterations
- Demo setups

**Generation time:** ~5 seconds

---

### Medium Dataset for Realistic Testing

Generate 500 clients and 10,000 invoices (default):

```bash
npm run generate
```

**Use for:**
- Performance baselines
- User acceptance testing
- Realistic demo data
- Training environments

**Generation time:** ~25 seconds

---

### Large Dataset for Stress Testing

Generate 2,000 clients and 100,000 invoices:

```bash
node generate-data.js --clients 2000 --invoices 100000 --expenses 20000
```

**Use for:**
- Load testing
- Database optimization
- Scalability testing
- Performance tuning

**Generation time:** ~4 minutes

---

### Custom Output Directory

Save to a specific location:

```bash
node generate-data.js --output ./test-data-2024
```

Files will be saved to `./test-data-2024/` instead of `./output/`

---

## Performance Testing Workflows

### Test 1: Import Speed

```bash
# Generate large dataset
node generate-data.js --invoices 50000

# Then in your app, time the import:
# - Expected: < 2 minutes for 50k invoices
# - Watch for memory usage
# - Check for any errors
```

### Test 2: Search Performance

```bash
# Generate realistic dataset
npm run generate

# In your app, test:
# - Search by client name (should be instant)
# - Filter by date range (< 1 second)
# - Multi-field search (< 1 second)
# - Pagination with large results (< 500ms per page)
```

### Test 3: Report Generation

```bash
# Generate medium dataset
npm run generate

# In your app, test:
# - Generate monthly report (all invoices) < 5 seconds
# - Export to PDF < 10 seconds
# - Generate charts/graphs < 2 seconds
```

### Test 4: Database Queries

```bash
# Generate large dataset
node generate-data.js --invoices 100000

# Test query performance:
# - Find all overdue invoices (should have indexes)
# - Calculate total revenue (aggregation)
# - Find client with most invoices
# - Monthly revenue over time
```

---

## Step-by-Step: First Time Setup

### Step 1: Generate the Data

```bash
cd data-generator
npm install
npm run generate
```

Wait for completion (~25 seconds).

### Step 2: Verify the Files

```bash
ls -lh output/

# Should see:
# clients.csv        (~50 KB)
# invoices.csv       (~1.2 MB)
# invoice_items.csv  (~2.5 MB)
# expenses.csv       (~500 KB)
# payments.csv       (~800 KB)
```

### Step 3: Preview the Data

```bash
# Preview first 5 rows of clients
head -n 6 output/clients.csv

# Preview first invoice
head -n 2 output/invoices.csv
```

### Step 4: Import to Your App

**Order is important!**

1. Import `clients.csv` first
2. Then `invoices.csv`
3. Then `invoice_items.csv`
4. Then `expenses.csv`
5. Finally `payments.csv`

### Step 5: Verify Import

In your app:
- Check client count (should be 500)
- Check invoice count (should be 10,000)
- Check that invoices show correct totals
- Verify invoice statuses are distributed correctly
- Confirm payments match paid invoices

---

## Customization Examples

### Change Invoice Amount Distribution

Edit `generate-data.js`, find the `generateInvoiceAmount()` function:

```javascript
const generateInvoiceAmount = () => {
  const random = Math.random();

  // Customize these ranges:
  if (random < 0.10) return faker.number.float({ min: 100, max: 500 });  // 10% low
  if (random < 0.80) return faker.number.float({ min: 500, max: 3000 }); // 70% mid
  return faker.number.float({ min: 3000, max: 10000 });                  // 20% high
};
```

### Add Custom Service Descriptions

Edit the `serviceDescriptions` array:

```javascript
const serviceDescriptions = [
  'Web Development Services',
  'Graphic Design - Logo Creation',
  // Add your own:
  'Custom Service XYZ',
  'Special Consulting Package',
  // ... more services
];
```

### Change Invoice Status Distribution

Find the `statusWeights` array:

```javascript
const statusWeights = [
  ['paid', 0.70],     // 70% paid (changed from 60%)
  ['sent', 0.15],     // 15% sent
  ['overdue', 0.10],  // 10% overdue
  ['partial', 0.03],  // 3% partial
  ['draft', 0.02]     // 2% draft
];
```

---

## Troubleshooting

### Problem: Generation is too slow

**Solution:** Generate smaller batches or use a faster machine.

```bash
# Instead of 100k invoices, try 10k first
node generate-data.js --invoices 10000
```

### Problem: Import fails with "foreign key constraint"

**Solution:** Import files in the correct order!

1. clients.csv (first - no dependencies)
2. invoices.csv (references clients)
3. invoice_items.csv (references invoices)
4. expenses.csv (independent)
5. payments.csv (references invoices)

### Problem: Invoice totals don't match in the app

**Solution:** Check that tax rate in the app matches generated data (8%).

The generator uses 8% tax:
```javascript
const tax = subtotal * 0.08;
```

If your app uses a different rate, edit this line.

### Problem: Out of memory error

**Solution:** Increase Node.js heap size:

```bash
node --max-old-space-size=4096 generate-data.js --invoices 200000
```

Or generate in batches:
```bash
# Generate first batch
node generate-data.js --invoices 50000 --output ./batch1

# Generate second batch
node generate-data.js --invoices 50000 --output ./batch2

# Import each batch separately
```

---

## Performance Benchmarks

Tested on MacBook Pro M1, 16GB RAM:

| Invoices | Clients | Time   | Total Records | File Size |
|----------|---------|--------|---------------|-----------|
| 1,000    | 100     | 4s     | ~4,500        | ~2 MB     |
| 10,000   | 500     | 25s    | ~45,000       | ~18 MB    |
| 50,000   | 1,000   | 2m 5s  | ~215,000      | ~85 MB    |
| 100,000  | 2,000   | 4m 10s | ~430,000      | ~170 MB   |

---

## Advanced: Continuous Data Generation

### Generate Fresh Data Daily

Create a cron job or scheduled task:

```bash
#!/bin/bash
# daily-data-gen.sh

cd /path/to/data-generator
node generate-data.js --output ./daily-$(date +%Y%m%d)
```

### Generate Test Data for CI/CD

```yaml
# .github/workflows/test.yml
- name: Generate Test Data
  run: |
    cd data-generator
    npm install
    node generate-data.js --clients 50 --invoices 500 --output ../test-data
```

---

## Tips & Best Practices

1. **Start Small**: Generate 1,000 invoices first to verify everything works
2. **Verify Before Import**: Check the CSV files look correct before importing
3. **Import Order Matters**: Always import in order: clients → invoices → items → expenses → payments
4. **Backup First**: Backup your database before importing large datasets
5. **Monitor Performance**: Use generated data to find performance bottlenecks
6. **Clean Data**: Delete test data between test runs to avoid duplication
7. **Version Control**: Don't commit generated CSV files (they're in `.gitignore`)

---

## Next Steps

After successful generation and import:

1. **Test Search**: Search for invoices by client, date, amount
2. **Test Filtering**: Filter by status, date ranges
3. **Test Reports**: Generate reports with the full dataset
4. **Test Export**: Export invoices to PDF/CSV
5. **Check Performance**: Measure query times, page load times
6. **Optimize**: Add indexes, optimize queries based on findings

---

## Questions?

Common questions:

**Q: Can I generate more than 100,000 invoices?**
A: Yes, but you may need to increase Node's memory limit.

**Q: Can I change the date range?**
A: Yes, edit the `twoYearsAgo` variable in the script.

**Q: Will this work with my custom database schema?**
A: You may need to adjust the CSV structure to match your schema.

**Q: Can I generate recurring invoices?**
A: Not currently, but you can modify the script to add recurring patterns.

**Q: Is the data GDPR compliant for testing?**
A: Yes, all data is completely fake and randomly generated.
