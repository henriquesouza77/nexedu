<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

if (!method_is('POST')) {
    respond(['error' => 'Método não permitido.'], 405);
}

$data = json_input();
$email = strtolower(trim((string)($data['email'] ?? '')));
$senha = (string)($data['senha'] ?? '');

if ($email === '' || $senha === '') {
    respond(['error' => 'E-mail e senha são obrigatórios.'], 422);
}

$stmt = db()->prepare('SELECT id, nome, email, senha_hash, perfil, aluno_id FROM usuarios WHERE email = ? AND ativo = 1 LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($senha, $user['senha_hash'])) {
    respond(['error' => 'E-mail ou senha inválidos.'], 401);
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = (int)$user['id'];
unset($user['senha_hash']);
respond(['user' => $user]);