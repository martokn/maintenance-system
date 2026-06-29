<?php
/**
 * InventoryItem Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class InventoryItem {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function create($data) {
        $data = $this->sanitize($data);
        return $this->db->insert('inventory_items', $data);
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM inventory_items WHERE id = $id");
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inventory_items ORDER BY part_name ASC LIMIT $limit OFFSET $offset");
    }

    public function getByCategory($category, $limit = 100, $offset = 0) {
        $category = $this->db->escape($category);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inventory_items WHERE category = '$category' ORDER BY part_name ASC LIMIT $limit OFFSET $offset");
    }

    public function getLowStock($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inventory_items WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC LIMIT $limit OFFSET $offset");
    }

    public function update($id, $data) {
        $data = $this->sanitize($data);
        return $this->db->update('inventory_items', $data, 'id', $id);
    }

    public function deductStock($id, $quantity) {
        $item = $this->findById($id);
        if ($item && $item['quantity_in_stock'] >= $quantity) {
            $new_quantity = $item['quantity_in_stock'] - $quantity;
            return $this->db->update('inventory_items', ['quantity_in_stock' => $new_quantity], 'id', $id);
        }
        return false;
    }

    public function addStock($id, $quantity) {
        $item = $this->findById($id);
        if ($item) {
            $new_quantity = $item['quantity_in_stock'] + $quantity;
            return $this->db->update('inventory_items', ['quantity_in_stock' => $new_quantity], 'id', $id);
        }
        return false;
    }

    public function delete($id) {
        return $this->db->delete('inventory_items', 'id', $id);
    }

    public function count() {
        return $this->db->count('inventory_items');
    }

    public function countLowStock() {
        return $this->db->count('inventory_items', 'quantity_in_stock <= reorder_level');
    }

    public function search($query, $limit = 100, $offset = 0) {
        $query = $this->db->escape($query);
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT * FROM inventory_items WHERE part_name LIKE '%$query%' OR part_number LIKE '%$query%' LIMIT $limit OFFSET $offset");
    }

    private function sanitize($data) {
        return array_map(function($value) {
            return htmlspecialchars($value ?? '');
        }, $data);
    }
}
?>
