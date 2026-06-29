<?php
/**
 * JobCard Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class JobCard {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        $data['job_number'] = Utilities::generateNumber('JOB');
        return $this->db->insert('job_cards', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM job_cards WHERE id = $id");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM job_cards ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByStatus($status, $limit = 100, $offset = 0) {
        $status = $this->db->escape($status);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM job_cards WHERE status = '$status' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByInspectionReport($report_id, $limit = 100, $offset = 0) {
        $report_id = (int)$report_id;
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM job_cards WHERE inspection_report_id = $report_id ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByMechanic($mechanic_name, $limit = 100, $offset = 0) {
        $mechanic_name = $this->db->escape($mechanic_name);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM job_cards WHERE assigned_mechanic = '$mechanic_name' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function update($id, $data) {
        $data = $this->sanitize($data);
        return $this->db->update('job_cards', $data, 'id', $id);
    }

    public function delete($id) {
        return $this->db->delete('job_cards', 'id', $id);
    }

    public function count() {
        return $this->db->count('job_cards');
    }

    public function countByStatus($status) {
        $status = $this->db->escape($status);
        return $this->db->count('job_cards', "status = '$status'");
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return is_array($value) ? json_encode($value) : htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
