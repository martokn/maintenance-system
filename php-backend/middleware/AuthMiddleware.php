<?php
/**
 * Authentication Middleware
 */

require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/Request.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    private $jwtHandler;

    public function __construct() {
        $this->jwtHandler = new JWTHandler();
    }

    public function authenticate() {
        $token = Request::getAuthToken();

        if (!$token) {
            Response::error('No authorization token provided', 401);
        }

        $payload = $this->jwtHandler->verifyToken($token);

        if (!$payload) {
            Response::error('Invalid or expired token', 401);
        }

        return $payload;
    }

    public function authorizeRole($requiredRole) {
        $payload = $this->authenticate();

        if ($payload['role'] !== $requiredRole && $payload['role'] !== 'admin') {
            Response::error('Insufficient permissions', 403);
        }

        return $payload;
    }

    public function authorizeRoles($requiredRoles) {
        $payload = $this->authenticate();

        if (!in_array($payload['role'], $requiredRoles) && $payload['role'] !== 'admin') {
            Response::error('Insufficient permissions', 403);
        }

        return $payload;
    }

    public function authenticateRoles($requiredRoles) {
        return $this->authorizeRoles($requiredRoles);
    }
}
?>
