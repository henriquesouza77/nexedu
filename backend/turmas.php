<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

$user = require_auth();
if (!method_is('GET')) {
    respond(['error' => 'Método não permitido.'], 405);
}

$stmt = db()->query('SELECT id, nome, curso, periodo FROM turmas ORDER BY nome');
respond(['data' => $stmt->fetchAll()]);