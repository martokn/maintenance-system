<?php
/**
 * Utility Functions
 */

class Utilities {
    public static function generateNumber($prefix, $length = 5) {
        return $prefix . '-' . date('Ymd') . '-' . str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }

    public static function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validateUrl($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function getImageMimeType($path) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $path);
        finfo_close($finfo);
        return $mime;
    }

    public static function log($message, $type = 'info') {
        $log_dir = __DIR__ . '/../logs/';
        if (!file_exists($log_dir)) {
            mkdir($log_dir, 0755, true);
        }
        $filename = $log_dir . date('Y-m-d') . '.log';
        $content = date('Y-m-d H:i:s') . ' [' . strtoupper($type) . '] ' . $message . PHP_EOL;
        file_put_contents($filename, $content, FILE_APPEND);
    }
}
?>
