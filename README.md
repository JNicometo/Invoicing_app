# InvoicePro Desktop

A professional, feature-rich desktop invoicing application built with Electron. InvoicePro Desktop helps freelancers and small businesses create, manage, and track invoices efficiently.

## Features

### Core Features
- **Invoice Management** - Create, edit, and manage professional invoices
- **PDF Generation** - Export invoices to PDF format
- **Client Management** - Keep track of client information and history
- **Payment Tracking** - Monitor payment status and overdue invoices

### Advanced Features (Roadmap)
- **Dashboard & Analytics** - Visualize revenue, expenses, and business metrics
- **Email Integration** - Send invoices directly via email
- **Recurring Invoices** - Automate recurring billing
- **Expense Tracking** - Track business expenses and generate reports
- **Quotes & Estimates** - Create and convert quotes to invoices
- **Customizable Templates** - Personalize invoice designs
- **Multi-Currency Support** - Handle international clients

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
- `npm run dev` - Run in development mode with live reload
- `npm run build` - Build for all platforms
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS
- `npm run build:linux` - Build for Linux
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Technology Stack
- **Framework**: Electron
- **Language**: JavaScript (ES6+)
- **Database**: SQLite (via better-sqlite3)
- **PDF Generation**: PDFKit
- **Storage**: electron-store
- **Build**: electron-builder
- **Testing**: Jest
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

See our [Development Roadmap](DEVELOPMENT_ROADMAP.md) for planned features and timeline.

### Current Status
- ✅ Project setup and repository initialization
- ✅ CI/CD pipeline with GitHub Actions
- 🚧 Core invoice functionality (Week 1)
- 📅 Dashboard & Analytics (Week 2)
- 📅 Email Integration (Week 3)
- 📅 And more...

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

## Support

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
