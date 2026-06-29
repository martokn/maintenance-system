<?php
/**
 * Database Setup Script (PHP) - Enhanced Version
 */

echo "\n=================================\n";
echo "Maintenance System - DB Setup\n";
echo "=================================\n\n";

echo "Attempting to connect to MySQL/MariaDB...\n\n";

// Try to detect MySQL socket
$socket_paths = [
    '/var/run/mysqld/mysqld.sock',
    '/var/run/mysql/mysql.sock',
    '/tmp/mysql.sock'
];

$db_socket = null;
foreach ($socket_paths as $path) {
    if (file_exists($path)) {
        $db_socket = $path;
        echo "✓ Found MySQL socket: $path\n";
        break;
    }
}

// Try different connection configs
$configs = [
    ['host' => 'localhost', 'user' => 'root', 'pass' => '', 'port' => 3306],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => '', 'port' => 3306],
];

$conn = null;

foreach ($configs as $config) {
    $sock = ($db_socket && $config['host'] === 'localhost') ? $db_socket : null;
    
    @$conn = new mysqli(
        $config['host'],
        $config['user'],
        $config['pass'],
        '',
        $config['port'],
        $sock
    );
    
    if (!$conn->connect_error) {
        echo "✓ Connected to MySQL!\n";
        break;
    }
}

if (!$conn || $conn->connect_error) {
    echo "❌ ERROR: Could not connect to MySQL\n\n";
    echo "TROUBLESHOOTING:\n";
    echo "1. Ensure MySQL/MariaDB is installed:\n";
    echo "   Ubuntu/Debian: sudo apt install mysql-server\n";
    echo "   macOS: brew install mysql\n\n";
    echo "2. Start MySQL service:\n";
    echo "   Ubuntu/Debian: sudo service mysql start\n";
    echo "   macOS: brew services start mysql\n\n";
    echo "3. Set MySQL root password:\n";
    echo "   sudo mysql -u root\n";
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';\n\n";
    echo "4. Then update config/database.php with your credentials\n\n";
    exit(1);
}

echo "\n";

// Read SQL setup file
$sql_file = __DIR__ . '/config/setup.sql';
if (!file_exists($sql_file)) {
    echo "ERROR: setup.sql not found at $sql_file\n";
    exit(1);
}

$sql_content = file_get_contents($sql_file);

// Split by semicolon and filter empty statements
$statements = array_filter(
    array_map('trim', explode(';', $sql_content)),
    function($stmt) {
        return !empty($stmt) && !preg_match('/^--/', trim($stmt));
    }
);

echo "Executing database setup...\n";
echo "Total statements: " . count($statements) . "\n\n";

$success = 0;
$skipped = 0;

foreach ($statements as $stmt) {
    if (empty(trim($stmt))) {
        continue;
    }
    
    // Execute statement
    if ($conn->query($stmt)) {
        $success++;
    } else {
        // Check if it's a "table already exists" error
        if (strpos($conn->error, 'already exists') !== false) {
            $skipped++;
        } else {
            echo "Warning: " . $conn->error . "\n";
        }
    }
}

$conn->close();

echo "\n=================================\n";
echo "✓ Setup Complete!\n";
echo "=================================\n\n";

echo "Results:\n";
echo "  - Executed: $success statements\n";
echo "  - Skipped: $skipped (existing tables)\n\n";

echo "Database Configuration:\n";
echo "  - Database: maintenance_system_db\n";
echo "  - Default User: admin@maintenance.local\n";
echo "  - Default Password: admin123\n\n";

echo "NEXT STEPS:\n";
echo "1. Start PHP server:\n";
echo "   cd php-backend && ./start.sh\n\n";
echo "2. In another terminal, start React frontend:\n";
echo "   npm install\n";
echo "   npm run dev\n\n";
echo "3. Login with default credentials\n\n";
?>

