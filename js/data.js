/* ============================================================
   NexEdu — Camada de dados (localStorage)
   Todos os dados do sistema ficam em uma única chave do
   localStorage. Na primeira execução, dados de exemplo são
   carregados para demonstração.
   ============================================================ */

const DB_KEY = "nexedu_db_v2";

const SEED = () => {
  const turmas = [
    { id: "T1", nome: "TDS2A", curso: "Técnico em Desenvolvimento de Sistemas", semestre: "2º Semestre", periodo: "Manhã", professorId: "P1" },
    { id: "T2", nome: "TDS2B", curso: "Técnico em Desenvolvimento de Sistemas", semestre: "2º Semestre", periodo: "Tarde", professorId: "P2" },
    { id: "T3", nome: "ADM1A", curso: "Técnico em Administração", semestre: "1º Semestre", periodo: "Noite", professorId: "P3" },
  ];

  const disciplinas = [
    { id: "D1", nome: "Desenvolvimento Web", turmaId: "T1", professorId: "P1" },
    { id: "D2", nome: "Banco de Dados", turmaId: "T1", professorId: "P2" },
    { id: "D3", nome: "Lógica de Programação", turmaId: "T1", professorId: "P3" },
    { id: "D4", nome: "Desenvolvimento Web", turmaId: "T2", professorId: "P1" },
    { id: "D5", nome: "Banco de Dados", turmaId: "T2", professorId: "P2" },
    { id: "D6", nome: "Gestão Empresarial", turmaId: "T3", professorId: "P3" },
    { id: "D7", nome: "Matemática Financeira", turmaId: "T3", professorId: "P4" },
  ];

  const nomes = [
    ["Ana Silva", "T1"], ["João Lima", "T1"], ["Maria Souza", "T1"], ["Matheus Oliveira", "T1"], ["Lucas Pereira", "T1"], ["Beatriz Costa", "T1"], ["Gabriel Santos", "T1"],
    ["Larissa Almeida", "T2"], ["Pedro Henrique", "T2"], ["Juliana Rocha", "T2"], ["Rafael Martins", "T2"], ["Camila Ferreira", "T2"], ["Thiago Barbosa", "T2"],
    ["Isabela Carvalho", "T3"], ["Bruno Araújo", "T3"], ["Fernanda Dias", "T3"], ["Vinícius Ribeiro", "T3"], ["Letícia Gomes", "T3"],
  ];
  const situacoes = ["Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Ativo", "Transferido", "Ativo", "Ativo", "Inativo", "Ativo", "Ativo", "Ativo", "Ativo", "Concluído"];
  const alunos = nomes.map(([nome, turmaId], i) => {
    const t = turmas.find((x) => x.id === turmaId);
    const primeiro = nome.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return {
      id: "A" + (i + 1),
      nome,
      matricula: String(2026001 + i),
      nascimento: `200${7 + (i % 3)}-0${1 + (i % 9)}-1${i % 9}`,
      email: `${primeiro}.${i + 1}@aluno.nexedu.com`,
      telefone: `(11) 9${String(8000 + i * 137).padStart(4, "0")}-${String(1000 + i * 91).padStart(4, "0")}`,
      turmaId,
      curso: t.curso,
      periodo: t.periodo,
      responsavel: `Responsável de ${nome.split(" ")[0]}`,
      telResponsavel: `(11) 9${String(7000 + i * 53).padStart(4, "0")}-${String(2000 + i * 17).padStart(4, "0")}`,
      situacao: situacoes[i],
    };
  });

  if (alunos[0]) {
    alunos[0].nome = "Marcos";
    alunos[0].email = "marcos@aluno.nexedu.com";
    alunos[0].responsavel = "Responsável de Marcos";
  }

  if (alunos[1]) {
    alunos[1].nome = "Henrique";
    alunos[1].email = "henrique@aluno.nexedu.com";
    alunos[1].responsavel = "Responsável de Henrique";
  }

  const usuarios = [
    { id: "U1", nome: "Breno", email: "diretor@nexedu.com", senha: "breno123", perfil: "diretor" },
    { id: "U2", nome: "Elias", email: "coordenador@nexedu.com", senha: "elias123", perfil: "coordenador" },
    { id: "P1", nome: "Matheus", email: "professor@nexedu.com", senha: "matheus123", perfil: "professor" },
    { id: "P2", nome: "Renata Freitas", email: "renata@nexedu.com", senha: "123456", perfil: "professor" },
    { id: "P3", nome: "Marcelo Tavares", email: "marcelo@nexedu.com", senha: "123456", perfil: "professor" },
    { id: "P4", nome: "Sônia Batista", email: "sonia@nexedu.com", senha: "123456", perfil: "professor" },
    { id: "U3", nome: "Marcos", email: "aluno@nexedu.com", senha: "marcos123", perfil: "aluno", alunoId: "A1" },
    { id: "U5", nome: "Henrique", email: "henrique@nexedu.com", senha: "henrique123", perfil: "aluno", alunoId: "A2" },
    { id: "U4", nome: "Cláudia Silva", email: "responsavel@nexedu.com", senha: "123456", perfil: "responsavel", alunoId: "A1" },
    { id: "U6", nome: "Responsável de Henrique", email: "responsavelhenrique@nexedu.com", senha: "henrique123", perfil: "responsavel", alunoId: "A2" },
  ];

  // Aulas (diário de classe) — gera ~12 aulas por disciplina com presenças variadas
  const aulas = [];
  const conteudos = {
    "Desenvolvimento Web": ["Introdução ao HTML", "Estrutura semântica", "CSS: seletores e box model", "Flexbox e Grid", "Responsividade", "Introdução ao JavaScript e manipulação básica do DOM", "Eventos", "Arrays e objetos", "localStorage", "Fetch API", "Projeto prático", "Revisão"],
    "Banco de Dados": ["Modelo relacional", "Chaves e relacionamentos", "Normalização", "SQL: SELECT", "SQL: WHERE e ORDER BY", "JOIN", "INSERT/UPDATE/DELETE", "Funções agregadas", "Views", "Índices", "Projeto prático", "Revisão"],
    "Lógica de Programação": ["Algoritmos", "Variáveis", "Operadores", "Condicionais", "Laços", "Vetores", "Funções", "Recursão", "Ordenação", "Busca", "Projeto prático", "Revisão"],
    "Gestão Empresarial": ["Conceitos de gestão", "Planejamento", "Organização", "Direção", "Controle", "Missão e visão", "Análise SWOT", "Processos", "Indicadores", "Qualidade", "Estudo de caso", "Revisão"],
    "Matemática Financeira": ["Porcentagem", "Juros simples", "Juros compostos", "Descontos", "Taxas equivalentes", "Séries de pagamentos", "Amortização", "Fluxo de caixa", "VPL", "TIR", "Exercícios", "Revisão"],
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let aulaN = 1;
  disciplinas.forEach((d) => {
    const alunosT = alunos.filter((a) => a.turmaId === d.turmaId);
    for (let k = 0; k < 12; k++) {
      const dia = new Date(2026, 7, 3 + k * 3 + (d.id.charCodeAt(1) % 3)); // ago/set 2026
      const presencas = {};
      alunosT.forEach((a, idx) => {
        const r = rnd();
        // alguns alunos com mais faltas para alimentar os alertas
        const faltoso = idx % 5 === 1;
        presencas[a.id] = r < (faltoso ? 0.28 : 0.08) ? (r < 0.03 ? "FJ" : "F") : "P";
      });
      aulas.push({
        id: "L" + aulaN++,
        turmaId: d.turmaId,
        disciplinaId: d.id,
        data: dia.toISOString().slice(0, 10),
        conteudo: conteudos[d.nome][k],
        observacao: k === 5 ? "Turma participativa. Alguns alunos com dificuldade em eventos." : "",
        presencas,
      });
    }
  });

  // Notas
  const notas = [];
  disciplinas.forEach((d) => {
    alunos.filter((a) => a.turmaId === d.turmaId).forEach((a, idx) => {
      const base = idx % 4 === 2 ? 4.5 : 7;
      const n = (x) => Math.round(Math.min(10, Math.max(0, base + (rnd() * 4 - 1.5) + x)) * 2) / 2;
      notas.push({ id: `N-${a.id}-${d.id}`, alunoId: a.id, disciplinaId: d.id, atividade1: n(0.5), atividade2: n(0), avaliacao: n(-0.5) });
    });
  });

  const atividades = [
    { id: "AT1", titulo: "Página pessoal em HTML/CSS", disciplinaId: "D1", turmaId: "T1", descricao: "Criar uma página pessoal responsiva utilizando HTML semântico e CSS.", criacao: "2026-09-01", entrega: "2026-09-22", valor: 10, status: "Em andamento" },
    { id: "AT2", titulo: "Manipulação do DOM", disciplinaId: "D1", turmaId: "T1", descricao: "Implementar uma lista de tarefas dinâmica com JavaScript.", criacao: "2026-09-10", entrega: "2026-09-28", valor: 10, status: "Disponível" },
    { id: "AT3", titulo: "Modelagem de banco escolar", disciplinaId: "D2", turmaId: "T1", descricao: "Modelar o banco de dados de um sistema escolar (DER + script SQL).", criacao: "2026-08-25", entrega: "2026-09-12", valor: 8, status: "Encerrada" },
    { id: "AT4", titulo: "Exercícios de laços", disciplinaId: "D3", turmaId: "T1", descricao: "Resolver a lista de 15 exercícios sobre estruturas de repetição.", criacao: "2026-09-05", entrega: "2026-09-19", valor: 5, status: "Em andamento" },
    { id: "AT5", titulo: "Landing page", disciplinaId: "D4", turmaId: "T2", descricao: "Criar uma landing page para um produto fictício.", criacao: "2026-09-08", entrega: "2026-09-25", valor: 10, status: "Disponível" },
    { id: "AT6", titulo: "Consultas SQL", disciplinaId: "D5", turmaId: "T2", descricao: "Escrever 20 consultas SQL a partir do banco de exemplo.", criacao: "2026-09-02", entrega: "2026-09-16", valor: 8, status: "Encerrada" },
    { id: "AT7", titulo: "Análise SWOT", disciplinaId: "D6", turmaId: "T3", descricao: "Elaborar a análise SWOT de uma empresa local.", criacao: "2026-09-09", entrega: "2026-09-30", valor: 10, status: "Disponível" },
  ];

  const ocorrencias = [
    { id: "O1", alunoId: "A2", data: "2026-09-02", autorId: "P1", categoria: "Atraso", descricao: "Chegou 25 minutos após o início da aula sem justificativa.", situacao: "Resolvida" },
    { id: "O2", alunoId: "A5", data: "2026-09-08", autorId: "P2", categoria: "Uso de celular", descricao: "Uso de celular durante a avaliação.", situacao: "Em análise" },
    { id: "O3", alunoId: "A9", data: "2026-09-10", autorId: "P1", categoria: "Comportamento", descricao: "Conversas excessivas atrapalhando a explicação.", situacao: "Aberta" },
    { id: "O4", alunoId: "A15", data: "2026-09-11", autorId: "P3", categoria: "Uso inadequado de equipamento", descricao: "Instalou software não autorizado no computador do laboratório.", situacao: "Aberta" },
    { id: "O5", alunoId: "A1", data: "2026-09-14", autorId: "P3", categoria: "Outros", descricao: "Esqueceu o material da aula prática.", situacao: "Resolvida" },
    { id: "O6", alunoId: "A12", data: "2026-09-15", autorId: "U2", categoria: "Falta", descricao: "Faltas recorrentes sem justificativa. Responsável contatado.", situacao: "Em análise" },
  ];

  const comunicados = [
    { id: "C1", titulo: "Reunião de pais e responsáveis", mensagem: "Convidamos todos os responsáveis para a reunião bimestral no dia 25/09 às 19h no auditório. Serão apresentados os resultados do bimestre e o calendário de recuperação.", data: "2026-09-15", autorId: "U1", destinatario: "responsaveis" },
    { id: "C2", titulo: "Semana de provas", mensagem: "As avaliações do 3º bimestre ocorrerão entre os dias 29/09 e 03/10. Consulte o cronograma com seus professores.", data: "2026-09-14", autorId: "U2", destinatario: "alunos" },
    { id: "C3", titulo: "Conselho de classe", mensagem: "O conselho de classe acontecerá no dia 06/10. Professores devem finalizar o lançamento de notas e frequência até 03/10.", data: "2026-09-12", autorId: "U2", destinatario: "professores" },
    { id: "C4", titulo: "Feira de Tecnologia NexEdu", mensagem: "No dia 17/10 acontece a Feira de Tecnologia. Toda a comunidade escolar está convidada! Inscrições de projetos até 30/09.", data: "2026-09-10", autorId: "U1", destinatario: "todos" },
    { id: "C5", titulo: "Visita técnica — TDS2A", mensagem: "A turma TDS2A fará visita técnica a uma empresa de software no dia 24/09. Levar autorização assinada pelo responsável.", data: "2026-09-09", autorId: "U2", destinatario: "T1" },
  ];

  return { usuarios, turmas, disciplinas, alunos, aulas, notas, atividades, ocorrencias, comunicados };
};

const DB = {
  _cache: null,
  _apiMap: { usuarios: "usuarios.php", alunos: "alunos.php", turmas: "turmas.php", disciplinas: "disciplinas.php", atividades: "atividades.php", comunicados: "comunicados.php" },
  load() {
    if (this._cache) return this._cache;
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) { this._cache = JSON.parse(raw); return this._cache; }
    } catch (e) { /* ignora dados corrompidos */ }
    this._cache = SEED();
    this.save();
    return this._cache;
  },
  save() { localStorage.setItem(DB_KEY, JSON.stringify(this._cache)); },
  reset() { localStorage.removeItem(DB_KEY); this._cache = null; return this.load(); },
  get(col) { return this.load()[col]; },
  find(col, id) { return this.get(col).find((x) => x.id === id) || null; },
  async hydrate() {
    await Promise.all(Object.entries(this._apiMap).map(async ([col, endpoint]) => {
      try { const result = await Api.request(endpoint); if (Array.isArray(result?.data)) this.load()[col] = result.data.map(normalizeRemoteRow); } catch (e) { /* endpoint opcional */ }
    }));
    this.save();
  },
  insert(col, obj) {
    obj.id = obj.id || uid(col); this.get(col).push(obj); this.save();
    const endpoint = this._apiMap[col];
    if (endpoint) Api.request(endpoint, { method: "POST", body: JSON.stringify(toRemoteRow(obj)) }).then((r) => { if (r?.id) { obj.id = Number(r.id); this.save(); } }).catch((e) => toast(e.message, "error"));
    return obj;
  },
  update(col, id, patch) {
    const list = this.get(col); const i = list.findIndex((x) => x.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...patch }; this.save();
    const endpoint = this._apiMap[col];
    if (endpoint) Api.request(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(toRemoteRow(list[i])) }).catch((e) => toast(e.message, "error"));
    return list[i];
  },
  remove(col, id) {
    const db = this.load(); db[col] = db[col].filter((x) => x.id !== id); this.save();
    const endpoint = this._apiMap[col];
    if (endpoint) Api.request(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((e) => toast(e.message, "error"));
  },
};

