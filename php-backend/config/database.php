<?php
/**
 * Database Configuration
 */

defined('DB_HOST') || define('DB_HOST', 'localhost');
defined('DB_USER') || define('DB_USER', 'root');
defined('DB_PASS') || define('DB_PASS', '');
defined('DB_NAME') || define('DB_NAME', 'maintenance_system_db');
defined('DB_PORT') || define('DB_PORT', 3306);

// Create connection testing commit 
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    
    // Check connection
    if ($conn->connect_error) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => $conn->connect_error,
            'details' => 'Please ensure MySQL is running and database "' . DB_NAME . '" exists. Run: php setup-db.php'
        ]);
        exit;
    }
    
    // Set charset
    $conn->set_charset('utf8mb4');
    
} catch (mysqli_sql_exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage(),
        'hint' => 'Ensure MySQL credentials in config/database.php are correct'
    ]);
    exit;
}

return $conn;
?>
