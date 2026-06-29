<?php
/**
 * Vehicle Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class Vehicle {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        return $this->db->insert('vehicles', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM vehicles WHERE id = $id");
    }

    public function findByPlate($plate) {
        $plate = $this->db->escape($plate);
        return $this->db->fetchOne("SELECT * FROM vehicles WHERE plate_number = '$plate'");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM vehicles LIMIT $limit OFFSET $offset");
    }

    public function getByDepartment($department, $limit = 100, $offset = 0) {
        $department = $this->db->escape($department);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM vehicles WHERE department = '$department' LIMIT $limit OFFSET $offset");
    }

    public function getByStatus($status, $limit = 100, $offset = 0) {
        $status = $this->db->escape($status);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM vehicles WHERE status = '$status' LIMIT $limit OFFSET $offset");
    }

    public function update($id, $data) {
        $data = $this->sanitize($data);
        return $this->db->update('vehicles', $data, 'id', $id);
    }

    public function delete($id) {
        return $this->db->delete('vehicles', 'id', $id);
    }

    public function count() {
        return $this->db->count('vehicles');
    }

    public function search($query, $limit = 100, $offset = 0) {
        $query = $this->db->escape($query);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM vehicles WHERE plate_number LIKE '%$query%' OR make LIKE '%$query%' OR model LIKE '%$query%' LIMIT $limit OFFSET $offset");
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
