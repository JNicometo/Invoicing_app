#!/usr/bin/env node

const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// ==================== Configuration ====================

const DEFAULT_CONFIG = {
  clients: 500,
  invoices: 10000,
  expenses: 5000,
  output: './output'
};

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (config.hasOwnProperty(key)) {
      config[key] = key === 'output' ? value : parseInt(value);
    }
  }

  return config;
};

const config = parseArgs();

// Calculated amounts
const ITEMS_PER_INVOICE_AVG = 2.5;
const PAYMENTS_RATIO = 0.8; // 80% of paid/partial invoices get payments

// ==================== Helper Functions ====================

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatCurrency = (amount) => {
  return amount.toFixed(2);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const randomDateBetween = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const weightedRandom = (weights) => {
  const total = weights.reduce((sum, w) => sum + w[1], 0);
  let random = Math.random() * total;

  for (const [value, weight] of weights) {
    random -= weight;
    if (random <= 0) return value;
  }

  return weights[0][0];
};

// Realistic amount distribution (bell curve, mostly mid-range)
const generateInvoiceAmount = () => {
  const random = Math.random();

  if (random < 0.05) return faker.number.float({ min: 50, max: 200, precision: 0.01 }); // 5% small
  if (random < 0.15) return faker.number.float({ min: 200, max: 500, precision: 0.01 }); // 10% low
  if (random < 0.70) return faker.number.float({ min: 500, max: 2000, precision: 0.01 }); // 55% mid
  if (random < 0.95) return faker.number.float({ min: 2000, max: 5000, precision: 0.01 }); // 25% high
  return faker.number.float({ min: 5000, max: 15000, precision: 0.01 }); // 5% very high
};

// ==================== Data Generators ====================

const generateClients = (count) => {
  console.log(`Generating ${count} clients...`);
  const clients = [];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const companyStyles = [
    (name) => `${name} Consulting`,
    (name) => `${name} & Associates`,
    (name) => `${name} Group`,
    (name) => `${name} Solutions`,
    (name) => `${name} Enterprises`,
    (name) => `${name} Studios`,
    (name) => `${name} Agency`,
    (name) => `${name} Services`,
    (name) => `${faker.company.name()}`,
  ];

  for (let i = 1; i <= count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    const companyStyle = faker.helpers.arrayElement(companyStyles);
    const company = companyStyle(lastName);

    const emailDomain = company.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + '.com';

    clients.push({
      id: i,
      name: fullName,
      company: company,
      email: `info@${emailDomain}`,
      phone: faker.phone.number('(###) ###-####'),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode('#####'),
      created_at: formatDate(randomDateBetween(twoYearsAgo, new Date()))
    });

    if (i % 100 === 0) process.stdout.write(`\r  Progress: ${i}/${count}`);
  }

  console.log(`\r✓ clients.csv (${count} records)`);
  return clients;
};

const generateInvoices = (count, clients) => {
  console.log(`Generating ${count} invoices...`);
  const invoices = [];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const today = new Date();

  // Create client distribution (some clients get many invoices, some get few)
  const clientWeights = clients.map(c => {
    const random = Math.random();
    if (random < 0.1) return 10; // 10% of clients are "heavy" users
    if (random < 0.3) return 5;  // 20% are regular users
    return 1; // 70% are occasional users
  });

  const statusWeights = [
    ['paid', 0.60],
    ['sent', 0.20],
    ['overdue', 0.10],
    ['partial', 0.05],
    ['draft', 0.05]
  ];

  const noteOptions = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Rush order',
    'Includes discount',
    'Standard project',
    'Monthly retainer',
    'Project milestone',
    'Final payment',
    'Recurring service',
  ];

  for (let i = 1; i <= count; i++) {
    // Weight client selection
    const clientId = faker.helpers.weightedArrayElement(
      clients.map((c, idx) => ({ weight: clientWeights[idx], value: c.id }))
    );

    const issueDate = randomDateBetween(twoYearsAgo, today);
    const dueDate = addDays(issueDate, 30); // Net 30

    let status = weightedRandom(statusWeights);

    // Auto-mark as overdue if past due and status is 'sent'
    if (dueDate < today && status === 'sent') {
      status = 'overdue';
    }

    const year = issueDate.getFullYear();
    const invoiceNumber = `INV-${year}-${String(i).padStart(5, '0')}`;

    const subtotal = generateInvoiceAmount();
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    invoices.push({
      id: i,
      invoice_number: invoiceNumber,
      client_id: clientId,
      issue_date: formatDate(issueDate),
      due_date: formatDate(dueDate),
      status: status,
      subtotal: formatCurrency(subtotal),
      tax: formatCurrency(tax),
      total: formatCurrency(total),
      notes: faker.helpers.arrayElement(noteOptions),
      created_at: formatDate(issueDate)
    });

    if (i % 1000 === 0) process.stdout.write(`\r  Progress: ${i}/${count}`);
  }

  console.log(`\r✓ invoices.csv (${count} records)`);
  return invoices;
};

