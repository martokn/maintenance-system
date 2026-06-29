<?php
/**
 * Notification Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class Notification {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        return $this->db->insert('notifications', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM notifications WHERE id = $id");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM notifications ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getLatest($limit = 10) {
        $limit = (int)$limit;
        return $this->db->fetchAll("SELECT * FROM notifications ORDER BY created_date DESC LIMIT $limit");
    }

    public function getByType($type, $limit = 100, $offset = 0) {
        $type = $this->db->escape($type);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM notifications WHERE type = '$type' ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getByDepartment($department, $limit = 100, $offset = 0) {
        $department = $this->db->escape($department);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM notifications WHERE target_department IN ('$department', 'All') ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function getUnread($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_date DESC LIMIT $limit OFFSET $offset");
    }

    public function markAsRead($id) {
        return $this->db->update('notifications', ['is_read' => 1], 'id', $id);
    }

    public function markAllAsRead() {
        $sql = "UPDATE notifications SET is_read = 1 WHERE is_read = 0";
        return $this->db->query($sql);
    }

    public function delete($id) {
        return $this->db->delete('notifications', 'id', $id);
    }

    public function count() {
        return $this->db->count('notifications');
    }

    public function countUnread() {
        return $this->db->count('notifications', 'is_read = 0');
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
