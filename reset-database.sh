#!/bin/bash

# Get the database path
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    DB_PATH="$HOME/Library/Application Support/Electron/invoicepro.db"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    DB_PATH="$HOME/.config/Electron/invoicepro.db"
else
    # Windows (Git Bash/WSL)
    DB_PATH="$APPDATA/Electron/invoicepro.db"
fi

echo "Database path: $DB_PATH"

if [ -f "$DB_PATH" ]; then
    echo "Backing up old database..."
    mv "$DB_PATH" "$DB_PATH.old.$(date +%Y%m%d_%H%M%S)"
    echo "✓ Old database backed up"
fi

echo "Database will be recreated when you start the app."
echo "Run: npm run electron:dev"