const generateInvoiceItems = (invoices) => {
  const totalItems = Math.floor(invoices.length * ITEMS_PER_INVOICE_AVG);
  console.log(`Generating ${totalItems} invoice items...`);

  const items = [];
  let itemId = 1;

  const serviceDescriptions = [
    'Web Development Services',
    'Graphic Design - Logo Creation',
    'Content Writing - Blog Posts',
    'Social Media Management',
    'SEO Optimization',
    'Email Marketing Campaign',
    'Consulting Services - Strategy Session',
    'Video Editing Services',
    'Photography Services',
    'Brand Identity Package',
    'UI/UX Design Services',
    'Database Development',
    'API Integration',
    'Mobile App Development',
    'Custom Illustration',
    'WordPress Theme Development',
    'E-commerce Setup',
    'Copywriting Services',
    'Market Research',
    'Business Strategy Consulting'
  ];

  for (const invoice of invoices) {
    const invoiceSubtotal = parseFloat(invoice.subtotal);
    const numItems = faker.number.int({ min: 1, max: 5 });

    // Generate items that sum to subtotal
    const itemAmounts = [];
    let remaining = invoiceSubtotal;

    for (let i = 0; i < numItems - 1; i++) {
      const amount = faker.number.float({
        min: remaining * 0.1,
        max: remaining * 0.6,
        precision: 0.01
      });
      itemAmounts.push(amount);
      remaining -= amount;
    }
    itemAmounts.push(remaining); // Last item gets the remainder

    // Create line items
    for (let i = 0; i < numItems; i++) {
      const description = faker.helpers.arrayElement(serviceDescriptions);
      const lineTotal = itemAmounts[i];

      // Decide if hourly or fixed price
      const isHourly = Math.random() < 0.7;

      let quantity, unitPrice;
      if (isHourly) {
        quantity = faker.number.int({ min: 1, max: 20 });
        unitPrice = lineTotal / quantity;
      } else {
        quantity = 1;
        unitPrice = lineTotal;
      }

      items.push({
        id: itemId++,
        invoice_id: invoice.id,
        description: description,
        quantity: quantity,
        unit_price: formatCurrency(unitPrice),
        line_total: formatCurrency(lineTotal)
      });
    }

    if (invoice.id % 1000 === 0) process.stdout.write(`\r  Progress: ${invoice.id}/${invoices.length}`);
  }

  console.log(`\r✓ invoice_items.csv (${items.length} records)`);
  return items;
};

