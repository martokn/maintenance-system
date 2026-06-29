<?php
/**
 * InspectionReport Controller
 */

require_once __DIR__ . '/../models/InspectionReport.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class InspectionReportController {
    private $reportModel;
    private $auth;

    public function __construct($connection) {
        $this->reportModel = new InspectionReport($connection);
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

        $reports = $this->reportModel->getAll($limit, $offset);
        $total = $this->reportModel->count();

        foreach ($reports as &$report) {
            if (isset($report['photos'])) {
                $report['photos'] = json_decode($report['photos'], true) ?? [];
            }
        }

        Response::paginated($reports, $total, $page, $limit, 'Reports retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $report = $this->reportModel->findById($id);
        if (!$report) {
            Response::error('Report not found', 404);
        }

        // Parse JSON fields
        if (isset($report['photos'])) {
            $report['photos'] = json_decode($report['photos'], true) ?? [];
        }

        Response::success($report, 'Report retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'inspector']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['vehicle_id'] || !$data['plate_number'] || !$data['inspector_name'] || !$data['findings']) {
            Response::error('Required fields are missing', 400);
        }

        if (isset($data['photos']) && is_array($data['photos'])) {
            $data['photos'] = json_encode($data['photos']);
        }

        if ($this->reportModel->create($data)) {
            Response::success([], 'Report created successfully', 201);
        }

        Response::error('Failed to create report', 500);
    }

    public function update($id) {
        $this->auth->authenticateRoles(['admin', 'inspector', 'approver']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $report = $this->reportModel->findById($id);
        if (!$report) {
            Response::error('Report not found', 404);
        }

        $data = Request::all();

        if (isset($data['photos']) && is_array($data['photos'])) {
            $data['photos'] = json_encode($data['photos']);
        }

        if ($this->reportModel->update($id, $data)) {
            Response::success(['id' => $id], 'Report updated successfully', 200);
        }

        Response::error('Failed to update report', 500);
    }

    public function delete($id) {
        $this->auth->authorizeRole('admin');

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $report = $this->reportModel->findById($id);
        if (!$report) {
            Response::error('Report not found', 404);
        }

        if ($this->reportModel->delete($id)) {
            Response::success([], 'Report deleted successfully', 200);
        }

        Response::error('Failed to delete report', 500);
    }

    public function getByVehicle($vehicle_id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = ($page - 1) * $limit;

        $reports = $this->reportModel->getByVehicle($vehicle_id, $limit, $offset);
        $total = count($reports);

        foreach ($reports as &$report) {
            if (isset($report['photos'])) {
                $report['photos'] = json_decode($report['photos'], true) ?? [];
            }
        }

        Response::paginated($reports, $total, $page, $limit, 'Reports for vehicle');
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

        $reports = $this->reportModel->getByStatus($status, $limit, $offset);
        $total = count($reports);

        foreach ($reports as &$report) {
            if (isset($report['photos'])) {
                $report['photos'] = json_decode($report['photos'], true) ?? [];
            }
        }

        Response::paginated($reports, $total, $page, $limit, 'Reports by status');
    }
}
?>
