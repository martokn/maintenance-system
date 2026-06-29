<?php
/**
 * User Model
 */

require_once __DIR__ . '/../utils/Database.php';
require_once __DIR__ . '/../utils/Utilities.php';

class User {
    private $db;

    public function __construct($connection) {
        $this->db = new Database($connection);
    }

    public function findByEmail($email) {
        $email = $this->db->escape($email);
        return $this->db->fetchOne("SELECT * FROM users WHERE email = '$email'");
    }

    public function findById($id) {
        $id = (int)$id;
        return $this->db->fetchOne("SELECT * FROM users WHERE id = $id");
    }

    public function create($email, $password, $full_name, $role = 'inspector', $department = null) {
        $password_hash = Utilities::hashPassword($password);
        $email = htmlspecialchars($email);
        $full_name = htmlspecialchars($full_name);
        $department = htmlspecialchars($department);

        return $this->db->insert('users', [
            'email' => $email,
            'password_hash' => $password_hash,
            'full_name' => $full_name,
            'role' => $role,
            'department' => $department
        ]);
    }

    public function verifyPassword($email, $password) {
        $user = $this->findByEmail($email);
        if ($user && Utilities::verifyPassword($password, $user['password_hash'])) {
            return $user;
        }
        return false;
    }

    public function update($id, $data) {
        foreach ($data as $key => $value) {
            $data[$key] = htmlspecialchars($value);
        }
        return $this->db->update('users', $data, 'id', $id);
    }

    public function getAll($limit = 100, $offset = 0) {
        $limit = (int)$limit;
        $offset = (int)$offset;
        return $this->db->fetchAll("SELECT id, email, full_name, role, department, is_active, created_date FROM users LIMIT $limit OFFSET $offset");
    }

    public function delete($id) {
        return $this->db->delete('users', 'id', $id);
    }

    public function count() {
        return $this->db->count('users');
    }
}
?>
