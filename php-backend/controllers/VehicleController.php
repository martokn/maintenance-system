<?php
/**
 * Vehicle Controller
 */

require_once __DIR__ . '/../models/Vehicle.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class VehicleController {
    private $vehicleModel;
    private $auth;

    public function __construct($connection) {
        $this->vehicleModel = new Vehicle($connection);
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

        $vehicles = $this->vehicleModel->getAll($limit, $offset);
        $total = $this->vehicleModel->count();

        Response::paginated($vehicles, $total, $page, $limit, 'Vehicles retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $vehicle = $this->vehicleModel->findById($id);
        if (!$vehicle) {
            Response::error('Vehicle not found', 404);
        }

        Response::success($vehicle, 'Vehicle retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'inspector']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['plate_number'] || !$data['make'] || !$data['model'] || !$data['department']) {
            Response::error('Required fields are missing', 400);
        }

        if ($this->vehicleModel->create($data)) {
            $id = $this->vehicleModel->findByPlate($data['plate_number'])['id'];
            Response::success(['id' => $id], 'Vehicle created successfully', 201);
        }

        Response::error('Failed to create vehicle', 500);
    }

    public function update($id) {
        $this->auth->authenticateRoles(['admin', 'inspector']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $vehicle = $this->vehicleModel->findById($id);
        if (!$vehicle) {
            Response::error('Vehicle not found', 404);
        }

        $data = Request::all();

        if ($this->vehicleModel->update($id, $data)) {
            Response::success(['id' => $id], 'Vehicle updated successfully', 200);
        }

        Response::error('Failed to update vehicle', 500);
    }

    public function delete($id) {
        $this->auth->authorizeRole('admin');

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $vehicle = $this->vehicleModel->findById($id);
        if (!$vehicle) {
            Response::error('Vehicle not found', 404);
        }

        if ($this->vehicleModel->delete($id)) {
            Response::success([], 'Vehicle deleted successfully', 200);
        }

        Response::error('Failed to delete vehicle', 500);
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

        $vehicles = $this->vehicleModel->search($query, $limit, $offset);
        $total = count($vehicles);

        Response::paginated($vehicles, $total, $page, $limit, 'Search results');
    }

    public function getByStatus() {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $status = $_GET['status'] ?? null;
        if (!$status) {
            Response::error('Status is required', 400);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $vehicles = $this->vehicleModel->getByStatus($status, $limit, $offset);
        $total = count($vehicles);

        Response::paginated($vehicles, $total, $page, $limit, 'Vehicles by status');
    }
}
?>
