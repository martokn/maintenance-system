# Quick Start Guide

## 5-Minute Setup

### Prerequisites

- PHP 7.4+ 
- MySQL 5.7+ (or MariaDB)
- Node.js 14+
- npm

### Step 1: Install Dependencies

```bash
# Install Node dependencies
npm install
```

### Step 2: Setup MySQL Database

**Option A: On Linux/Mac**

```bash
# Start MySQL service
sudo service mysql start   # Ubuntu/Debian
# OR
brew services start mysql  # macOS

# Run database setup
cd php-backend
php setup-db.php
```

**Option B: On Windows**

```bash
# Ensure MySQL is running via Services or MySQL workbench
# Then run:
php php-backend/setup-db.php
```

**Option C: Using Docker (if you have Docker)**

```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -d -p 3306:3306 mysql:8.0

# Then run setup
php php-backend/setup-db.php
```

### Step 3: Start PHP Backend (Terminal 1)

```bash
cd php-backend
chmod +x start.sh
./start.sh
```

You should see:
```
===================================
Maintenance System - PHP Backend
===================================

Starting PHP development server...
Server will run on: http://localhost:2390
```

### Step 4: Start React Frontend (Terminal 2)

```bash
npm run dev
```

Your app will open at `http://localhost:5173` or similar (check Vite output)

### Step 5: Login

Use default credentials:
- **Email**: `admin@maintenance.local`
- **Password**: `admin123`

## Troubleshooting

### "Connection refused" error

```bash
# Check if port is in use
lsof -i :2390

# Try different port (edit start.sh)
php -S localhost:3000 api/index.php
```

### "Access denied for MySQL"

1. Check MySQL is running:
```bash
mysql -u root -p

# If this fails, MySQL isn't running
```

2. Set root password:
```bash
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;

# Then update config/database.php with password
```

3. Create a new user:
```bash
sudo mysql -u root -p
CREATE USER 'maintenance'@'localhost' IDENTIFIED BY 'maintenance123';
GRANT ALL PRIVILEGES ON *.* TO 'maintenance'@'localhost';
FLUSH PRIVILEGES;

# Update config/database.php to use new user
```

### "Database not found" error

The database might not exist. Create it:

```bash
mysql -u root -p

CREATE DATABASE maintenance_system_db;
USE maintenance_system_db;

# Then import the schema
source php-backend/config/setup.sql;
```

### "Table already exists"

This is normal if running setup twice. Just continue.

### Port 2390 not working

1. Check if something else is using port 2390:
```bash
lsof -i :2390
```

2. Kill the process or use different port:
```bash
php -S localhost:3000 -t . api/index.php
```

3. Update frontend API client to use new port

## File Locations

- **Frontend**: `/` directory with package.json
- **Backend**: `php-backend/` directory
- **Database Config**: `php-backend/config/database.php`
- **API**: `php-backend/api/index.php`
- **Database Schema**: `php-backend/config/setup.sql`

## Default Admin Account

After successful setup, you can login with:
- Email: `admin@maintenance.local`
- Password: `admin123`

Change this in production!

## Next Steps

1. Create additional user accounts
2. Add vehicles to the system
3. Set up inspection workflows
4. Configure parts inventory
5. Customize for your organization

## Getting Help

- Check `SETUP.md` for detailed instructions
- Check `php-backend/README.md` for API documentation
- View browser console (F12) for JavaScript errors
- Check `/tmp/php_server.log` for PHP errors
- Check MySQL error logs

## Architecture

```
Frontend (React) <--> PHP API <--> MySQL Database
     :5173/dev           :2390
   (Vite Dev Server)  (PHP Server)
```

All communication is via REST API on port 2390.
