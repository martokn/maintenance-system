<?php
/**
 * InspectionReport Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class InspectionReport {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        $data['report_number'] = Utilities::generateNumber('INS');
        return $this->db->insert('inspection_reports', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM inspection_reports WHERE id = $id");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inspection_reports ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByStatus($status, $limit = 100, $offset = 0) {
        $status = $this->db->escape($status);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inspection_reports WHERE status = '$status' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByVehicle($vehicle_id, $limit = 100, $offset = 0) {
        $vehicle_id = (int)$vehicle_id;
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inspection_reports WHERE vehicle_id = $vehicle_id ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByDepartment($department, $limit = 100, $offset = 0) {
        $department = $this->db->escape($department);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inspection_reports WHERE vehicle_department = '$department' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function update($id, $data) {
        $data = $this->sanitize($data);
        return $this->db->update('inspection_reports', $data, 'id', $id);
    }

    public function delete($id) {
        return $this->db->delete('inspection_reports', 'id', $id);
    }

    public function count() {
        return $this->db->count('inspection_reports');
    }

    public function countByStatus($status) {
        $status = $this->db->escape($status);
        return $this->db->count('inspection_reports', "status = '$status'");
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return is_array($value) ? json_encode($value) : htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
