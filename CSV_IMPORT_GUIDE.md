# CSV Import Guide for InvoicePro Desktop

This guide explains how to import customers and items in bulk using CSV (Comma-Separated Values) files.

## Table of Contents
- [Overview](#overview)
- [Importing Customers](#importing-customers)
- [Importing Items](#importing-items)
- [CSV Format Requirements](#csv-format-requirements)
- [Example Templates](#example-templates)
- [Troubleshooting](#troubleshooting)

---

## Overview

InvoicePro Desktop supports bulk importing of:
- **Customers/Clients** - Import your entire customer database
- **Saved Items** - Import your product/service catalog

### Benefits
✅ Save time by importing hundreds of records at once
✅ Migrate data from other systems easily
✅ Maintain data consistency across your organization
✅ Quick setup for new installations

---

## Importing Customers

### Step-by-Step Instructions

1. **Prepare Your CSV File**
   - Open Excel, Google Sheets, or any spreadsheet software
   - Use the format specified in the [Customer CSV Format](#customer-csv-format) section
   - Save as CSV file (e.g., `customers.csv`)

2. **Import the File**
   - Open InvoicePro Desktop
   - Navigate to **Clients** in the sidebar
   - Click the **Import CSV** button (with Upload icon)
   - Select your CSV file
   - Review the preview
   - Click **Import Customers**

3. **Verify the Import**
   - Check the success message showing how many customers were imported
   - Browse your customer list to verify the data
   - Any errors will be displayed with specific row numbers

### Customer CSV Format

#### Required Columns
| Column Name | Description | Example |
|-------------|-------------|---------|
| `customer_number` | Unique identifier for the customer | `CUST001` |
| `name` | Customer's full name or company name | `Acme Corporation` |
| `email` | Customer's email address | `contact@acme.com` |

#### Optional Columns
| Column Name | Description | Example |
|-------------|-------------|---------|
| `phone` | Phone number | `(555) 123-4567` |
| `address` | Street address | `123 Main Street` |
| `city` | City | `New York` |
| `state` | State/Province | `NY` |
| `zip` | Postal code | `10001` |

### Customer CSV Example

```csv
customer_number,name,email,phone,address,city,state,zip
CUST001,Acme Corporation,contact@acme.com,(555) 123-4567,123 Main St,New York,NY,10001
CUST002,TechStart Inc,info@techstart.com,(555) 234-5678,456 Oak Ave,San Francisco,CA,94102
CUST003,Global Services LLC,hello@global.com,(555) 345-6789,789 Pine Rd,Chicago,IL,60601
```

### Customer Import Notes

⚠️ **Important:**
- Customer numbers must be unique across all customers
- Email addresses are required and should be valid
- Duplicate customer numbers will be skipped with a warning
- Empty required fields will cause the row to be skipped

---

## Importing Items

### Step-by-Step Instructions

1. **Prepare Your CSV File**
   - Open Excel, Google Sheets, or any spreadsheet software
   - Use the format specified in the [Item CSV Format](#item-csv-format) section
   - Save as CSV file (e.g., `items.csv`)

2. **Import the File**
   - Open InvoicePro Desktop
   - Navigate to **Saved Items** in the sidebar
   - Click the **Import CSV** button (with Upload icon)
   - Select your CSV file
   - Review the preview
   - Click **Import Items**

3. **Verify the Import**
   - Check the success message showing how many items were imported
   - Browse your items list to verify the data
   - Any errors will be displayed with specific row numbers

### Item CSV Format

#### Required Columns
| Column Name | Description | Example |
|-------------|-------------|---------|
| `item_number` | Unique identifier for the item | `ITEM001` |
| `description` | Item name or description | `Web Design Services` |
| `rate` | Price per unit | `150.00` |

#### Optional Columns
| Column Name | Description | Example |
|-------------|-------------|---------|
| `category` | Item category for organization | `Services` |

### Item CSV Example

```csv
item_number,description,rate,category
ITEM001,Web Design Services,150.00,Services
ITEM002,Logo Design,500.00,Design
ITEM003,Monthly Website Hosting,29.99,Hosting
ITEM004,SEO Optimization,200.00,Services
ITEM005,Content Writing (per page),75.00,Services
```

### Item Import Notes

⚠️ **Important:**
- Item numbers must be unique across all items
- Rate must be a valid number (decimals allowed)
- Duplicate item numbers will be skipped with a warning
- Empty required fields will cause the row to be skipped
- Category defaults to "General" if not specified

---

## CSV Format Requirements

### General Rules

1. **File Encoding**
   - Use UTF-8 encoding for international characters
   - Save as `.csv` format (not `.xlsx` or `.xls`)

2. **Headers**
   - First row must contain column headers
   - Column names must match exactly (case-sensitive)
   - Headers can be in any order

3. **Data Format**
   - Use commas (`,`) to separate values
   - Enclose values with commas in quotes: `"123 Main St, Apt 4B"`
   - One record per line
   - Remove any blank rows at the end

4. **Special Characters**
   - Use double quotes for text containing commas: `"Company, LLC"`
   - Escape quotes with double quotes: `"He said ""Hello"""`

### Excel/Google Sheets Tips

**Creating CSV from Excel:**
1. Open your spreadsheet
2. Click **File** > **Save As**
3. Choose **CSV (Comma delimited) (*.csv)**
4. Click **Save**

**Creating CSV from Google Sheets:**
1. Open your spreadsheet
2. Click **File** > **Download** > **Comma-separated values (.csv)**

---

## Example Templates

### Download Templates

Create your own template files based on these examples:

#### customers_template.csv
```csv
customer_number,name,email,phone,address,city,state,zip
CUST001,Example Customer,customer@example.com,(555) 000-0000,123 Example St,Sample City,CA,90000
```

#### items_template.csv
```csv
item_number,description,rate,category
ITEM001,Example Service,100.00,Services
```

### Sample Data Files

For testing purposes, you can use these sample files:

#### customers_sample.csv
```csv
customer_number,name,email,phone,address,city,state,zip
CUST001,Acme Corporation,contact@acme.com,(555) 123-4567,123 Main Street,New York,NY,10001
CUST002,TechStart Inc,info@techstart.com,(555) 234-5678,456 Oak Avenue,San Francisco,CA,94102
CUST003,Global Services LLC,hello@global.com,(555) 345-6789,789 Pine Road,Chicago,IL,60601
CUST004,Mountain View Co,sales@mountainview.com,(555) 456-7890,321 Hill Drive,Denver,CO,80201
CUST005,Coastal Enterprises,admin@coastal.com,(555) 567-8901,654 Beach Blvd,Miami,FL,33101
```

#### items_sample.csv
```csv
item_number,description,rate,category
ITEM001,Web Design Services,150.00,Services
ITEM002,Logo Design,500.00,Design
ITEM003,Monthly Website Hosting,29.99,Hosting
ITEM004,SEO Optimization,200.00,Services
ITEM005,Content Writing,75.00,Services
ITEM006,Social Media Management,300.00,Services
ITEM007,Email Marketing Campaign,250.00,Marketing
ITEM008,Business Card Design,100.00,Design
ITEM009,Brochure Design,350.00,Design
ITEM010,Video Editing,400.00,Video
```

---

## Troubleshooting

### Common Issues

#### "CSV file must have headers"
**Problem:** The CSV file doesn't have a header row
**Solution:** Add column names as the first row of your CSV file

#### "Missing required field: [field_name]"
**Problem:** Required columns are missing from your CSV
**Solution:** Ensure all required columns are present with exact names:
- Customers: `customer_number`, `name`, `email`
- Items: `item_number`, `description`, `rate`

#### "Duplicate [customer_number/item_number]"
**Problem:** The same customer/item number appears multiple times
**Solution:** Ensure each customer number and item number is unique

#### "Invalid rate: must be a number"
**Problem:** The rate field contains non-numeric data
**Solution:** Ensure rates are numbers (e.g., `100.00`, not `$100.00`)

#### "No valid records to import"
**Problem:** All rows in the CSV have errors
**Solution:**
1. Check that required fields are filled in
2. Verify field names match exactly
3. Ensure data types are correct (numbers for rates, valid emails)

### Data Validation

Before importing, verify:
- ✅ All required fields are present
- ✅ Customer numbers are unique
- ✅ Item numbers are unique
- ✅ Email addresses are properly formatted
- ✅ Rates are valid numbers
- ✅ No extra blank rows at the end

### Best Practices

1. **Test with Small Files First**
   - Import 5-10 records first to verify format
   - Check results before importing larger files

2. **Backup Your Data**
   - Export existing data before large imports
   - Keep a copy of your import CSV file

3. **Use Consistent Numbering**
   - Use prefixes: `CUST001`, `ITEM001`
   - Pad with zeros for proper sorting: `CUST0001` vs `CUST1`

4. **Validate in Spreadsheet**
   - Remove blank rows
   - Check for missing required data
   - Verify numbers are formatted correctly

5. **Handle Errors**
   - Read error messages carefully
   - Fix issues and re-import failed records
   - Check row numbers mentioned in errors

---

## Getting Help

### Support Resources

- **Documentation:** Check the main README.md file
- **GitHub Issues:** Report bugs or request features
- **Example Files:** Use the sample CSV files provided above

### Need More Help?

If you encounter issues not covered in this guide:
1. Check that your CSV format matches the examples exactly
2. Try importing the sample CSV files to verify the feature works
3. Review error messages for specific guidance
4. Create an issue on GitHub with your CSV format and error message

---

## Advanced Tips

### Large Imports

For importing thousands of records:
- Split into multiple CSV files of 500-1000 records each
- Import one file at a time
- Verify each batch before proceeding

### Data Migration

When migrating from another system:
1. Export data from your old system
2. Map the fields to InvoicePro's format
3. Clean and validate the data
4. Test with a small sample
5. Import the full dataset

### Excel Formulas

Use Excel formulas to prepare data:
- Generate customer numbers: `="CUST"&TEXT(ROW()-1,"000")`
- Format phone numbers: `=TEXT(A2,"(000) 000-0000")`
- Clean up text: `=TRIM(A2)` to remove extra spaces

---

## Quick Reference

### Customer Import Checklist
- [ ] CSV file with `.csv` extension
- [ ] Headers: `customer_number`, `name`, `email`
- [ ] All customer numbers are unique
- [ ] All email addresses are valid
- [ ] File saved with UTF-8 encoding

### Item Import Checklist
- [ ] CSV file with `.csv` extension
- [ ] Headers: `item_number`, `description`, `rate`
- [ ] All item numbers are unique
- [ ] All rates are valid numbers
- [ ] File saved with UTF-8 encoding

---

*Last Updated: November 2025*
*InvoicePro Desktop v1.0.0*
