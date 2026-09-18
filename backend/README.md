# Backend NexEdu no XAMPP

## Instalação

1. Copie a pasta `nexedu` para `C:\xampp\htdocs\`.
2. Abra o XAMPP e inicie **Apache** e **MySQL**.
3. Acesse `http://localhost/phpmyadmin`.
4. Se o banco ainda não existir, importe `backend/database/schema.sql`. Se você já tem o banco `nexedu`, importe `backend/database/migration-v2.sql`.
5. Abra o site em `http://localhost/nexedu/`.

A API ficará disponível, por exemplo, em `http://localhost/nexedu/backend/login.php`.

## Usuários iniciais

O schema cria:

| E-mail | Perfil | Senha inicial |
|---|---|---|
| diretor@nexedu.com | diretor | 123456 |
| coordenador@nexedu.com | coordenador | 123456 |

Troque as senhas após o primeiro acesso. Para gerar um hash novo, execute no terminal do XAMPP:

```bash
php -r "echo password_hash('SUA_SENHA_FORTE', PASSWORD_DEFAULT), PHP_EOL;"
```

Depois atualize apenas `senha_hash` no phpMyAdmin.

## Endpoints

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `backend/login.php` | público |
| POST | `backend/logout.php` | autenticado |
| GET | `backend/me.php` | autenticado |
| GET | `backend/comunicados.php` | autenticado |
| POST/PUT/DELETE | `backend/comunicados.php` | diretor, coordenador, professor |
| GET | `backend/atividades.php` | autenticado |
| POST/PUT/DELETE | `backend/atividades.php` | professor |
| GET/POST | `backend/funcionarios.php` | diretor |
| GET | `backend/disciplinas.php`, `backend/usuarios.php` | autenticado |

O cadastro de aluno é exclusivo do diretor e cria, em uma transação, o registro acadêmico e um usuário com perfil `aluno`. O perfil `responsavel` recebe as mesmas leituras do aluno associado. Aplique `database/migration-v2.sql` uma vez em instalações que já possuem o banco criado.
