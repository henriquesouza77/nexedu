<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';

$director = require_roles(['diretor']);
$pdo = db();

if (method_is('GET')) {
    $stmt = $pdo->query("SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE perfil <> 'aluno' AND ativo = 1 ORDER BY nome");
    respond(['data' => $stmt->fetchAll()]);
}

if (!method_is('POST')) {
    respond(['error' => 'Método não permitido.'], 405);
}

$data = json_input();
$nome = trim((string)($data['nome'] ?? ''));
$email = strtolower(trim((string)($data['email'] ?? '')));
$senha = (string)($data['senha'] ?? '');
$perfil = trim((string)($data['perfil'] ?? ''));
$allowed = ['diretor', 'coordenador', 'professor', 'responsavel'];
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($senha) < 6 || !in_array($perfil, $allowed, true)) {
    respond(['error' => 'Nome, e-mail válido, senha com no mínimo 6 caracteres e cargo válido são obrigatórios.'], 422);
}
try {
    $stmt = $pdo->prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, 1)');
    $stmt->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT), $perfil]);
} catch (PDOException $e) {
    if ((int)($e->errorInfo[1] ?? 0) === 1062) respond(['error' => 'Este e-mail já está cadastrado.'], 409);
    respond(['error' => 'Não foi possível cadastrar o funcionário.'], 500);
}
respond(['id' => (int)$pdo->lastInsertId()], 201);
