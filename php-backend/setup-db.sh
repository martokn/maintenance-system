#!/bin/bash

# Database Setup Script
# This script initializes the MySQL database for the Maintenance System

echo "==================================="
echo "Maintenance System - DB Setup"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials
DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="maintenance_system_db"

# Check if mysql is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    exit 1
fi

echo "Connecting to MySQL..."
echo ""

# Read password if needed
read -p "Enter MySQL root password (press Enter if no password): " -s DB_PASS
echo ""
echo ""

# Create database and tables
if [ -z "$DB_PASS" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" < "$(dirname "$0")/config/setup.sql"
else
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" < "$(dirname "$0")/config/setup.sql"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}Database setup completed successfully!${NC}"
    echo ""
    echo "Database name: $DB_NAME"
    echo "Default user email: admin@maintenance.local"
    echo "Default password: admin123"
    echo ""
    echo "Next steps:"
    echo "1. Update database credentials in config/database.php if needed"
    echo "2. Run: ./start.sh"
else
    echo ""
    echo -e "${RED}Database setup failed!${NC}"
    echo "Please check your MySQL credentials and try again."
    exit 1
fi
