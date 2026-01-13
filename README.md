# InvoicePro Desktop

A professional, feature-rich desktop invoicing application built with Electron. InvoicePro Desktop helps freelancers and small businesses create, manage, and track invoices efficiently.

## Features

### Core Features ✅
- **📊 Dashboard & Analytics** - Visual statistics with color-coded cards and progress bars
  - Total revenue, invoices, paid, pending, and overdue amounts
  - Recent invoices with quick actions
  - Automatic status updates for overdue invoices

- **📄 Invoice Management** - Complete invoice lifecycle management
  - Create, edit, and manage professional invoices
  - Quick line item entry with item number lookup
  - Auto-calculation of totals and taxes
  - Status tracking (Draft, Pending, Paid, Overdue)

- **💼 Client Management** - Comprehensive client database
  - Customer numbers for quick identification
  - Full contact information storage
  - View client invoice history
  - Quick navigation to client invoices

- **📦 Saved Items Library** - Reusable line items
  - Item numbers for rapid invoice creation
  - Standardized pricing
  - Category organization

- **🔍 Search & Filters** - Powerful data discovery
  - Global search across all entities (Ctrl/Cmd+F)
  - Quick status filters (All, Unpaid, Paid, Overdue)
  - Date range filtering
  - Client-specific filtering

- **⚡ Batch Operations** - Process multiple invoices at once
  - Select multiple invoices with checkboxes
  - Bulk mark as paid
  - Bulk archive or delete

- **📥 PDF Export** - Professional invoice PDFs
  - One-click PDF generation
  - Optimized for single-page layout
  - Company branding included
  - Save anywhere on your system

- **💳 Payment Gateway Integration** - Accept online payments with multiple providers
  - **Stripe** - Credit/debit cards (2.9% + $0.30) - Most popular, feature-rich
  - **PayPal** - PayPal.me links (2.99% + $0.49) - Easiest setup, widely trusted
  - **Square** - Credit/debit cards (2.9% + $0.30) - POS integration available
  - **GoCardless** - ACH/SEPA bank transfers (1% + $0.25) - Lowest fees, bank direct debit
  - **Authorize.Net** - Enterprise gateway (2.9% + $0.30) - Government/B2B contracts
  - One-click payment link generation for each gateway
  - Copy-to-clipboard for easy sharing via email or message
  - 17 payment method options for manual payment tracking
  - Simple setup - no webhooks or complex servers needed
  - PCI-compliant hosted payment pages

- **⌨️ Keyboard Shortcuts** - Lightning-fast navigation
  - Full keyboard shortcut support
  - In-app shortcut reference (Ctrl/Cmd+/)
  - Context-aware shortcuts

- **🗄️ Archive System** - Organize completed work
  - Archive old invoices
  - Restore when needed
  - Keeps database clean

- **⚙️ Settings & Customization**
  - Company information and branding
  - Invoice numbering and formatting
  - Tax rates and payment terms
  - Theme customization

### Advanced Features ✅
- **✅ Email Integration** - Send invoices and quotes directly via email with PDF attachments
- **✅ Payment Gateway Integration** - Five payment gateways with one-click link generation
  - Stripe, PayPal, Square, GoCardless, Authorize.Net
- **✅ Payment Tracking** - Comprehensive payment management
  - Track 17 different payment methods (cash, check, card, ACH, wire, crypto, etc.)
  - Record manual payments with reference numbers and notes
  - Visual payment progress tracking
  - Automatic invoice status updates based on payments
- **✅ Quotes & Estimates** - Create professional quotes and convert to invoices

### Planned Features 📅
- **📅 Recurring Invoices** - Automate recurring billing
- **📅 Expense Tracking** - Track business expenses and generate reports
- **📅 Multi-Currency Support** - Handle international clients
- **📅 Automated Payment Webhooks** - Auto-update invoices when paid

## Quick Start

### For End Users

