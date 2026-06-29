# Complete Setup Guide

## Installation Steps

### Step 1: Prerequisites

Ensure you have:
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Git (optional)

### Step 2: Setup Database

1. Open terminal and navigate to the project directory:
```bash
cd '/home/kaliu/Downloads/maintainance website 2/php-backend'
```

2. Run the database setup script:
```bash
# On Linux/Mac
chmod +x setup-db.sh
./setup-db.sh

# On Windows (use command prompt)
mysql -u root < config/setup.sql
```

3. Enter your MySQL root password when prompted

### Step 3: Start PHP Server

```bash
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

### Step 4: Verify Server is Running

Open your browser and navigate to:
- API Info: http://localhost:2390
- Health Check: http://localhost:2390/health
- API Endpoint: http://localhost:2390/api

### Step 5: Start React Frontend

In another terminal:
```bash
cd '/home/kaliu/Downloads/maintainance website 2'
npm install
npm run dev
```

### Step 6: Test Login

Frontend should now connect to PHP backend automatically.

**Default Credentials:**
- Email: `admin@maintenance.local`
- Password: `admin123`

## Port Configuration

Default: **2390**

To use a different port, edit `start.sh`:
```bash
php -S localhost:YOUR_PORT -t . api/index.php
```

## Database Configuration

If you need to change database settings, edit `php-backend/config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
define('DB_NAME', 'maintenance_system_db');
```

## Troubleshooting

### Issue: "Connection refused"
- Make sure PHP server is running
- Check if port 2390 is available
- Try a different port

### Issue: "Database connection failed"
- Verify MySQL is running
- Check database credentials
- Ensure database is created

### Issue: CORS errors
- CORS is already configured in the API
- Make sure frontend is calling `http://localhost:2390/api`

### Issue: 401 Unauthorized
- Make sure you're sending the JWT token in requests
- Token should be in Authorization header: `Bearer {token}`
- Check token expiration (default: 24 hours)

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:2390/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maintenance.local",
    "password": "admin123"
  }'
```

### Get All Vehicles
```bash
curl -X GET http://localhost:2390/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Vehicle
```bash
curl -X POST http://localhost:2390/api/vehicles/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "plate_number": "ABC123",
    "make": "Toyota",
    "model": "Hilux",
    "year": 2020,
    "department": "Roads Department"
  }'
```

## Security Considerations

1. **JWT Secret**: Change in `config/constants.php` for production
```php
define('JWT_SECRET', 'your-secret-key-here');
```

2. **Password Security**: Passwords are hashed using bcrypt

3. **SQL Injection**: All queries use prepared statements

4. **CORS**: Configured to allow requests from frontend

## File Structure

```
php-backend/
├── api/                    # API endpoints
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── models/                 # Data models
├── middleware/             # Auth & CORS
├── utils/                  # Helper functions
├── index.php              # API info endpoint
├── start.sh               # Server startup script
├── setup-db.sh            # Database setup script
└── README.md              # This file
```

## Next Steps

1. Customize user roles and permissions
2. Add more validation rules
3. Implement email notifications
4. Set up file uploads
5. Add activity logging
6. Implement backup strategy

## Support

For issues or questions, check:
- PHP error logs in `logs/` directory
- Database via MySQL client
- Browser console for frontend errors
