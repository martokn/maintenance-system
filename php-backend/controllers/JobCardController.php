<?php
/**
 * JobCard Controller
 */

require_once __DIR__ . '/../models/JobCard.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class JobCardController {
    private $jobCardModel;
    private $auth;

    public function __construct($connection) {
        $this->jobCardModel = new JobCard($connection);
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

        $jobcards = $this->jobCardModel->getAll($limit, $offset);
        $total = $this->jobCardModel->count();

        Response::paginated($jobcards, $total, $page, $limit, 'Job cards retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $jobcard = $this->jobCardModel->findById($id);
        if (!$jobcard) {
            Response::error('Job card not found', 404);
        }

        Response::success($jobcard, 'Job card retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'approver', 'mechanic']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['inspection_report_id'] || !$data['vehicle_id'] || !$data['plate_number'] || !$data['approved_repair']) {
            Response::error('Required fields are missing', 400);
        }

        if ($this->jobCardModel->create($data)) {
            Response::success([], 'Job card created successfully', 201);
        }

        Response::error('Failed to create job card', 500);
    }

    public function update($id) {
        $this->auth->authenticateRoles(['admin', 'mechanic']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $jobcard = $this->jobCardModel->findById($id);
        if (!$jobcard) {
            Response::error('Job card not found', 404);
        }

        $data = Request::all();

        if ($this->jobCardModel->update($id, $data)) {
            Response::success(['id' => $id], 'Job card updated successfully', 200);
        }

        Response::error('Failed to update job card', 500);
    }

    public function delete($id) {
        $this->auth->authorizeRole('admin');

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $jobcard = $this->jobCardModel->findById($id);
        if (!$jobcard) {
            Response::error('Job card not found', 404);
        }

        if ($this->jobCardModel->delete($id)) {
            Response::success([], 'Job card deleted successfully', 200);
        }

        Response::error('Failed to delete job card', 500);
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

        $jobcards = $this->jobCardModel->getByStatus($status, $limit, $offset);
        $total = count($jobcards);

        Response::paginated($jobcards, $total, $page, $limit, 'Job cards by status');
    }
}
?>
