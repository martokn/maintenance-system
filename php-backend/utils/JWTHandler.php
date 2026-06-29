<?php
/**
 * JWT Token Handler
 */

class JWTHandler {
    private $secret;
    private $algorithm;
    private $expire_time;

    public function __construct() {
        $this->secret = JWT_SECRET;
        $this->algorithm = JWT_ALGORITHM;
        $this->expire_time = JWT_EXPIRE_TIME;
    }

    /**
     * Create JWT Token
     */
    public function createToken($payload) {
        $header = json_encode(['alg' => $this->algorithm, 'typ' => 'JWT']);
        $payload['exp'] = time() + $this->expire_time;
        $payload['iat'] = time();
        $payload_json = json_encode($payload);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_json));

        $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }

    /**
     * Verify and Decode JWT Token
     */
    public function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;

        $signature = hash_hmac('sha256', $header_encoded . '.' . $payload_encoded, $this->secret, true);
        $signature_base64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($signature_base64 !== $signature_encoded) {
            return false;
        }

        $payload_json = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload_encoded));
        $payload = json_decode($payload_json, true);

        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }
}
?>
