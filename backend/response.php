<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        respond(['error' => 'JSON inválido.'], 400);
    }
    return $data;
}

function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function method_is(string $method): bool
{
    return $_SERVER['REQUEST_METHOD'] === $method;
}