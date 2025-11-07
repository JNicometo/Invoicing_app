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
  - Company branding included
  - Save anywhere on your system

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

### Advanced Features (Roadmap)
- **Email Integration** - Send invoices directly via email
- **Recurring Invoices** - Automate recurring billing
- **Expense Tracking** - Track business expenses and generate reports
- **Quotes & Estimates** - Create and convert quotes to invoices
- **Multi-Currency Support** - Handle international clients
- **Payment Integration** - Accept online payments

## Quick Start

1. **Install dependencies**: `npm install`
2. **Run the app**: `npm run electron:dev`
3. **Create your first invoice**:
   - Set up company info in Settings
   - Add a client in Clients section
   - Create an invoice in Invoices section
4. **Learn keyboard shortcuts**: Press `Ctrl/Cmd + /`

📖 **[Read the Full User Guide](USER_GUIDE.md)** for detailed instructions on all features.

## Screenshots
*Coming soon*

## Installation

### For Users

#### Windows
1. Download the latest `.exe` installer from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. Run the installer
3. Launch InvoicePro Desktop from your Start Menu

#### macOS
1. Download the latest `.dmg` file from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. Open the `.dmg` file
3. Drag InvoicePro Desktop to your Applications folder
4. Launch from Applications

#### Linux
1. Download the latest `.AppImage` or `.deb` from [Releases](https://github.com/JNicometo/Invoicing_app/releases)
2. For AppImage:
   ```bash
   chmod +x InvoicePro-Desktop-*.AppImage
   ./InvoicePro-Desktop-*.AppImage
   ```
3. For .deb:
   ```bash
   sudo dpkg -i invoicepro-desktop_*.deb
   ```

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
- `npm start` - Run the application
- `npm run electron:dev` - Run in development mode with live reload
- `npm run build` - Build for all platforms
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS
- `npm run build:linux` - Build for Linux
- `npm run fix-db` - Fix database schema (adds missing columns)
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Technology Stack
- **Framework**: Electron + React 18
- **UI Components**: React with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: SQLite3 (via better-sqlite3)
- **PDF Generation**: Electron printToPDF API
- **Build Tool**: Vite
- **Build**: electron-builder
- **Testing**: Jest (planned)
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
- ✅ PDF export functionality
- ✅ Archive system
- ✅ Global search functionality
- ✅ Quick filters and date range filtering
- ✅ Batch operations
- ✅ Keyboard shortcuts
- ✅ Automatic overdue status tracking
- ✅ Comprehensive user documentation

### In Progress 🚧
- 🚧 CI/CD pipeline with GitHub Actions
- 🚧 Automated testing setup
- 🚧 Application packaging for distribution

### Planned 📅
- 📅 Email integration for sending invoices
- 📅 Recurring invoices
- 📅 Expense tracking
- 📅 Quotes and estimates
- 📅 Multi-currency support
- 📅 Payment gateway integration
- 📅 Mobile companion app

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Building

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win
npm run build:mac
npm run build:linux
```

Built applications will be in the `dist/` directory.

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

## Support

- **User Guide**: [Complete User Guide](USER_GUIDE.md)
- **Documentation**: [Wiki](https://github.com/JNicometo/Invoicing_app/wiki)
- **Issues**: [GitHub Issues](https://github.com/JNicometo/Invoicing_app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JNicometo/Invoicing_app/discussions)

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
