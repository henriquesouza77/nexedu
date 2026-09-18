<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

$user = require_auth();
$pdo = db();

if (method_is('GET')) {
    $sql = 'SELECT a.*, d.nome AS disciplina_nome, t.nome AS turma_nome FROM atividades a JOIN disciplinas d ON d.id = a.disciplina_id JOIN turmas t ON t.id = a.turma_id';
    $params = [];
    if ($user['perfil'] === 'professor') {
        $sql .= ' WHERE d.professor_id = ?';
        $params[] = $user['id'];
    } elseif (in_array($user['perfil'], ['aluno', 'responsavel'], true)) {
        $sql .= ' WHERE a.turma_id = (SELECT turma_id FROM alunos WHERE id = ?)';
        $params[] = $user['aluno_id'];
    }
    $sql .= ' ORDER BY a.entrega';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    respond(['data' => $stmt->fetchAll()]);
}

if (!user_can_manage_activities($user)) {
    respond(['error' => 'Apenas professores podem adicionar ou alterar atividades.'], 403);
}

if (method_is('POST')) {
    $data = json_input();
    foreach (['titulo', 'disciplina_id', 'turma_id', 'descricao', 'entrega', 'valor', 'status'] as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            respond(['error' => "O campo {$field} é obrigatório."], 422);
        }
    }
    $stmt = $pdo->prepare('INSERT INTO atividades (titulo, disciplina_id, turma_id, descricao, criacao, entrega, valor, status, autor_id) VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)');
    $stmt->execute([$data['titulo'], $data['disciplina_id'], $data['turma_id'], $data['descricao'], $data['entrega'], $data['valor'], $data['status'], $user['id']]);
    respond(['id' => (int)$pdo->lastInsertId()], 201);
}

if (method_is('PUT')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $data = json_input();
    if (!$id) {
        respond(['error' => 'ID inválido.'], 422);
    }
    $stmt = $pdo->prepare('UPDATE atividades SET titulo = ?, descricao = ?, entrega = ?, valor = ?, status = ? WHERE id = ?');
    $stmt->execute([$data['titulo'] ?? '', $data['descricao'] ?? '', $data['entrega'] ?? '', $data['valor'] ?? 0, $data['status'] ?? 'Disponível', $id]);
    respond(['ok' => true]);
}

if (method_is('DELETE')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        respond(['error' => 'ID inválido.'], 422);
    }
    $stmt = $pdo->prepare('DELETE FROM atividades WHERE id = ?');
    $stmt->execute([$id]);
    respond(['ok' => true]);
}

respond(['error' => 'Método não permitido.'], 405);
