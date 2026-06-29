<?php
/**
 * Request Helper
 */

class Request {
    private static $data = null;

    public static function getData() {
        if (self::$data === null) {
            $input = file_get_contents('php://input');
            self::$data = json_decode($input, true) ?? $_REQUEST;
        }
        return self::$data;
    }

    public static function get($key, $default = null) {
        $data = self::getData();
        return $data[$key] ?? $default;
    }

    public static function all() {
        return self::getData();
    }

    public static function method() {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function isPost() {
        return self::method() === 'POST';
    }

    public static function isPut() {
        return self::method() === 'PUT';
    }

    public static function isDelete() {
        return self::method() === 'DELETE';
    }

    public static function isGet() {
        return self::method() === 'GET';
    }

    public static function header($key, $default = null) {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        return $_SERVER[$key] ?? $default;
    }

    public static function getAuthToken() {
        $header = self::header('Authorization', '');
        if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
            return $matches[1];
        }
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
                return $matches[1];
            }
        }
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function validate($data, $rules) {
        $errors = [];
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            $rule_parts = explode('|', $rule);
            foreach ($rule_parts as $single_rule) {
                if ($single_rule === 'required' && empty($value)) {
                    $errors[$field] = "$field is required";
                    break;
                }
                if ($single_rule === 'email' && !empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "$field must be a valid email";
                }
                if (strpos($single_rule, 'min:') === 0) {
                    $min = (int)substr($single_rule, 4);
                    if (!empty($value) && strlen($value) < $min) {
                        $errors[$field] = "$field must be at least $min characters";
                    }
                }
            }
        }
        return $errors;
    }
}
?>
