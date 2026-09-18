USE nexedu;

ALTER TABLE alunos
  ADD COLUMN nascimento DATE NULL AFTER matricula,
  ADD COLUMN telefone VARCHAR(30) NULL AFTER email,
  ADD COLUMN responsavel VARCHAR(120) NULL AFTER situacao,
  ADD COLUMN tel_responsavel VARCHAR(30) NULL AFTER responsavel;

UPDATE alunos SET nascimento = '2008-01-01' WHERE nascimento IS NULL;
UPDATE alunos SET telefone = '' WHERE telefone IS NULL;
UPDATE alunos SET responsavel = 'Não informado' WHERE responsavel IS NULL;
UPDATE alunos SET tel_responsavel = '' WHERE tel_responsavel IS NULL;

ALTER TABLE alunos
  MODIFY nascimento DATE NOT NULL,
  MODIFY telefone VARCHAR(30) NOT NULL,
  MODIFY responsavel VARCHAR(120) NOT NULL,
  MODIFY tel_responsavel VARCHAR(30) NOT NULL;

INSERT INTO turmas (nome, curso, periodo)
SELECT 'TDS2A', 'Técnico em Desenvolvimento de Sistemas', 'Manhã'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = 'TDS2A');
INSERT INTO turmas (nome, curso, periodo)
SELECT 'TDS2B', 'Técnico em Desenvolvimento de Sistemas', 'Tarde'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = 'TDS2B');
INSERT INTO turmas (nome, curso, periodo)
SELECT 'ADM1A', 'Técnico em Administração', 'Noite'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = 'ADM1A');