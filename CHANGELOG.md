# Changelog

All notable changes to InvoicePro Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automatic update system with electron-updater
- Professional multi-platform installers (Windows NSIS, macOS DMG, Linux AppImage/DEB)
- GitHub Actions CI/CD pipeline for automated builds
- Automated release workflow with version management
- Comprehensive user documentation (Quick Start + Distribution Guide)
- Support for Windows x86/x64, macOS x64/ARM, Linux x64
- Code signing support for Windows and macOS
- Desktop and Start Menu shortcuts on Windows
- Drag-to-Applications installer on macOS
- AppImage and Debian packages for Linux

### Changed
- Enhanced build configuration for production distribution
- Improved installer user experience across all platforms
- Updated documentation with distribution and auto-update information

## [1.0.0] - 2024-XX-XX

### Added
- Complete invoice management system
- Client management with customer numbers
- Saved items library with item numbers
- Dashboard with visual statistics and analytics
- PDF export functionality with professional layouts
- Email integration for sending invoices and quotes
- Payment gateway integration (Stripe, PayPal, Square, GoCardless, Authorize.Net)
- Payment tracking system (17 payment methods)
- Quotes and estimates with conversion to invoices
- Archive system for organizing old invoices
- Global search functionality
- Status filters and date range filtering
- Batch operations for multiple invoices
- Keyboard shortcuts for faster workflow
- Automatic overdue status tracking
- SQLite database for local data storage
- Settings and customization options
- Company branding and logo support

### Features
- 📊 Dashboard with color-coded statistics
- 📄 Professional invoice creation and management
- 💼 Comprehensive client database
- 📦 Reusable line items library
- 🔍 Powerful search and filtering
- ⚡ Batch operations
- 📥 PDF export
- ✉️ Email integration
- 💳 Multiple payment gateways
- 💰 Payment tracking
- 📝 Quotes and estimates
- ⚙️ Customizable settings

### Technical
- Built with Electron 27 and React 18
- SQLite database with better-sqlite3
- Tailwind CSS for styling
- Lucide React for icons
- Nodemailer for email
- Multiple payment gateway SDKs
- Create React App for React building
- electron-builder for app packaging

---

## Version Number Guide

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, non-breaking changes
- **Patch (1.0.X)**: Bug fixes, minor improvements

## Links

- [Latest Release](https://github.com/JNicometo/Invoicing_app/releases/latest)
- [All Releases](https://github.com/JNicometo/Invoicing_app/releases)
- [Issues](https://github.com/JNicometo/Invoicing_app/issues)
