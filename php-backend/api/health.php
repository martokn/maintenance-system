<?php
require_once __DIR__ . '/bootstrap.php';
/**
 * Health Check Endpoint
 */

$conn = require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

// Check database connection


if ($conn->connect_error) {
    Response::error('Database connection failed', 500);
}

Response::success([
    'status' => 'healthy',
    'database' => 'connected',
    'timestamp' => date('Y-m-d H:i:s')
], 'System is healthy');
?>
