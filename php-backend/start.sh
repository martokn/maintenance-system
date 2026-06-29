#!/bin/bash

# Simple PHP Server Starter
# This script starts a built-in PHP server on port 2390

cd "$(dirname "$0")"

echo "==================================="
echo "Maintenance System - PHP Backend"
echo "==================================="
echo ""
echo "Starting PHP development server..."
echo "Server will run on: http://localhost:2390"
echo ""
echo "Database: MySQL (localhost)"
echo "API Endpoint: http://localhost:2390/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

php -S localhost:2390 -t . api/index.php