const generateExpenses = (count) => {
  console.log(`Generating ${count} expenses...`);
  const expenses = [];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const categories = [
    { name: 'Software', vendors: ['Adobe Creative Cloud', 'Microsoft 365', 'Slack', 'Zoom', 'Dropbox', 'GitHub'], min: 10, max: 200 },
    { name: 'Office Supplies', vendors: ['Staples', 'Office Depot', 'Amazon', 'Best Buy'], min: 10, max: 100 },
    { name: 'Travel', vendors: ['Delta Airlines', 'United Airlines', 'Hilton Hotels', 'Marriott', 'Uber', 'Lyft'], min: 50, max: 500 },
    { name: 'Marketing', vendors: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Mailchimp'], min: 100, max: 1000 },
    { name: 'Education', vendors: ['Udemy', 'Coursera', 'LinkedIn Learning', 'Skillshare'], min: 10, max: 200 },
    { name: 'Equipment', vendors: ['Apple Store', 'Dell', 'Amazon', 'B&H Photo'], min: 100, max: 2000 },
    { name: 'Utilities', vendors: ['Electric Company', 'Internet Provider', 'Phone Service'], min: 50, max: 300 },
    { name: 'Professional Services', vendors: ['Legal Services', 'Accounting Firm', 'Insurance Company'], min: 200, max: 1500 }
  ];

  for (let i = 1; i <= count; i++) {
    const category = faker.helpers.arrayElement(categories);
    const vendor = faker.helpers.arrayElement(category.vendors);
    const amount = faker.number.float({ min: category.min, max: category.max, precision: 0.01 });
    const date = randomDateBetween(twoYearsAgo, new Date());

    const descriptions = {
      'Software': `${vendor} - Monthly subscription`,
      'Office Supplies': `Office supplies from ${vendor}`,
      'Travel': `Business travel - ${vendor}`,
      'Marketing': `Online advertising - ${vendor}`,
      'Education': `Professional development - ${vendor}`,
      'Equipment': `Equipment purchase from ${vendor}`,
      'Utilities': `${vendor} - Monthly service`,
      'Professional Services': `${vendor} - Professional fees`
    };

    expenses.push({
      id: i,
      date: formatDate(date),
      amount: formatCurrency(amount),
      category: category.name,
      vendor: vendor,
      description: descriptions[category.name],
      created_at: formatDate(date)
    });

    if (i % 500 === 0) process.stdout.write(`\r  Progress: ${i}/${count}`);
  }

  console.log(`\r✓ expenses.csv (${count} records)`);
  return expenses;
};

const generatePayments = (invoices) => {
  console.log('Generating payments...');
  const payments = [];
  let paymentId = 1;

  const paymentMethods = ['Bank Transfer', 'Credit Card', 'PayPal', 'Check', 'Cash'];

  const noteOptions = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Payment via Stripe',
    'Check #1234',
    'Wire transfer',
    'ACH payment',
    'Paid in full',
  ];

  // Filter invoices that need payments
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.status === 'partial');

  for (const invoice of paidInvoices) {
    // Skip some invoices randomly for realism
    if (Math.random() > PAYMENTS_RATIO) continue;

    const invoiceTotal = parseFloat(invoice.total);
    const dueDate = new Date(invoice.due_date);
    const today = new Date();

    let amount;
    if (invoice.status === 'paid') {
      amount = invoiceTotal;
    } else {
      // Partial payment (40-80% of total)
      amount = invoiceTotal * faker.number.float({ min: 0.4, max: 0.8, precision: 0.01 });
    }

    // Payment date between due date and today (or up to 30 days after due date)
    const maxDate = today > dueDate ? today : addDays(dueDate, 30);
    const paymentDate = randomDateBetween(dueDate, maxDate);

    payments.push({
      id: paymentId++,
      invoice_id: invoice.id,
      payment_date: formatDate(paymentDate),
      amount: formatCurrency(amount),
      payment_method: faker.helpers.arrayElement(paymentMethods),
      notes: faker.helpers.arrayElement(noteOptions),
      created_at: formatDate(paymentDate)
    });

    if (paymentId % 500 === 0) process.stdout.write(`\r  Progress: ${paymentId}/${paidInvoices.length}`);
  }

  console.log(`\r✓ payments.csv (${payments.length} records)`);
  return payments;
};

// ==================== CSV Writing ====================

