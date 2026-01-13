# InvoicePro Desktop - Distribution Guide

## For Users: How to Download and Install

### Windows Installation

1. **Download the Installer**
   - Go to the [Releases page](https://github.com/JNicometo/Invoicing_app/releases)
   - Download the latest `InvoicePro-Desktop-Setup-X.X.X.exe` file

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Windows may show a "Windows protected your PC" warning
     - Click "More info" → "Run anyway" (first time only)
   - Choose your installation directory
   - The installer will create desktop and start menu shortcuts
   - Click "Finish" to launch the app

3. **First Run**
   - The app will open automatically after installation
   - Your data is stored locally and securely on your computer
   - No internet connection required for basic features

### macOS Installation

1. **Download the DMG**
   - Go to the [Releases page](https://github.com/JNicometo/Invoicing_app/releases)
   - Download the latest `InvoicePro-Desktop-X.X.X.dmg` file
   - Supports both Intel (x64) and Apple Silicon (arm64) Macs

2. **Install the App**
   - Double-click the downloaded `.dmg` file
   - Drag the InvoicePro icon to the Applications folder
   - Eject the DMG from your desktop

3. **First Run**
   - Open the app from your Applications folder
   - macOS may show "App cannot be opened because it's from an unidentified developer"
     - Right-click the app → "Open" → Click "Open" in the dialog (first time only)
     - Or: System Preferences → Security & Privacy → Click "Open Anyway"
   - The app will remember this for future launches

### Linux Installation

#### Option 1: AppImage (Universal)

1. **Download the AppImage**
   - Go to the [Releases page](https://github.com/JNicometo/Invoicing_app/releases)
   - Download the latest `InvoicePro-Desktop-X.X.X.AppImage` file

2. **Make it Executable**
   ```bash
   chmod +x InvoicePro-Desktop-X.X.X.AppImage
   ```

3. **Run the App**
   ```bash
   ./InvoicePro-Desktop-X.X.X.AppImage
   ```

#### Option 2: Debian/Ubuntu (.deb)

1. **Download the DEB Package**
   - Go to the [Releases page](https://github.com/JNicometo/Invoicing_app/releases)
   - Download the latest `invoicepro-desktop_X.X.X_amd64.deb` file

2. **Install via Terminal**
   ```bash
   sudo dpkg -i invoicepro-desktop_X.X.X_amd64.deb
   sudo apt-get install -f  # Install dependencies if needed
   ```

3. **Launch the App**
   - Find InvoicePro in your application menu
   - Or run: `invoicepro-desktop`

## Automatic Updates

InvoicePro Desktop includes automatic update checking:

- The app checks for updates on startup
- You'll be notified when a new version is available
- Choose to download and install updates when convenient
- Updates install automatically when you close the app

**Manual Update Check:**
- Go to Help → Check for Updates in the app menu

## Data Storage

Your data is stored locally on your computer:

- **Windows:** `%APPDATA%\invoicepro-desktop\`
- **macOS:** `~/Library/Application Support/invoicepro-desktop/`
- **Linux:** `~/.config/invoicepro-desktop/`

## System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.13+, or Linux (Ubuntu 18.04+)
- **RAM:** 4 GB
- **Disk Space:** 500 MB
- **Internet:** Optional (required for email, payments, and updates)

### Recommended
- **RAM:** 8 GB or more
- **Disk Space:** 1 GB or more (for data storage)
- **Internet:** Broadband connection

## Troubleshooting

### Windows: "Windows protected your PC" Warning
This is normal for new apps. Click "More info" → "Run anyway"

### macOS: "Cannot be opened" Error
Right-click the app → "Open" → Click "Open" in the dialog

### Linux: AppImage Won't Run
Make sure FUSE is installed:
```bash
sudo apt install libfuse2  # Ubuntu/Debian
```

### App Won't Start
1. Check system requirements
2. Restart your computer
3. Try reinstalling the app
4. Check the logs (Help → Open Logs Folder)

### Database Errors
The app includes automatic database repair. If issues persist:
1. Go to Settings → Backup & Restore
2. Create a backup of your data
3. Reinstall the app
4. Restore your backup

## Uninstalling

### Windows
- Settings → Apps → InvoicePro Desktop → Uninstall
- Or use the uninstaller in the Start Menu

### macOS
- Drag InvoicePro from Applications to Trash
- To remove data: `rm -rf ~/Library/Application\ Support/invoicepro-desktop`

### Linux
- **DEB:** `sudo apt remove invoicepro-desktop`
- **AppImage:** Simply delete the AppImage file
- To remove data: `rm -rf ~/.config/invoicepro-desktop`

## Security & Privacy

- All data is stored locally on your device
- No telemetry or tracking
- SMTP credentials are encrypted
- Payment processing uses industry-standard secure connections
- The app is open source - you can review the code

## Support

- **Issues:** [GitHub Issues](https://github.com/JNicometo/Invoicing_app/issues)
- **Documentation:** [README.md](README.md)
- **Version History:** [Releases](https://github.com/JNicometo/Invoicing_app/releases)

---

## For Developers: Building and Publishing

### Prerequisites

```bash
npm install
```

### Building for All Platforms

```bash
npm run build
npm run electron:build
```

### Building for Specific Platforms

```bash
# Windows only
npm run electron:build:win

# macOS only (requires macOS)
npm run electron:build:mac

# Linux only
npm run electron:build:linux
```

### Code Signing (Optional but Recommended)

#### Windows Code Signing

1. Obtain a code signing certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

#### macOS Code Signing

1. Enroll in Apple Developer Program
2. Create a Developer ID Application certificate
3. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   export APPLE_ID=your@email.com
   export APPLE_ID_PASSWORD=app-specific-password
   ```

### Publishing Releases

#### Manual Publishing

1. Build the app for all platforms
2. Create a new GitHub Release
3. Upload the installers from the `dist/` folder
4. Write release notes

#### Automatic Publishing with GitHub Actions

1. Set up GitHub secrets:
   - `GH_TOKEN` - GitHub Personal Access Token

2. Push a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. GitHub Actions will automatically:
   - Build for all platforms
   - Create a draft release
   - Upload installers

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG
- [ ] Test builds on all platforms
- [ ] Sign builds (if possible)
- [ ] Create GitHub release
- [ ] Upload installers
- [ ] Write clear release notes
- [ ] Test auto-update functionality

### Publishing to Microsoft Store (Optional)

For wider distribution on Windows:
1. Create a Microsoft Partner Center account
2. Package as MSIX: `npm run electron:build:win -- --win msix`
3. Submit to Microsoft Store

### Publishing to Mac App Store (Optional)

For distribution via Mac App Store:
1. Enroll in Apple Developer Program
2. Configure App Store specific settings
3. Build for Mac App Store: `npm run electron:build:mac -- --mac mas`
4. Submit via App Store Connect

## Continuous Integration

The repository includes GitHub Actions workflows for:
- Automated building on push/PR
- Automated releases on tags
- Multi-platform builds

See `.github/workflows/` for configuration.
