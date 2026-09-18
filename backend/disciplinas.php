<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
require_auth();
$stmt = db()->query('SELECT id, nome, turma_id, professor_id FROM disciplinas ORDER BY nome');
respond(['data' => $stmt->fetchAll()]);
