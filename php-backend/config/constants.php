<?php
/**
 * Application Constants
 */

// App Config
define('APP_URL', 'http://localhost:2390');
define('APP_NAME', 'Maintenance System');
define('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production-12345');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRE_TIME', 86400); // 24 hours

// Pagination
define('ITEMS_PER_PAGE', 20);

// Upload
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10485760); // 10MB

// Status Constants
define('VEHICLE_STATUS', ['Active', 'In Maintenance', 'Grounded']);
define('INSPECTION_STATUS', ['Awaiting Approval', 'Approved', 'Rejected', 'Completed', 'Verified']);
define('JOBCARD_STATUS', ['In Progress', 'Awaiting Parts', 'Completed', 'Verified']);
define('PARTSREQUEST_STATUS', ['Pending', 'Approved', 'Partially Issued', 'Issued', 'Rejected']);
define('NOTIFICATION_TYPE', ['inspection', 'approval', 'parts', 'completion', 'info']);
define('NOTIFICATION_TARGET', ['Inspection', 'Department Approver', 'Workshop', 'Stores', 'All']);

?>