1. **Download**: Get the installer for your platform from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. **Install**: Run the installer (see [Installation](#installation) for platform-specific instructions)
3. **First Launch**: Set up your company info in Settings
4. **Create Invoice**: Add a client and create your first invoice
5. **Get Help**: Check the [Quick Start Guide](QUICK_START.md) for step-by-step instructions

📖 **[Read the Quick Start Guide](QUICK_START.md)** for new users or **[Distribution Guide](DISTRIBUTION.md)** for installation details.

### For Developers

1. **Install dependencies**: `npm install`
2. **Run the app**: `npm run electron:dev`
3. **Create your first invoice**:
   - Set up company info in Settings
   - Add a client in Clients section
   - Create an invoice in Invoices section
4. **Learn keyboard shortcuts**: Press `Ctrl/Cmd + /`

## Payment Gateway Setup

InvoicePro Desktop supports five payment gateways for online payment processing. Each gateway has different strengths:

### Comparison Table

| Gateway | Best For | Transaction Fees | Setup Difficulty | Payment Methods |
|---------|----------|------------------|------------------|-----------------|
| **Stripe** | Most businesses | 2.9% + $0.30 | Medium | Credit/Debit Cards |
| **PayPal** | Quick setup | 2.99% + $0.49 | Easy | PayPal Balance, Cards |
| **Square** | Retail/POS | 2.9% + $0.30 | Medium | Credit/Debit Cards |
| **GoCardless** | Recurring payments | 1% + $0.25 | Medium | ACH, SEPA Bank Transfer |
| **Authorize.Net** | Enterprise/B2B | 2.9% + $0.30 | Medium | Credit/Debit Cards |

### Quick Setup Guide

**Stripe**
1. Sign up at [stripe.com](https://stripe.com)
2. Navigate to Developers → API keys
3. Copy your Secret Key and Publishable Key
4. Paste into Settings → Payment Gateways → Stripe
5. Enable Stripe integration

**PayPal**
1. Get your PayPal.me username from [paypal.me](https://paypal.me)
2. Paste into Settings → Payment Gateways → PayPal
3. Enable PayPal integration

**Square**
1. Sign up at [squareup.com](https://squareup.com)
2. Go to Developer Dashboard → Applications
3. Copy your Access Token and Location ID
4. Paste into Settings → Payment Gateways → Square
5. Enable Square integration

**GoCardless**
1. Sign up at [gocardless.com](https://gocardless.com)
2. Navigate to Developers → Access Tokens
3. Copy your Access Token
4. Paste into Settings → Payment Gateways → GoCardless
5. Enable GoCardless integration

**Authorize.Net**
1. Sign up at [authorize.net](https://authorize.net)
2. Get your API Login ID and Transaction Key from Account → API Credentials
3. Paste into Settings → Payment Gateways → Authorize.Net
4. Select sandbox (testing) or production environment
5. Enable Authorize.Net integration

### Using Payment Links

1. Open an invoice in Invoice Preview
2. Click the payment gateway button (e.g., "Stripe Payment Link")
3. Copy the generated payment link
4. Send the link to your client via email or message
5. Client clicks the link and completes payment
6. Manually record the payment in the invoice when confirmed

## Screenshots
*Coming soon*

## 🔄 Automatic Updates

InvoicePro Desktop includes built-in automatic update functionality:

- **Auto-Check**: The app automatically checks for updates on startup
- **User Control**: You decide when to download and install updates
- **Background Download**: Updates download in the background
- **One-Click Install**: Install updates with a single click
- **Auto-Install on Quit**: Downloaded updates install when you close the app
- **No Manual Downloads**: Never manually download updates again

### How Updates Work

1. App checks for updates on startup (production builds only)
2. If an update is available, you'll see a notification
3. Click to download the update (or ignore to update later)
4. Once downloaded, click to install or wait until you quit the app
5. App restarts with the new version

**Manual Check**: Go to Help → Check for Updates in the app menu.

**Note**: Auto-updates only work in production builds. Development mode (`npm run electron:dev`) doesn't check for updates.

## Installation

### For Users

**📥 [Download Latest Release](https://github.com/JNicometo/Invoicing_app/releases/latest)**

📖 **[Complete Installation Guide](DISTRIBUTION.md)** - Detailed instructions with troubleshooting

#### Windows

1. Download `InvoicePro-Desktop-Setup-X.X.X.exe` from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. Double-click the installer
3. If Windows shows a security warning:
   - Click "More info" → "Run anyway" (first time only)
4. Choose your installation directory
5. The installer creates desktop and Start Menu shortcuts
6. Click "Finish" to launch the app

**Installer Features**:
- Custom installation directory
- Desktop shortcut
- Start Menu shortcut
- Uninstaller included
- Supports Windows 10/11 (x64 and x86)

#### macOS

1. Download `InvoicePro-Desktop-X.X.X.dmg` from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. Open the DMG file
3. Drag InvoicePro icon to Applications folder
4. Eject the DMG
5. First launch: Right-click app → "Open" → Click "Open" in dialog
   - Or: System Preferences → Security & Privacy → Click "Open Anyway"
6. Subsequent launches work normally

**Platform Support**:
- Intel Macs (x64)
- Apple Silicon (ARM64/M1/M2/M3)
- macOS 10.13 or later

#### Linux

**AppImage** (Universal, no installation required):
```bash
# Download the AppImage
wget https://github.com/JNicometo/Invoicing_app/releases/latest/download/InvoicePro-Desktop-X.X.X.AppImage

# Make it executable
chmod +x InvoicePro-Desktop-X.X.X.AppImage

# Run it
./InvoicePro-Desktop-X.X.X.AppImage
```

**Debian/Ubuntu** (.deb package):
```bash
# Download the .deb file
wget https://github.com/JNicometo/Invoicing_app/releases/latest/download/invoicepro-desktop_X.X.X_amd64.deb

# Install it
sudo dpkg -i invoicepro-desktop_X.X.X_amd64.deb
sudo apt-get install -f  # Install dependencies if needed

# Launch from application menu or:
invoicepro-desktop
```

**System Requirements**:
- Ubuntu 18.04+ / Debian 10+ / Other modern Linux distributions
- x64 architecture

### For Developers

#### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

#### Setup
```bash
# Clone the repository
git clone https://github.com/JNicometo/Invoicing_app.git
cd Invoicing_app

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Development

### Project Structure
```
invoicepro-desktop/
├── .github/
│   ├── workflows/           # GitHub Actions CI/CD
│   └── ISSUE_TEMPLATE/      # Issue templates
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script
│   ├── renderer/            # UI components
│   └── utils/               # Utility functions
├── assets/                  # Icons and images
├── tests/                   # Test files
├── package.json
└── README.md
```

### Available Scripts

**Development**:
- `npm start` - Start React development server
- `npm run electron:dev` - Run full app in development mode with live reload
- `npm run electron` - Run Electron with current React build
- `npm test` - Run tests
- `npm run fix-db` - Fix database schema (adds missing columns)

**Building**:
- `npm run build` - Build React app for production
- `npm run electron:build` - Build Electron app for all platforms
- `npm run electron:build:win` - Build for Windows only
- `npm run electron:build:mac` - Build for macOS only
- `npm run electron:build:linux` - Build for Linux only

**Release Management**:
- `npm run release:patch` - Create patch release (1.0.0 → 1.0.1)
- `npm run release:minor` - Create minor release (1.0.0 → 1.1.0)
- `npm run release:major` - Create major release (1.0.0 → 2.0.0)
- `npm run publish:github` - Build and publish to GitHub releases

**Utilities**:
- `npm run check` - Check installed dependencies
- `npm run verify` - Run security audit and dependency check

### Technology Stack
- **Framework**: Electron 27 + React 18
- **UI Components**: React with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: SQLite3 (via better-sqlite3)
- **PDF Generation**: Electron printToPDF API
- **Email**: Nodemailer
- **Payment Gateways**: Stripe, PayPal, Square, GoCardless, Authorize.Net
- **Build Tool**: Create React App + electron-builder
- **Auto-Updates**: electron-updater
- **Testing**: React Testing Library
- **CI/CD**: GitHub Actions

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'feat: add some feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Open a Pull Request

## Roadmap

### Completed ✅
- ✅ Project setup and repository initialization
- ✅ Complete invoice management system
- ✅ Client management with customer numbers
- ✅ Saved items library with item numbers
- ✅ Dashboard with visual statistics and charts
- ✅ PDF export functionality (optimized layout)
- ✅ Invoice numbering fix (proper sequential numbering)
- ✅ Archive system
- ✅ Global search functionality
- ✅ Quick filters and date range filtering
- ✅ Batch operations
- ✅ Keyboard shortcuts
- ✅ Automatic overdue status tracking
- ✅ Payment gateway integration (5 gateways)
  - ✅ Stripe integration (credit/debit cards)
  - ✅ PayPal.me integration (PayPal payments)
  - ✅ Square integration (credit/debit cards + POS)
  - ✅ GoCardless integration (ACH/SEPA bank transfers)
  - ✅ Authorize.Net integration (enterprise/B2B)
- ✅ Payment tracking system (17 payment methods)
- ✅ Email integration for invoices and quotes
- ✅ Quotes and estimates with conversion to invoices
- ✅ Comprehensive code documentation and comments
- ✅ **Production Distribution System**
  - ✅ Automatic updates with electron-updater
  - ✅ Professional installers (Windows NSIS, macOS DMG, Linux AppImage/DEB)
  - ✅ Multi-platform builds (Windows x86/x64, macOS x64/ARM, Linux x64)
  - ✅ CI/CD pipeline with GitHub Actions
  - ✅ Automated release workflow
  - ✅ User documentation (Quick Start + Distribution Guide)
  - ✅ Code signing support

### In Progress 🚧
- 🚧 Automated testing setup
- 🚧 First public release preparation

### Planned 📅
- 📅 Recurring invoices (automated)
- 📅 Expense tracking
- 📅 Multi-currency support
- 📅 Automated payment webhooks
- 📅 Mobile companion app
- 📅 Advanced reporting

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Building & Releasing

### Local Building

```bash
# Build React app
npm run build

# Build Electron app for all platforms
npm run electron:build

# Build for specific platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS (requires macOS)
npm run electron:build:linux  # Linux
```

Built applications will be in the `dist/` directory:
- **Windows**: `InvoicePro-Desktop-Setup-X.X.X.exe`
- **macOS**: `InvoicePro-Desktop-X.X.X.dmg`
- **Linux**: `InvoicePro-Desktop-X.X.X.AppImage` and `.deb`

### Creating a Release

InvoicePro includes an automated release system:

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
npm run release:patch

# Minor release (new features): 1.0.0 → 1.1.0
npm run release:minor

# Major release (breaking changes): 1.0.0 → 2.0.0
npm run release:major
```

This will:
1. Update version in `package.json`
2. Commit the version change
3. Create a git tag
4. Push to GitHub
5. Trigger GitHub Actions to build for all platforms
6. Create a draft release with installers

Then:
1. Go to [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. Find the draft release
3. Edit release notes
4. Publish the release

Users with the app installed will automatically be notified of the update!

### Manual Release Process

If you prefer manual control:

```bash
# 1. Update version in package.json manually
# 2. Build the app
npm run electron:build

# 3. Create a git tag
git tag v1.0.1
git push origin v1.0.1

# 4. GitHub Actions will build and create a draft release
```

📖 **[Complete Release Guide](DISTRIBUTION.md#for-developers-building-and-publishing)** for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

**Database Column Errors**
```bash
npm run fix-db
```

**better-sqlite3 Module Error**
```bash
npm uninstall better-sqlite3
npm install better-sqlite3
npx electron-rebuild -f -w better-sqlite3
```

For more troubleshooting help, see the [User Guide - Troubleshooting Section](USER_GUIDE.md#troubleshooting).

## Documentation

InvoicePro Desktop includes comprehensive documentation:

- **[README.md](README.md)** - This file - Complete project overview
- **[QUICK_START.md](QUICK_START.md)** - Step-by-step guide for new users
- **[DISTRIBUTION.md](DISTRIBUTION.md)** - Installation guide and release instructions
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes (coming soon)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines (coming soon)

## Support

- **Quick Start**: [Quick Start Guide](QUICK_START.md) - For new users
- **Installation Help**: [Distribution Guide](DISTRIBUTION.md) - Detailed installation instructions
- **Issues**: [GitHub Issues](https://github.com/JNicometo/Invoicing_app/issues) - Report bugs or request features
- **Discussions**: [GitHub Discussions](https://github.com/JNicometo/Invoicing_app/discussions) - Ask questions and share ideas

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Icons from [Heroicons](https://heroicons.com/)
- Inspired by the needs of freelancers and small businesses

## Security

If you discover a security vulnerability, please email [your-email@example.com]. Do not create a public issue.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---

Made with ❤️ for freelancers and small businesses
