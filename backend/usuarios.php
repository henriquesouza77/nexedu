<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
require_auth();
$stmt = db()->query('SELECT id, nome, email, perfil, aluno_id FROM usuarios WHERE ativo = 1 ORDER BY nome');
respond(['data' => $stmt->fetchAll()]);
