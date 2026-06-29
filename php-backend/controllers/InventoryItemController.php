<?php
/**
 * InventoryItem Controller
 */

require_once __DIR__ . '/../models/InventoryItem.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class InventoryItemController {
    private $inventoryModel;
    private $auth;

    public function __construct($connection) {
        $this->inventoryModel = new InventoryItem($connection);
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

        $items = $this->inventoryModel->getAll($limit, $offset);
        $total = $this->inventoryModel->count();

        Response::paginated($items, $total, $page, $limit, 'Inventory items retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $item = $this->inventoryModel->findById($id);
        if (!$item) {
            Response::error('Inventory item not found', 404);
        }

        Response::success($item, 'Inventory item retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'stores']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['part_name'] || !$data['category']) {
            Response::error('Required fields are missing', 400);
        }

        if ($this->inventoryModel->create($data)) {
            Response::success([], 'Inventory item created successfully', 201);
        }

        Response::error('Failed to create inventory item', 500);
    }

    public function update($id) {
        $this->auth->authenticateRoles(['admin', 'stores']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $item = $this->inventoryModel->findById($id);
        if (!$item) {
            Response::error('Inventory item not found', 404);
        }

        $data = Request::all();

        if ($this->inventoryModel->update($id, $data)) {
            Response::success(['id' => $id], 'Inventory item updated successfully', 200);
        }

        Response::error('Failed to update inventory item', 500);
    }

    public function delete($id) {
        $this->auth->authorizeRole('admin');

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $item = $this->inventoryModel->findById($id);
        if (!$item) {
            Response::error('Inventory item not found', 404);
        }

        if ($this->inventoryModel->delete($id)) {
            Response::success([], 'Inventory item deleted successfully', 200);
        }

        Response::error('Failed to delete inventory item', 500);
    }

    public function getLowStock() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $items = $this->inventoryModel->getLowStock($limit, $offset);
        $total = $this->inventoryModel->countLowStock();

        Response::paginated($items, $total, $page, $limit, 'Low stock items');
    }

    public function getByCategory() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $category = $_GET['category'] ?? null;
        if (!$category) {
            Response::error('Category is required', 400);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $items = $this->inventoryModel->getByCategory($category, $limit, $offset);
        $total = count($items);

        Response::paginated($items, $total, $page, $limit, 'Inventory items by category');
    }

    public function deductStock($id) {
        $this->auth->authenticateRoles(['admin', 'stores']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();
        $quantity = (int)($data['quantity'] ?? 0);

        if ($quantity <= 0) {
            Response::error('Quantity must be greater than 0', 400);
        }

        $item = $this->inventoryModel->findById($id);
        if (!$item) {
            Response::error('Inventory item not found', 404);
        }

        if ($item['quantity_in_stock'] < $quantity) {
            Response::error('Insufficient stock', 400);
        }

        if ($this->inventoryModel->deductStock($id, $quantity)) {
            Response::success(['id' => $id, 'new_quantity' => $item['quantity_in_stock'] - $quantity], 'Stock deducted successfully', 200);
        }

        Response::error('Failed to deduct stock', 500);
    }

    public function addStock($id) {
        $this->auth->authenticateRoles(['admin', 'stores']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();
        $quantity = (int)($data['quantity'] ?? 0);

        if ($quantity <= 0) {
            Response::error('Quantity must be greater than 0', 400);
        }

        $item = $this->inventoryModel->findById($id);
        if (!$item) {
            Response::error('Inventory item not found', 404);
        }

        if ($this->inventoryModel->addStock($id, $quantity)) {
            Response::success(['id' => $id, 'new_quantity' => $item['quantity_in_stock'] + $quantity], 'Stock added successfully', 200);
        }

        Response::error('Failed to add stock', 500);
    }

    public function search() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $query = $_GET['q'] ?? '';
        if (!$query) {
            Response::error('Search query is required', 400);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $items = $this->inventoryModel->search($query, $limit, $offset);
        $total = count($items);

        Response::paginated($items, $total, $page, $limit, 'Search results');
    }
}
?>
