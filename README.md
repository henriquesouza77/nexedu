<<<<<<< HEAD
<p align="center"><img src="assets/img/logo-256.png" width="96" alt="NexEdu"></p>
<h1 align="center">NexEdu — Sistema Escolar e Acompanhamento Acadêmico</h1>

Sistema web para centralizar alunos, turmas, frequência, notas, atividades, ocorrências e comunicados em um único lugar, com painéis específicos para cada perfil de usuário.

Feito com **HTML, CSS, JavaScript e PHP/PDO** — sem frameworks e sem build. O MySQL do XAMPP é a fonte de verdade; o `localStorage` permanece apenas como cache de compatibilidade.

> **Importante:** as permissões são aplicadas no backend. Somente professores gerenciam atividades; diretor, coordenador e professor publicam comunicados; somente diretor cadastra alunos e funcionários.

## Como executar

Basta abrir `index.html` no navegador. Para evitar restrições de alguns navegadores com `file://`, você também pode servir a pasta localmente:

```bash
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

## Backend com XAMPP

Para transformar esta demo em um sistema real, use o Apache + MySQL do XAMPP e uma API PHP. A organização recomendada é:

```text
nexedu/
├── backend/             # endpoints PHP (login, usuários, atividades, comunicados)
├── config/              # conexão PDO e configurações sem segredos públicos
├── database/schema.sql  # tabelas e permissões iniciais
├── pages/               # frontend
└── js/                  # chamadas fetch para a API
```

Neste projeto, essa pasta já foi criada como [`backend/`](backend/), com o schema e os endpoints PHP prontos para o Apache do XAMPP. Consulte [`backend/README.md`](backend/README.md) para instalar e importar o banco.

### 1. Banco de dados

No phpMyAdmin, crie um banco `nexedu` e tabelas como `usuarios`, `alunos`, `turmas`, `disciplinas`, `atividades` e `comunicados`. O usuário deve ter um campo `perfil` com valores controlados: `diretor`, `coordenador`, `professor`, `aluno` ou `responsavel`. Senhas devem ser salvas com `password_hash()`, nunca em texto puro.

### 2. Login no backend

O frontend envia `POST /api/login.php` com e-mail e senha. O PHP consulta o usuário com PDO, valida com `password_verify()` e cria uma sessão PHP (`$_SESSION['usuario_id']` e `$_SESSION['perfil']`). O frontend passa a chamar `GET /api/me.php` ao abrir cada página; não deve decidir o perfil usando apenas dados do navegador.

### 3. Permissões no servidor

Cada endpoint deve rejeitar a operação antes de acessar o banco. Por exemplo, `POST /api/comunicados.php` e `POST /api/atividades.php` permitem `diretor`, `coordenador` e `professor`; `aluno` e `responsavel` recebem HTTP `403`. A mesma verificação deve existir para `PUT` e `DELETE`, pois esconder o botão não é uma barreira de segurança.

### 4. Conectar o frontend

Substitua gradualmente `DB.get`, `DB.insert`, `DB.update` e `DB.remove` por `fetch()` para a API. Exemplo de leitura:

```js
const resposta = await fetch("../api/comunicados.php", { credentials: "include" });
if (!resposta.ok) throw new Error("Não foi possível carregar os comunicados.");
const comunicados = await resposta.json();
```

Após o login real, remova as senhas do `js/data.js` e deixe o backend ser a única fonte de usuários, atividades e comunicados. Em produção, use HTTPS, prepared statements, proteção CSRF e validação no servidor.

## Acesso de demonstração

Todos os usuários usam a senha **`123456`**. Na tela de login há botões de acesso rápido para cada perfil.

| Perfil | E-mail | O que pode fazer |
|---|---|---|
| Diretor | `diretor@nexedu.com` | Visão geral da escola, alertas, consulta a tudo, publica comunicados |
| Coordenador | `coordenador@nexedu.com` | Cadastra/edita alunos e turmas, registra ocorrências, publica comunicados |
| Professor | `professor@nexedu.com` | Diário de classe (chamada + conteúdo), lança notas, cria atividades, registra ocorrências |
| Aluno | `aluno@nexedu.com` | Consulta frequência, boletim, atividades, ocorrências e comunicados |
| Responsável | `responsavel@nexedu.com` | Acompanha o filho(a): frequência, notas, atividades, ocorrências e comunicados |

Outros professores: `renata@nexedu.com`, `marcelo@nexedu.com`, `sonia@nexedu.com`.

Para voltar aos dados iniciais, apague a chave `nexedu_db_v1` do `localStorage` (DevTools → Application) ou execute `DB.reset()` no console.

## Funcionalidades (requisitos funcionais)

| # | Requisito | Onde |
|---|---|---|
| RF01 | Login com validação e perfis de acesso | `index.html` |
| RF02 | Cadastro de aluno com validação (matrícula única, e-mail, data, telefone…) | Cadastrar aluno |
| RF03 | Consulta de alunos com busca, filtro por turma/situação e ficha detalhada | Alunos |
| RF04 | Edição e exclusão de aluno | Alunos |
| RF05 | Cadastro e consulta de turmas (curso, período, professor, disciplinas) | Turmas |
| RF06 | Diário de classe: chamada com presente / falta / falta justificada | Diário de classe |
| RF07 | Registro de conteúdo trabalhado e observações da aula | Diário de classe |
| RF08 | Histórico de aulas com edição de chamada já registrada | Diário de classe |
| RF09 | Controle de frequência por aluno e por turma, com % e detalhe de faltas | Frequência |
| RF10 | Lançamento de notas (0 a 10) por disciplina | Notas |
| RF11 | Cálculo automático de média e situação (aprovado / recuperação) | Notas |
| RF12 | Boletim do aluno | Notas |
| RF13 | Cadastro e acompanhamento de atividades (status, entrega, valor) | Atividades |
| RF14 | Registro de ocorrências com categoria e situação | Ocorrências |
| RF15 | Comunicados por destinatário (todos, professores, alunos, responsáveis, turma) | Comunicados |
| RF16 | Dashboards por perfil com indicadores e alertas (baixa frequência, baixo rendimento) | Painéis |
| RF17 | Controle de acesso por perfil (rotas protegidas) | `js/app.js` |

### Requisitos não funcionais

- **Responsividade** — layout adaptado a desktop, tablet e celular (menu lateral vira gaveta).
- **Usabilidade** — navegação lateral fixa, feedback com toasts, modais de confirmação, estados vazios.
- **Padronização visual** — design system em `css/style.css` (cores da logo, tipografia, componentes).
- **Validação de formulários** — utilitário `Form.validate` reutilizado em todos os formulários.
- **Organização** — HTML em `pages/`, estilos em `css/`, lógica em `js/` (um arquivo por tela).
- **Compatibilidade** — funciona nos navegadores modernos (Chrome, Edge, Firefox, Safari).

## Telas

1. Login · 2. Painel do diretor · 3. Painel do coordenador · 4. Painel do professor · 5. Painel do aluno · 6. Painel do responsável · 7. Cadastro de aluno · 8. Lista de alunos · 9. Turmas · 10. Diário de classe · 11. Frequência · 12. Notas · 13. Atividades · 14. Ocorrências · 15. Comunicados

## Estrutura do projeto

```
nexedu/
├── index.html              # Login
├── pages/                  # Uma página HTML por tela
├── css/style.css           # Design system (variáveis, layout, componentes, responsivo)
├── js/
│   ├── data.js             # Dados iniciais (seed), camada DB (localStorage) e consultas (Q)
│   ├── app.js              # Autenticação, layout (sidebar/topbar), ícones, toasts, modais, validação
│   └── pages/*.js          # Lógica de cada tela
└── assets/img/             # Logo e favicon
```

## Modelo de dados (localStorage)

`usuarios`, `alunos`, `turmas`, `disciplinas`, `aulas` (chamadas), `notas`, `atividades`, `ocorrencias`, `comunicados`. O login, usuários, alunos, turmas, disciplinas, atividades e comunicados são carregados da API PHP em `backend/`.

O cadastro de aluno cria também seu usuário de acesso em uma transação. O perfil `responsavel` possui as mesmas leituras acadêmicas do aluno associado.

Frequência é calculada a partir das chamadas registradas (`aulas[].presencas`), e a média é `(Atividade 1 + Atividade 2 + Avaliação) / 3`, com aprovação a partir de 6,0 e frequência mínima de 75%.
=======
# nexedu
>>>>>>> ab8aacca16a2fb312b5576f88eb24ca2dbd366fd
