# Maintenance System - PHP Backend

## Setup Instructions

### 1. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run setup script
mysql> source /path/to/php-backend/config/setup.sql;
```

Or use a GUI tool like phpMyAdmin to import the SQL file.

### 2. Install PHP

Make sure PHP 7.4+ is installed:

```bash
# On Ubuntu/Debian
sudo apt-get install php php-mysql php-mbstring

# On macOS
brew install php
```

### 3. Start the Server

```bash
cd /path/to/php-backend
chmod +x start.sh
./start.sh
```

The server will start on `http://localhost:2390`

### 4. API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout

#### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/{id}` - Get vehicle
- `POST /api/vehicles/create` - Create vehicle
- `PUT /api/vehicles/{id}/update` - Update vehicle
- `DELETE /api/vehicles/{id}/delete` - Delete vehicle
- `GET /api/vehicles/search?q={query}` - Search vehicles
- `GET /api/vehicles/by-status?status={status}` - Get by status

#### Inspection Reports
- `GET /api/inspection-reports` - List all reports
- `GET /api/inspection-reports/{id}` - Get report
- `POST /api/inspection-reports/create` - Create report
- `PUT /api/inspection-reports/{id}/update` - Update report
- `DELETE /api/inspection-reports/{id}/delete` - Delete report
- `GET /api/inspection-reports/by-vehicle/{id}` - Get by vehicle
- `GET /api/inspection-reports/by-status?status={status}` - Get by status

#### Job Cards
- `GET /api/job-cards` - List all job cards
- `GET /api/job-cards/{id}` - Get job card
- `POST /api/job-cards/create` - Create job card
- `PUT /api/job-cards/{id}/update` - Update job card
- `DELETE /api/job-cards/{id}/delete` - Delete job card
- `GET /api/job-cards/by-status?status={status}` - Get by status

#### Parts Requests
- `GET /api/parts-requests` - List all parts requests
- `GET /api/parts-requests/{id}` - Get parts request
- `POST /api/parts-requests/create` - Create parts request
- `PUT /api/parts-requests/{id}/update` - Update parts request
- `DELETE /api/parts-requests/{id}/delete` - Delete parts request
- `GET /api/parts-requests/by-status?status={status}` - Get by status

#### Inventory
- `GET /api/inventory` - List all items
- `GET /api/inventory/{id}` - Get item
- `POST /api/inventory/create` - Create item
- `PUT /api/inventory/{id}/update` - Update item
- `DELETE /api/inventory/{id}/delete` - Delete item
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/by-category?category={category}` - Get by category
- `GET /api/inventory/search?q={query}` - Search items
- `PUT /api/inventory/{id}/deduct-stock` - Deduct stock
- `PUT /api/inventory/{id}/add-stock` - Add stock

#### Notifications
- `GET /api/notifications` - List all notifications
- `GET /api/notifications/{id}` - Get notification
- `POST /api/notifications/create` - Create notification
- `DELETE /api/notifications/{id}/delete` - Delete notification
- `GET /api/notifications/latest` - Get latest notifications
- `GET /api/notifications/by-type?type={type}` - Get by type
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/{id}/mark-as-read` - Mark as read
- `PUT /api/notifications/mark-all-as-read` - Mark all as read

### 5. Test the API

```bash
# Test login
curl -X POST http://localhost:2390/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maintenance.local","password":"admin123"}'

# Expected response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "admin@maintenance.local",
      "full_name": "Admin User",
      "role": "admin",
      "department": "Admin"
    }
  }
}
```

## Database Configuration

Edit `config/database.php` to change database settings:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'maintenance_system_db');
define('DB_PORT', 3306);
```

## Directory Structure

```
php-backend/
├── api/
│   ├── index.php (Main router)
│   └── health.php (Health check)
├── config/
│   ├── database.php (DB config)
│   ├── constants.php (App constants)
│   └── setup.sql (Database schema)
├── controllers/
│   ├── AuthController.php
│   ├── VehicleController.php
│   ├── InspectionReportController.php
│   ├── JobCardController.php
│   ├── PartsRequestController.php
│   ├── InventoryItemController.php
│   └── NotificationController.php
├── models/
│   ├── User.php
│   ├── Vehicle.php
│   ├── InspectionReport.php
│   ├── JobCard.php
│   ├── PartsRequest.php
│   ├── InventoryItem.php
│   └── Notification.php
├── middleware/
│   ├── AuthMiddleware.php (JWT auth)
│   └── CORSMiddleware.php (CORS handling)
├── utils/
│   ├── JWTHandler.php (JWT token generation)
│   ├── Response.php (Response formatting)
│   ├── Request.php (Request parsing)
│   ├── Database.php (Database queries)
│   └── Utilities.php (Helper functions)
└── start.sh (Server startup script)
```

## Default Credentials

- Email: `admin@maintenance.local`
- Password: `admin123`

## Troubleshooting

### Port 2390 already in use

Use a different port:
```bash
php -S localhost:3000 -t . api/index.php
```

### MySQL connection error

Check database credentials in `config/database.php`

### CORS errors

Make sure CORSMiddleware is properly configured in the API router

## Security Notes

- Change `JWT_SECRET` in config/constants.php for production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Validate all user inputs on the backend
- Use prepared statements to prevent SQL injection (already implemented)