function normalizeRemoteRow(row) {
  const aliases = { aluno_id: "alunoId", turma_id: "turmaId", disciplina_id: "disciplinaId", autor_id: "autorId", professor_id: "professorId" };
  const idFields = new Set(["id", "aluno_id", "turma_id", "disciplina_id", "autor_id", "professor_id"]);
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [aliases[k] || k, idFields.has(k) && v !== null ? String(v) : v]));
}
function toRemoteRow(obj) {
  const aliases = { alunoId: "aluno_id", turmaId: "turma_id", disciplinaId: "disciplina_id", autorId: "autor_id", professorId: "professor_id" };
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [aliases[k] || k, v]));
}

function uid(prefix) {
  return `${prefix.slice(0, 2).toUpperCase()}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------- Consultas / cálculos ---------- */
const Q = {
  turma(id) { return DB.find("turmas", id); },
  disciplina(id) { return DB.find("disciplinas", id); },
  aluno(id) { return DB.find("alunos", id); },
  usuario(id) { return DB.find("usuarios", id); },
  professores() { return DB.get("usuarios").filter((u) => u.perfil === "professor"); },
  alunosDaTurma(turmaId) { return DB.get("alunos").filter((a) => a.turmaId === turmaId); },
  disciplinasDoProfessor(profId) { return DB.get("disciplinas").filter((d) => d.professorId === profId); },
  turmasDoProfessor(profId) {
    const ids = new Set(this.disciplinasDoProfessor(profId).map((d) => d.turmaId));
    return DB.get("turmas").filter((t) => ids.has(t.id));
  },
  disciplinasDaTurma(turmaId) { return DB.get("disciplinas").filter((d) => d.turmaId === turmaId); },

  /** Frequência de um aluno (opcionalmente filtrada por disciplina) */
  frequencia(alunoId, disciplinaId = null) {
    const aulas = DB.get("aulas").filter((l) => l.presencas[alunoId] !== undefined && (!disciplinaId || l.disciplinaId === disciplinaId));
    const total = aulas.length;
    const faltas = aulas.filter((l) => l.presencas[alunoId] === "F").length;
    const justificadas = aulas.filter((l) => l.presencas[alunoId] === "FJ").length;
    const presencas = total - faltas - justificadas;
    const pct = total ? Math.round(((presencas + justificadas) / total) * 100) : 100;
    return { total, presencas, faltas, justificadas, pct };
  },

  /** Frequência média de uma turma */
  frequenciaTurma(turmaId) {
    const alunos = this.alunosDaTurma(turmaId);
    if (!alunos.length) return 100;
    return Math.round(alunos.reduce((s, a) => s + this.frequencia(a.id).pct, 0) / alunos.length);
  },

  /** Frequência média da escola */
  frequenciaGeral() {
    const alunos = DB.get("alunos");
    if (!alunos.length) return 100;
    return Math.round(alunos.reduce((s, a) => s + this.frequencia(a.id).pct, 0) / alunos.length);
  },

  media(nota) {
    const vals = [nota.atividade1, nota.atividade2, nota.avaliacao].filter((v) => v !== null && v !== undefined && v !== "");
    if (!vals.length) return null;
    return Math.round((vals.reduce((s, v) => s + Number(v), 0) / vals.length) * 10) / 10;
  },

  mediaGeral(alunoId) {
    const ns = DB.get("notas").filter((n) => n.alunoId === alunoId).map((n) => this.media(n)).filter((m) => m !== null);
    if (!ns.length) return null;
    return Math.round((ns.reduce((s, v) => s + v, 0) / ns.length) * 10) / 10;
  },

  notasDoAluno(alunoId) { return DB.get("notas").filter((n) => n.alunoId === alunoId); },

  totalFaltas(alunoId) { return this.frequencia(alunoId).faltas; },

  /** Alunos com frequência abaixo de 75% */
  alunosComMuitasFaltas() {
    return DB.get("alunos").map((a) => ({ aluno: a, freq: this.frequencia(a.id) })).filter((x) => x.freq.pct < 80).sort((a, b) => a.freq.pct - b.freq.pct);
  },
  /** Alunos com média abaixo de 6 */
  alunosComBaixoDesempenho() {
    return DB.get("alunos").map((a) => ({ aluno: a, media: this.mediaGeral(a.id) })).filter((x) => x.media !== null && x.media < 6).sort((a, b) => a.media - b.media);
  },

  /** Comunicados visíveis para um usuário */
  comunicadosPara(user) {
    const aluno = user.alunoId ? this.aluno(user.alunoId) : null;
    return DB.get("comunicados").filter((c) => {
      if (user.perfil === "diretor" || user.perfil === "coordenador") return true;
      if (c.destinatario === "todos") return true;
      if (user.perfil === "professor") return c.destinatario === "professores";
      if (user.perfil === "aluno") return c.destinatario === "alunos" || (aluno && c.destinatario === aluno.turmaId);
      if (user.perfil === "responsavel") return c.destinatario === "responsaveis" || (aluno && c.destinatario === aluno.turmaId);
      return false;
    }).sort((a, b) => b.data.localeCompare(a.data));
  },

  situacaoAcademica(alunoId) {
    const f = this.frequencia(alunoId).pct;
    const m = this.mediaGeral(alunoId);
    if (f < 75) return { label: "Risco por frequência", tipo: "danger" };
    if (m !== null && m < 6) return { label: "Em recuperação", tipo: "warning" };
    return { label: "Regular", tipo: "success" };
  },
};
