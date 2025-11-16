#!/bin/bash

echo "Looking for InvoicePro database..."
echo ""

# Check macOS location
MACOS_PATH="$HOME/Library/Application Support/Electron/invoicepro.db"
if [ -f "$MACOS_PATH" ]; then
    echo "✓ Found at: $MACOS_PATH"
    ls -lh "$MACOS_PATH"
fi

# Check Linux location
LINUX_PATH="$HOME/.config/Electron/invoicepro.db"
if [ -f "$LINUX_PATH" ]; then
    echo "✓ Found at: $LINUX_PATH"
    ls -lh "$LINUX_PATH"
fi

# Check Windows AppData location (if accessible)
if [ -n "$APPDATA" ]; then
    WINDOWS_PATH="$APPDATA/Electron/invoicepro.db"
    if [ -f "$WINDOWS_PATH" ]; then
        echo "✓ Found at: $WINDOWS_PATH"
        ls -lh "$WINDOWS_PATH"
    fi
fi

echo ""
echo "To verify the new columns exist, run:"
echo "sqlite3 <path-to-db> \"PRAGMA table_info(settings);\" | grep -E 'tab_configuration|stripe'"
