<?php
require_once __DIR__ . '/bootstrap.php';
/**
 * API Router
 */

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../middleware/CORSMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/VehicleController.php';
require_once __DIR__ . '/../controllers/InspectionReportController.php';
require_once __DIR__ . '/../controllers/JobCardController.php';
require_once __DIR__ . '/../controllers/PartsRequestController.php';
require_once __DIR__ . '/../controllers/InventoryItemController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';

// Handle CORS
CORSMiddleware::handleCORS();

// Get database connection
$conn = require_once __DIR__ . '/../config/database.php';

// Parse URL - works with both /api/... and /fuel/php-backend/api/... paths
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$api_pos = strpos($request_uri, '/api/');
$request_uri = $api_pos !== false ? substr($request_uri, $api_pos + 5) : '';
$parts = array_values(array_filter(explode('/', $request_uri)));

// Route handling
if (count($parts) === 0) {
    Response::success(['version' => '1.0', 'status' => 'API is running'], 'Welcome to Maintenance System API');
}

$resource = $parts[0] ?? null;
$id = $parts[1] ?? null;
$action = $parts[2] ?? null;

// If id is a non-numeric string and no action, treat it as an action
if ($id !== null && $action === null && !is_numeric($id)) {
    $action = $id;
    $id = null;
}

header("Content-Type: application/json");

try {
    // Auth routes
    if ($resource === 'auth') {
        $authController = new AuthController($conn);
        
        if ($action === 'login') {
            $authController->login();
        } elseif ($action === 'register') {
            $authController->register();
        } elseif ($action === 'me') {
            $authController->me();
        } elseif ($action === 'logout') {
            $authController->logout();
        } else {
            Response::error('Unknown auth action', 404);
        }
    }

    // Vehicle routes
    elseif ($resource === 'vehicles') {
        $vehicleController = new VehicleController($conn);
        
        if (!$id && !$action) {
            $vehicleController->list();
        } elseif ($id && !$action) {
            $vehicleController->get((int)$id);
        } elseif ($id && $action === 'update') {
            $vehicleController->update((int)$id);
        } elseif ($id && $action === 'delete') {
            $vehicleController->delete((int)$id);
        } elseif ($action === 'create') {
            $vehicleController->create();
        } elseif ($action === 'search') {
            $vehicleController->search();
        } elseif ($action === 'by-status') {
            $vehicleController->getByStatus();
        } else {
            Response::error('Unknown vehicle action', 404);
        }
    }

    // InspectionReport routes
    elseif ($resource === 'inspection-reports') {
        $reportController = new InspectionReportController($conn);
        
        if (!$id && !$action) {
            $reportController->list();
        } elseif ($id && !$action) {
            $reportController->get((int)$id);
        } elseif ($id && $action === 'update') {
            $reportController->update((int)$id);
        } elseif ($id && $action === 'delete') {
            $reportController->delete((int)$id);
        } elseif ($action === 'create') {
            $reportController->create();
        } elseif ($action === 'by-vehicle' && $id) {
            $reportController->getByVehicle((int)$id);
        } elseif ($action === 'by-status') {
            $reportController->getByStatus();
        } else {
            Response::error('Unknown inspection report action', 404);
        }
    }

    // JobCard routes
    elseif ($resource === 'job-cards') {
        $jobController = new JobCardController($conn);
        
        if (!$id && !$action) {
            $jobController->list();
        } elseif ($id && !$action) {
            $jobController->get((int)$id);
        } elseif ($id && $action === 'update') {
            $jobController->update((int)$id);
        } elseif ($id && $action === 'delete') {
            $jobController->delete((int)$id);
        } elseif ($action === 'create') {
            $jobController->create();
        } elseif ($action === 'by-status') {
            $jobController->getByStatus();
        } else {
            Response::error('Unknown job card action', 404);
        }
    }

    // PartsRequest routes
    elseif ($resource === 'parts-requests') {
        $partsController = new PartsRequestController($conn);
        
        if (!$id && !$action) {
            $partsController->list();
        } elseif ($id && !$action) {
            $partsController->get((int)$id);
        } elseif ($id && $action === 'update') {
            $partsController->update((int)$id);
        } elseif ($id && $action === 'delete') {
            $partsController->delete((int)$id);
        } elseif ($action === 'create') {
            $partsController->create();
        } elseif ($action === 'by-status') {
            $partsController->getByStatus();
        } else {
            Response::error('Unknown parts request action', 404);
        }
    }

    // InventoryItem routes
    elseif ($resource === 'inventory') {
        $inventoryController = new InventoryItemController($conn);
        
        if (!$id && !$action) {
            $inventoryController->list();
        } elseif ($id && !$action) {
            $inventoryController->get((int)$id);
        } elseif ($id && $action === 'update') {
            $inventoryController->update((int)$id);
        } elseif ($id && $action === 'delete') {
            $inventoryController->delete((int)$id);
        } elseif ($action === 'create') {
            $inventoryController->create();
        } elseif ($action === 'low-stock') {
            $inventoryController->getLowStock();
        } elseif ($action === 'by-category') {
            $inventoryController->getByCategory();
        } elseif ($id && $action === 'deduct-stock') {
            $inventoryController->deductStock((int)$id);
        } elseif ($id && $action === 'add-stock') {
            $inventoryController->addStock((int)$id);
        } elseif ($action === 'search') {
            $inventoryController->search();
        } else {
            Response::error('Unknown inventory action', 404);
        }
    }

    // Notification routes
    elseif ($resource === 'notifications') {
        $notificationController = new NotificationController($conn);
        
        if (!$id && !$action) {
            $notificationController->list();
        } elseif ($id && !$action) {
            $notificationController->get((int)$id);
        } elseif ($id && $action === 'delete') {
            $notificationController->delete((int)$id);
        } elseif ($action === 'create') {
            $notificationController->create();
        } elseif ($action === 'latest') {
            $notificationController->getLatest();
        } elseif ($action === 'by-type') {
            $notificationController->getByType();
        } elseif ($action === 'unread') {
            $notificationController->getUnread();
        } elseif ($id && $action === 'mark-as-read') {
            $notificationController->markAsRead((int)$id);
        } elseif ($action === 'mark-all-as-read') {
            $notificationController->markAllAsRead();
        } else {
            Response::error('Unknown notification action', 404);
        }
    }

    else {
        Response::error('Resource not found', 404);
    }

} catch (Exception $e) {
    Response::error('An error occurred: ' . $e->getMessage(), 500);
}

$conn->close();
?>
