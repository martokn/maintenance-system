<?php
/**
 * PartsRequest Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class PartsRequest {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        $data['request_number'] = Utilities::generateNumber('PR');
        return $this->db->insert('parts_requests', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM parts_requests WHERE id = $id");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM parts_requests ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByStatus($status, $limit = 100, $offset = 0) {
        $status = $this->db->escape($status);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM parts_requests WHERE status = '$status' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByJobCard($job_card_id, $limit = 100, $offset = 0) {
        $job_card_id = (int)$job_card_id;
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM parts_requests WHERE job_card_id = $job_card_id ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function update($id, $data) {
        $data = $this->sanitize($data);
        return $this->db->update('parts_requests', $data, 'id', $id);
    }

    public function delete($id) {
        return $this->db->delete('parts_requests', 'id', $id);
    }

    public function count() {
        return $this->db->count('parts_requests');
    }

    public function countByStatus($status) {
        $status = $this->db->escape($status);
        return $this->db->count('parts_requests', "status = '$status'");
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return is_array($value) ? json_encode($value) : htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
