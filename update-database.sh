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

if [ ! -f "$DB_PATH" ]; then
    echo "Database not found at $DB_PATH"
    echo "The database will be created automatically when you run the app."
    exit 1
fi

echo "Backing up database..."
cp "$DB_PATH" "$DB_PATH.backup.$(date +%Y%m%d_%H%M%S)"

echo "Running migration..."
sqlite3 "$DB_PATH" < database/migrations/add-tab-configuration.sql

echo "✓ Database updated successfully!"
echo "Backup saved as: $DB_PATH.backup.*"
