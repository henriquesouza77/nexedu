<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

$user = require_auth();
$pdo = db();

if (method_is('GET')) {
    $sql = 'SELECT c.*, u.nome AS autor_nome, u.perfil AS autor_perfil FROM comunicados c JOIN usuarios u ON u.id = c.autor_id';
    $params = [];
    if (in_array($user['perfil'], ['aluno', 'responsavel'], true)) {
        $tipo = $user['perfil'] === 'aluno' ? 'alunos' : 'responsaveis';
        $sql .= ' WHERE c.destinatario IN (\'todos\', ?)';
        $params[] = $tipo;
    }
    $sql .= ' ORDER BY c.data DESC, c.id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    respond(['data' => $stmt->fetchAll()]);
}

if (!user_can_publish($user)) {
    respond(['error' => 'Apenas funcionários autorizados podem publicar comunicados.'], 403);
}

if (method_is('POST')) {
    $data = json_input();
    foreach (['titulo', 'mensagem', 'destinatario', 'data'] as $field) {
        if (trim((string)($data[$field] ?? '')) === '') {
            respond(['error' => "O campo {$field} é obrigatório."], 422);
        }
    }
    $stmt = $pdo->prepare('INSERT INTO comunicados (titulo, mensagem, destinatario, data, autor_id) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$data['titulo'], $data['mensagem'], $data['destinatario'], $data['data'], $user['id']]);
    respond(['id' => (int)$pdo->lastInsertId()], 201);
}

if (method_is('PUT')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $data = json_input();
    if (!$id || trim((string)($data['titulo'] ?? '')) === '' || trim((string)($data['mensagem'] ?? '')) === '') {
        respond(['error' => 'ID, título e mensagem são obrigatórios.'], 422);
    }
    $stmt = $pdo->prepare('UPDATE comunicados SET titulo = ?, mensagem = ?, destinatario = ?, data = ? WHERE id = ?');
    $stmt->execute([$data['titulo'], $data['mensagem'], $data['destinatario'] ?? 'todos', $data['data'] ?? date('Y-m-d'), $id]);
    respond(['ok' => true]);
}

if (method_is('DELETE')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        respond(['error' => 'ID inválido.'], 422);
    }
    $stmt = $pdo->prepare('DELETE FROM comunicados WHERE id = ?');
    $stmt->execute([$id]);
    respond(['ok' => true]);
}

respond(['error' => 'Método não permitido.'], 405);
