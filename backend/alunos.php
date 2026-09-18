<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

$user = require_auth();
$pdo = db();

if (method_is('GET')) {
    $sql = 'SELECT a.*, t.nome AS turma_nome, t.curso, t.periodo FROM alunos a JOIN turmas t ON t.id = a.turma_id';
    $params = [];
    if (!user_can_read_all_students($user)) { $sql .= ' WHERE a.id = ?'; $params[] = $user['aluno_id'] ?: 0; }
    $sql .= ' ORDER BY a.nome';
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    respond(['data' => $stmt->fetchAll()]);
}

if (!user_can_manage_students($user)) {
    respond(['error' => 'Apenas o diretor pode cadastrar ou alterar alunos.'], 403);
}

if (method_is('POST')) {
    $data = json_input();
    $required = ['nome', 'matricula', 'nascimento', 'email', 'turma_id', 'situacao', 'responsavel', 'tel_responsavel'];
    foreach ($required as $field) {
        if (trim((string)($data[$field] ?? '')) === '') {
            respond(['error' => "O campo {$field} é obrigatório."], 422);
        }
    }
    $senha = (string)($data['senha'] ?? '123456');
    if (strlen($senha) < 6) respond(['error' => 'A senha do aluno deve ter no mínimo 6 caracteres.'], 422);
    $telefone = trim((string)($data['telefone'] ?? ''));
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('INSERT INTO alunos (nome, matricula, nascimento, email, telefone, turma_id, situacao, responsavel, tel_responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$data['nome'], $data['matricula'], $data['nascimento'], $data['email'], $telefone, $data['turma_id'], $data['situacao'], $data['responsavel'], $data['tel_responsavel']]);
        $alunoId = (int)$pdo->lastInsertId();
        $userStmt = $pdo->prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil, aluno_id, ativo) VALUES (?, ?, ?, ?, ?, 1)');
        $userStmt->execute([$data['nome'], strtolower(trim($data['email'])), password_hash($senha, PASSWORD_DEFAULT), 'aluno', $alunoId]);
        $pdo->commit();
    } catch (PDOException $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($error->errorInfo[1] === 1062) {
            respond(['error' => 'Matrícula ou e-mail já cadastrado.'], 409);
        }
        respond(['error' => 'Não foi possível cadastrar o aluno.'], 500);
    }
    respond(['id' => $alunoId], 201);
}

if (method_is('PUT')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    $data = json_input();
    if (!$id) {
        respond(['error' => 'ID inválido.'], 422);
    }
    $stmt = $pdo->prepare('UPDATE alunos SET nome = ?, matricula = ?, nascimento = ?, email = ?, telefone = ?, turma_id = ?, situacao = ?, responsavel = ?, tel_responsavel = ? WHERE id = ?');
    $stmt->execute([$data['nome'] ?? '', $data['matricula'] ?? '', $data['nascimento'] ?? '', $data['email'] ?? '', $data['telefone'] ?? '', $data['turma_id'] ?? 0, $data['situacao'] ?? 'Ativo', $data['responsavel'] ?? '', $data['tel_responsavel'] ?? '', $id]);
    respond(['ok' => true]);
}

if (method_is('DELETE')) {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        respond(['error' => 'ID inválido.'], 422);
    }
    $stmt = $pdo->prepare('DELETE FROM alunos WHERE id = ?');
    $stmt->execute([$id]);
    respond(['ok' => true]);
}

respond(['error' => 'Método não permitido.'], 405);