const arrayToCSV = (data) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(header => {
      const value = obj[header];
      // Escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

const writeCSV = (filename, data) => {
  const csv = arrayToCSV(data);
  const filepath = path.join(config.output, filename);
  fs.writeFileSync(filepath, csv, 'utf8');
};

// ==================== Validation ====================

const validateData = (clients, invoices, items, expenses, payments) => {
  console.log('\nValidating data...');

  const errors = [];

  // Validate invoice items sum to subtotal
  const itemsByInvoice = {};
  for (const item of items) {
    if (!itemsByInvoice[item.invoice_id]) {
      itemsByInvoice[item.invoice_id] = 0;
    }
    itemsByInvoice[item.invoice_id] += parseFloat(item.line_total);
  }

  for (const invoice of invoices) {
    const itemsTotal = itemsByInvoice[invoice.id] || 0;
    const invoiceSubtotal = parseFloat(invoice.subtotal);
    const diff = Math.abs(itemsTotal - invoiceSubtotal);

    if (diff > 0.02) { // Allow 2 cent rounding difference
      errors.push(`Invoice ${invoice.id}: items total ${itemsTotal.toFixed(2)} doesn't match subtotal ${invoiceSubtotal.toFixed(2)}`);
    }
  }

  // Validate payment amounts
  for (const payment of payments) {
    const invoice = invoices.find(inv => inv.id === payment.invoice_id);
    if (!invoice) {
      errors.push(`Payment ${payment.id}: invoice ${payment.invoice_id} not found`);
      continue;
    }

    const paymentAmount = parseFloat(payment.amount);
    const invoiceTotal = parseFloat(invoice.total);

    if (invoice.status === 'paid' && Math.abs(paymentAmount - invoiceTotal) > 0.02) {
      errors.push(`Payment ${payment.id}: amount ${paymentAmount.toFixed(2)} doesn't match paid invoice total ${invoiceTotal.toFixed(2)}`);
    }
  }

  // Validate no duplicate IDs
  const checkDuplicates = (data, name) => {
    const ids = data.map(d => d.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push(`${name}: duplicate IDs found`);
    }
  };

  checkDuplicates(clients, 'Clients');
  checkDuplicates(invoices, 'Invoices');
  checkDuplicates(items, 'Invoice Items');
  checkDuplicates(expenses, 'Expenses');
  checkDuplicates(payments, 'Payments');

  if (errors.length > 0) {
    console.log('⚠ Validation warnings:');
    errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 5) {
      console.log(`  ... and ${errors.length - 5} more`);
    }
  } else {
    console.log('✓ All validation checks passed');
  }

  return errors.length;
};

// ==================== Main ====================

const main = async () => {
  console.log('\n=== Invoice Test Data Generator ===\n');
  console.log('Configuration:');
  console.log(`  Clients: ${config.clients}`);
  console.log(`  Invoices: ${config.invoices}`);
  console.log(`  Expenses: ${config.expenses}`);
  console.log(`  Output: ${config.output}\n`);

  // Create output directory
  if (!fs.existsSync(config.output)) {
    fs.mkdirSync(config.output, { recursive: true });
  }

  const startTime = Date.now();

  // Generate data
  const clients = generateClients(config.clients);
  const invoices = generateInvoices(config.invoices, clients);
  const items = generateInvoiceItems(invoices);
  const expenses = generateExpenses(config.expenses);
  const payments = generatePayments(invoices);

  // Validate
  validateData(clients, invoices, items, expenses, payments);

  // Write CSV files
  console.log('\nWriting CSV files...');
  writeCSV('clients.csv', clients);
  writeCSV('invoices.csv', invoices);
  writeCSV('invoice_items.csv', items);
  writeCSV('expenses.csv', expenses);
  writeCSV('payments.csv', payments);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n✅ Complete! Files saved to', path.resolve(config.output));
  console.log(`\nGenerated in ${elapsed}s:`);
  console.log(`  ${clients.length.toLocaleString()} clients`);
  console.log(`  ${invoices.length.toLocaleString()} invoices`);
  console.log(`  ${items.length.toLocaleString()} invoice items`);
  console.log(`  ${expenses.length.toLocaleString()} expenses`);
  console.log(`  ${payments.length.toLocaleString()} payments`);
  console.log(`\nTotal records: ${(clients.length + invoices.length + items.length + expenses.length + payments.length).toLocaleString()}\n`);
};

// Run
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
