<?php
/**
 * Response Helper
 */

class Response {
    public static function success($data = [], $message = 'Success', $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    public static function error($message = 'Error', $statusCode = 400, $errors = []) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    public static function paginated($data = [], $total = 0, $page = 1, $per_page = 20, $message = 'Success') {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => (int)$page,
                'per_page' => (int)$per_page,
                'total_pages' => $per_page > 0 ? ceil($total / $per_page) : 0
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }
}
?>
