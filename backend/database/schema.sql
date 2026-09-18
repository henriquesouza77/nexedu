CREATE DATABASE IF NOT EXISTS nexedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexedu;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('diretor','coordenador','professor','aluno','responsavel') NOT NULL,
  aluno_id INT UNSIGNED NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE turmas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  curso VARCHAR(160) NOT NULL,
  periodo VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE alunos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  matricula VARCHAR(30) NOT NULL UNIQUE,
  nascimento DATE NOT NULL,
  email VARCHAR(180) NULL UNIQUE,
  telefone VARCHAR(30) NOT NULL,
  turma_id INT UNSIGNED NOT NULL,
  situacao ENUM('Ativo','Inativo','Transferido','Concluído') NOT NULL DEFAULT 'Ativo',
  responsavel VARCHAR(120) NOT NULL,
  tel_responsavel VARCHAR(30) NOT NULL,
  CONSTRAINT fk_alunos_turma FOREIGN KEY (turma_id) REFERENCES turmas(id)
) ENGINE=InnoDB;

ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE SET NULL;

CREATE TABLE disciplinas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  turma_id INT UNSIGNED NOT NULL,
  professor_id INT UNSIGNED NULL,
  CONSTRAINT fk_disciplinas_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
  CONSTRAINT fk_disciplinas_professor FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE atividades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  disciplina_id INT UNSIGNED NOT NULL,
  turma_id INT UNSIGNED NOT NULL,
  descricao TEXT NOT NULL,
  criacao DATE NOT NULL,
  entrega DATE NOT NULL,
  valor DECIMAL(4,2) NOT NULL,
  status ENUM('Disponível','Em andamento','Encerrada') NOT NULL DEFAULT 'Disponível',
  autor_id INT UNSIGNED NOT NULL,
  CONSTRAINT fk_atividades_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
  CONSTRAINT fk_atividades_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
  CONSTRAINT fk_atividades_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE comunicados (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  mensagem TEXT NOT NULL,
  destinatario VARCHAR(80) NOT NULL,
  data DATE NOT NULL,
  autor_id INT UNSIGNED NOT NULL,
  CONSTRAINT fk_comunicados_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE INDEX idx_atividades_entrega ON atividades(entrega);
CREATE INDEX idx_comunicados_data ON comunicados(data);

-- Troque os hashes antes de usar em produção. Este hash corresponde à senha 123456.
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Diretor NexEdu', 'diretor@nexedu.com', '$2y$10$tUkbnEmbM0pB8ebhp4/N1eBHMxUMAxjkEBkQREPRPLU7xIvpHE6c2', 'diretor'),
('Coordenador NexEdu', 'coordenador@nexedu.com', '$2y$10$tUkbnEmbM0pB8ebhp4/N1eBHMxUMAxjkEBkQREPRPLU7xIvpHE6c2', 'coordenador');

INSERT INTO turmas (nome, curso, periodo) VALUES
('TDS2A', 'Técnico em Desenvolvimento de Sistemas', 'Manhã'),
('TDS2B', 'Técnico em Desenvolvimento de Sistemas', 'Tarde'),
('ADM1A', 'Técnico em Administração', 'Noite');