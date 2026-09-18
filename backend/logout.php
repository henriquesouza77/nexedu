<?php
declare(strict_types=1);

require_once __DIR__ . '/response.php';

if (!method_is('POST')) {
    respond(['error' => 'Método não permitido.'], 405);
}
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
}
session_destroy();
respond(['ok' => true]);