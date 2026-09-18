<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

function current_user(): ?array
{
    if (empty($_SESSION['usuario_id'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, nome, email, perfil, aluno_id FROM usuarios WHERE id = ? AND ativo = 1');
    $stmt->execute([$_SESSION['usuario_id']]);
    return $stmt->fetch() ?: null;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        respond(['error' => 'Autenticação necessária.'], 401);
    }
    return $user;
}

function require_roles(array $roles): array
{
    $user = require_auth();
    if (!in_array($user['perfil'], $roles, true)) {
        respond(['error' => 'Você não tem permissão para esta operação.'], 403);
    }
    return $user;
}

function user_can_publish(array $user): bool
{
    return in_array($user['perfil'], ['diretor', 'coordenador', 'professor'], true);
}

function user_can_manage_activities(array $user): bool
{
    return $user['perfil'] === 'professor';
}

function user_can_manage_students(array $user): bool
{
    return $user['perfil'] === 'diretor';
}

function user_can_read_all_students(array $user): bool
{
    return in_array($user['perfil'], ['diretor', 'coordenador', 'professor'], true);
}
