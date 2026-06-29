<?php
/**
 * Auth Controller
 */

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Request.php';

class AuthController {
    private $userModel;
    private $jwtHandler;

    public function __construct($connection) {
        $this->userModel = new User($connection);
        $this->jwtHandler = new JWTHandler();
    }

    public function login() {
        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            Response::error('Email and password are required', 400);
        }

        $user = $this->userModel->verifyPassword($email, $password);
        if (!$user) {
            Response::error('Invalid email or password', 401);
        }

        if (!$user['is_active']) {
            Response::error('Account is inactive', 403);
        }

        $token = $this->jwtHandler->createToken([
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'department' => $user['department']
        ]);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
                'department' => $user['department']
            ]
        ], 'Login successful', 200);
    }

    public function register() {
        if (!Request::isPost()) {
            Response::error('Method not allowed', 405);
        }

        $data = Request::all();
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $full_name = $data['full_name'] ?? null;
        $role = $data['role'] ?? 'inspector';
        $department = $data['department'] ?? null;

        if (!$email || !$password || !$full_name) {
            Response::error('Email, password, and full name are required', 400);
        }

        if (strlen($password) < 6) {
            Response::error('Password must be at least 6 characters', 400);
        }

        $existing_user = $this->userModel->findByEmail($email);
        if ($existing_user) {
            Response::error('Email already exists', 400);
        }

        if ($this->userModel->create($email, $password, $full_name, $role, $department)) {
            $user = $this->userModel->findByEmail($email);
            $token = $this->jwtHandler->createToken([
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
                'department' => $user['department']
            ]);

            Response::success([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role'],
                    'department' => $user['department']
                ]
            ], 'Registration successful', 201);
        }

        Response::error('Registration failed', 500);
    }

    public function me() {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $auth = new AuthMiddleware();
        $user = $auth->authenticate();

        Response::success($user, 'User authenticated', 200);
    }

    public function logout() {
        // Since we're using JWT (stateless), logout just happens on the client side
        Response::success([], 'Logout successful', 200);
    }
}
?>
