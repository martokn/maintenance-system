<?php
/**
 * Notification Controller
 */

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class NotificationController {
    private $notificationModel;
    private $auth;

    public function __construct($connection) {
        $this->notificationModel = new Notification($connection);
        $this->auth = new AuthMiddleware();
    }

    public function list() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $notifications = $this->notificationModel->getAll($limit, $offset);
        $total = $this->notificationModel->count();

        Response::paginated($notifications, $total, $page, $limit, 'Notifications retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $notification = $this->notificationModel->findById($id);
        if (!$notification) {
            Response::error('Notification not found', 404);
        }

        Response::success($notification, 'Notification retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'inspector', 'approver', 'mechanic', 'stores']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['message'] || !$data['type'] || !$data['target_department']) {
            Response::error('Required fields are missing', 400);
        }

        if ($this->notificationModel->create($data)) {
            Response::success([], 'Notification created successfully', 201);
        }

        Response::error('Failed to create notification', 500);
    }

    public function delete($id) {
        $this->auth->authenticateRoles(['admin']);

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $notification = $this->notificationModel->findById($id);
        if (!$notification) {
            Response::error('Notification not found', 404);
        }

        if ($this->notificationModel->delete($id)) {
            Response::success([], 'Notification deleted successfully', 200);
        }

        Response::error('Failed to delete notification', 500);
    }

    public function getLatest() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $limit = (int)($_GET['limit'] ?? 10);
        $notifications = $this->notificationModel->getLatest($limit);

        Response::success($notifications, 'Latest notifications retrieved successfully', 200);
    }

    public function getByType() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $type = $_GET['type'] ?? null;
        if (!$type) {
            Response::error('Type is required', 400);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $notifications = $this->notificationModel->getByType($type, $limit, $offset);
        $total = count($notifications);

        Response::paginated($notifications, $total, $page, $limit, 'Notifications by type');
    }

    public function getUnread() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $notifications = $this->notificationModel->getUnread($limit, $offset);
        $total = $this->notificationModel->countUnread();

        Response::paginated($notifications, $total, $page, $limit, 'Unread notifications');
    }

    public function markAsRead($id) {
        $this->auth->authenticate();

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $notification = $this->notificationModel->findById($id);
        if (!$notification) {
            Response::error('Notification not found', 404);
        }

        if ($this->notificationModel->markAsRead($id)) {
            Response::success([], 'Notification marked as read', 200);
        }

        Response::error('Failed to mark notification as read', 500);
    }

    public function markAllAsRead() {
        $this->auth->authenticate();

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        if ($this->notificationModel->markAllAsRead()) {
            Response::success([], 'All notifications marked as read', 200);
        }

        Response::error('Failed to mark notifications as read', 500);
    }
}
?>
