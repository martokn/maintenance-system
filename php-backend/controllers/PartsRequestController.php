<?php
/**
 * PartsRequest Controller
 */

require_once __DIR__ . '/../models/PartsRequest.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PartsRequestController {
    private $partsRequestModel;
    private $auth;

    public function __construct($connection) {
        $this->partsRequestModel = new PartsRequest($connection);
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

        $requests = $this->partsRequestModel->getAll($limit, $offset);
        $total = $this->partsRequestModel->count();

        // Parse JSON items field
        foreach ($requests as &$request) {
            if (isset($request['items'])) {
                $request['items'] = json_decode($request['items'], true) ?? [];
            }
        }

        Response::paginated($requests, $total, $page, $limit, 'Parts requests retrieved successfully');
    }

    public function get($id) {
        $this->auth->authenticate();

        if (!Request::isGet()) {
            Response::error('Method not allowed', 405);
        }

        $request = $this->partsRequestModel->findById($id);
        if (!$request) {
            Response::error('Parts request not found', 404);
        }

        if (isset($request['items'])) {
            $request['items'] = json_decode($request['items'], true) ?? [];
        }

        Response::success($request, 'Parts request retrieved successfully', 200);
    }

    public function create() {
        $this->auth->authenticateRoles(['admin', 'mechanic']);

        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();

        if (!$data['job_card_id'] || !$data['job_number'] || !$data['requested_by']) {
            Response::error('Required fields are missing', 400);
        }

        if (isset($data['items']) && is_array($data['items'])) {
            $data['items'] = json_encode($data['items']);
        }

        if ($this->partsRequestModel->create($data)) {
            Response::success([], 'Parts request created successfully', 201);
        }

        Response::error('Failed to create parts request', 500);
    }

    public function update($id) {
        $this->auth->authenticateRoles(['admin', 'mechanic', 'stores']);

        if (!Request::isPut()) {
            Response::error('Method not allowed', 405);
        }

        $request = $this->partsRequestModel->findById($id);
        if (!$request) {
            Response::error('Parts request not found', 404);
        }

        $data = Request::all();

        if (isset($data['items']) && is_array($data['items'])) {
            $data['items'] = json_encode($data['items']);
        }

        if ($this->partsRequestModel->update($id, $data)) {
            Response::success(['id' => $id], 'Parts request updated successfully', 200);
        }

        Response::error('Failed to update parts request', 500);
    }

    public function delete($id) {
        $this->auth->authorizeRole('admin');

        if (!Request::isDelete()) {
            Response::error('Method not allowed', 405);
        }

        $request = $this->partsRequestModel->findById($id);
        if (!$request) {
            Response::error('Parts request not found', 404);
        }

        if ($this->partsRequestModel->delete($id)) {
            Response::success([], 'Parts request deleted successfully', 200);
        }

        Response::error('Failed to delete parts request', 500);
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

        $requests = $this->partsRequestModel->getByStatus($status, $limit, $offset);
        $total = count($requests);

        // Parse JSON items field
        foreach ($requests as &$request) {
            if (isset($request['items'])) {
                $request['items'] = json_decode($request['items'], true) ?? [];
            }
        }

        Response::paginated($requests, $total, $page, $limit, 'Parts requests by status');
    }
}
?>
