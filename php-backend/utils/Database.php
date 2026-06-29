<?php
/**
 * Database Helper
 */

class Database {
    private $conn;

    public function __construct($connection) {
        $this->conn = $connection;
    }

    public function escape($value) {
        return $this->conn->real_escape_string($value);
    }

    public function query($sql) {
        return $this->conn->query($sql);
    }

    public function prepare($sql) {
        return $this->conn->prepare($sql);
    }

    public function insert($table, $data) {
        $columns = array_keys($data);
        $values = array_values($data);
        $placeholders = array_fill(0, count($data), '?');

        $sql = "INSERT INTO $table (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $this->prepare($sql);

        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) $types .= 'i';
            elseif (is_float($value)) $types .= 'd';
            else $types .= 's';
        }

        $stmt->bind_param($types, ...$values);
        return $stmt->execute();
    }

    public function update($table, $data, $where_col, $where_val) {
        $updates = [];
        $values = [];

        foreach ($data as $col => $val) {
            $updates[] = "$col = ?";
            $values[] = $val;
        }

        $values[] = $where_val;
        $sql = "UPDATE $table SET " . implode(', ', $updates) . " WHERE $where_col = ?";
        $stmt = $this->prepare($sql);

        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) $types .= 'i';
            elseif (is_float($value)) $types .= 'd';
            else $types .= 's';
        }

        $stmt->bind_param($types, ...$values);
        return $stmt->execute();
    }

    public function delete($table, $where_col, $where_val) {
        $sql = "DELETE FROM $table WHERE $where_col = ?";
        $stmt = $this->prepare($sql);
        $stmt->bind_param(is_int($where_val) ? 'i' : 's', $where_val);
        return $stmt->execute();
    }

    public function fetchOne($sql) {
        $result = $this->query($sql);
        return $result ? $result->fetch_assoc() : null;
    }

    public function fetchAll($sql) {
        $result = $this->query($sql);
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    public function count($table, $where = '') {
        $sql = "SELECT COUNT(*) as total FROM $table";
        if ($where) $sql .= " WHERE $where";
        $result = $this->fetchOne($sql);
        return $result['total'] ?? 0;
    }

    public function lastInsertId() {
        return $this->conn->insert_id;
    }

    public function error() {
        return $this->conn->error;
    }
}
?>
