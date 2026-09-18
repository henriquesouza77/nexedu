/* Dashboards — um arquivo, cinco painéis (um por perfil) */
(async function () {
  const page = window.location.pathname.split("/").pop();
  const perfilDaPagina = page.replace("dashboard-", "").replace(".html", "");
  const user = await App.init({ title: document.title.split(" · ")[0], roles: [perfilDaPagina] });
  if (!user) return;

  const dash = document.getElementById("dash");
  const stat = (ic, val, label, cor = "") =>
    `<div class="stat"><div class="stat__icon ${cor}">${icon(ic)}</div><div><div class="stat__value">${val}</div><div class="stat__label">${label}</div></div></div>`;
  const hero = (titulo, sub) =>
    `<div class="hero"><div><h2>${titulo}</h2><p>${sub}</p></div><img class="brand-mark" src="../assets/img/logo-teal.svg" alt="Logo NexEdu"></div>`;
  const saudacao = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };

  const comunicadosHtml = (limite = 3) => {
    const cs = Q.comunicadosPara(user).slice(0, limite);
    if (!cs.length) return U.empty("Nenhum comunicado.");
    return cs.map((c) => `<div class="notice"><div class="notice__head"><h3>${U.esc(c.titulo)}</h3><span class="badge badge-primary">${U.destinatarioLabel(c.destinatario)}</span></div>
      <p>${U.esc(c.mensagem)}</p><div class="notice__meta"><span>${U.fmtDate(c.data)}</span><span>por ${U.esc(Q.usuario(c.autorId)?.nome || "—")}</span></div></div>`).join("");
  };

  const ocorrenciasHtml = (lista, limite = 5) => {
    if (!lista.length) return U.empty("Nenhuma ocorrência.");
    return `<div class="list">${lista.slice(0, limite).map((o) => `<div class="list-item"><span class="dot ${o.situacao === "Resolvida" ? "green" : o.situacao === "Em análise" ? "amber" : ""}"></span>
      <div class="list-item__body"><strong>${U.esc(Q.aluno(o.alunoId)?.nome || "—")} · ${U.esc(o.categoria)}</strong><small>${U.fmtDate(o.data)} · ${U.esc(Q.usuario(o.autorId)?.nome || "")}</small><p>${U.esc(o.descricao)}</p></div>${U.badgeStatus(o.situacao)}</div>`).join("")}</div>`;
  };

  const alunoLinha = (a, extra) => `<div class="list-item"><div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><div><strong>${U.esc(a.nome)}</strong><small>${Q.turma(a.turmaId)?.nome || "—"} · Mat. ${a.matricula}</small></div></div><div style="flex:1"></div>${extra}</div>`;

  /* ================= DIRETOR ================= */
  function diretor() {
    const alunos = DB.get("alunos"); const turmas = DB.get("turmas"); const ocos = DB.get("ocorrencias");
    const faltasTotal = alunos.reduce((s, a) => s + Q.totalFaltas(a.id), 0);
    dash.innerHTML = `
      ${hero(`${saudacao()}, ${user.nome.split(" ")[0]}!`, "Acompanhe os principais indicadores da instituição em tempo real.")}
      <div class="grid grid-5">
        ${stat("users", alunos.length, "Alunos cadastrados", "dark")}
        ${stat("book", Q.professores().length, "Professores", "blue")}
        ${stat("layers", turmas.length, "Turmas")}
        ${stat("percent", Q.frequenciaGeral() + "%", "Frequência média", "green")}
        ${stat("alert", ocos.filter((o) => o.situacao !== "Resolvida").length, "Ocorrências abertas", "amber")}
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0">
          <div class="card__header"><div><h2>Turmas</h2><p>Frequência média e quantidade de alunos por turma.</p></div><a class="btn btn-secondary btn-sm" href="turmas.html">Ver todas</a></div>
          <div class="list">${turmas.map((t) => { const f = Q.frequenciaTurma(t.id); const n = Q.alunosDaTurma(t.id).length; return `<div class="list-item"><div class="list-item__body"><strong>${t.nome} <span class="muted" style="font-weight:400">· ${U.esc(t.curso)}</span></strong><small>${n} alunos · ${t.periodo} · Prof. ${U.esc(Q.usuario(t.professorId)?.nome || "—")}</small><div class="progress ${U.corFreq(f)}" style="margin-top:8px"><span style="width:${f}%"></span></div></div><strong style="min-width:48px;text-align:right">${f}%</strong></div>`; }).join("")}</div>
        </div>
        <div class="card mb-0">
          <div class="card__header"><div><h2>Indicadores</h2><p>Resumo acadêmico geral.</p></div></div>
          <div class="grid grid-2" style="gap:12px">
            ${stat("userX", faltasTotal, "Faltas registradas", "amber")}
            ${stat("trendDown", Q.alunosComBaixoDesempenho().length, "Alunos com média < 6")}
            ${stat("calendar", DB.get("aulas").length, "Aulas registradas", "blue")}
            ${stat("clipboard", DB.get("atividades").filter((a) => a.status !== "Encerrada").length, "Atividades abertas", "green")}
          </div>
        </div>
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0"><div class="card__header"><div><h2>Últimas ocorrências</h2></div><a class="btn btn-secondary btn-sm" href="ocorrencias.html">Ver todas</a></div>${ocorrenciasHtml([...ocos].sort((a, b) => b.data.localeCompare(a.data)))}</div>
        <div class="card mb-0"><div class="card__header"><div><h2>Comunicados recentes</h2></div><a class="btn btn-secondary btn-sm" href="comunicados.html">Ver todos</a></div>${comunicadosHtml()}</div>
      </div>`;
  }

  /* ================= COORDENADOR ================= */
  function coordenador() {
    const alunos = DB.get("alunos"); const ocos = DB.get("ocorrencias");
    const faltosos = Q.alunosComMuitasFaltas(); const baixo = Q.alunosComBaixoDesempenho();
    dash.innerHTML = `
      ${hero(`${saudacao()}, ${user.nome.split(" ")[0]}!`, "Acompanhe alunos, turmas e alertas acadêmicos.")}
      <div class="grid grid-4">
        ${stat("users", alunos.filter((a) => a.situacao === "Ativo").length, "Alunos ativos", "dark")}
        ${stat("layers", DB.get("turmas").length, "Turmas")}
        ${stat("alert", ocos.filter((o) => o.situacao !== "Resolvida").length, "Ocorrências abertas", "amber")}
        ${stat("userX", faltosos.length, "Alunos com muitas faltas", "blue")}
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0">
          <div class="card__header"><div><h2>Alunos com muitas faltas</h2><p>Frequência abaixo de 80%.</p></div><a class="btn btn-secondary btn-sm" href="frequencia.html">Frequência</a></div>
          ${faltosos.length ? `<div class="list">${faltosos.slice(0, 6).map((x) => alunoLinha(x.aluno, `<span class="badge badge-danger">${x.freq.pct}% · ${x.freq.faltas} faltas</span>`)).join("")}</div>` : U.empty("Nenhum aluno em alerta de frequência.")}
        </div>
        <div class="card mb-0">
          <div class="card__header"><div><h2>Alunos com baixo rendimento</h2><p>Média geral abaixo de 6,0.</p></div><a class="btn btn-secondary btn-sm" href="notas.html">Notas</a></div>
          ${baixo.length ? `<div class="list">${baixo.slice(0, 6).map((x) => alunoLinha(x.aluno, `<span class="badge badge-warning">Média ${U.nota(x.media)}</span>`)).join("")}</div>` : U.empty("Nenhum aluno com baixo rendimento.")}
        </div>
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0"><div class="card__header"><div><h2>Ocorrências recentes</h2></div><a class="btn btn-secondary btn-sm" href="ocorrencias.html">Ver todas</a></div>${ocorrenciasHtml([...ocos].sort((a, b) => b.data.localeCompare(a.data)))}</div>
      </div>`;
  }

  /* ================= PROFESSOR ================= */
  function professor() {
    const turmas = Q.turmasDoProfessor(user.id);
    const discs = Q.disciplinasDoProfessor(user.id);
    const discIds = new Set(discs.map((d) => d.id));
    const totalAlunos = turmas.reduce((s, t) => s + Q.alunosDaTurma(t.id).length, 0);
    const atvs = DB.get("atividades").filter((a) => discIds.has(a.disciplinaId) && a.status !== "Encerrada");
    const aulas = DB.get("aulas").filter((l) => discIds.has(l.disciplinaId)).sort((a, b) => b.data.localeCompare(a.data));
    const ocos = DB.get("ocorrencias").filter((o) => o.autorId === user.id).sort((a, b) => b.data.localeCompare(a.data));
    dash.innerHTML = `
      ${hero(`${saudacao()}, Prof. ${user.nome.split(" ")[0]}!`, "Seu diário de classe digital: chamada, conteúdo, notas e atividades.")}
      <div class="grid grid-4">
        ${stat("layers", turmas.length, "Minhas turmas", "dark")}
        ${stat("users", totalAlunos, "Alunos")}
        ${stat("clipboard", atvs.length, "Atividades abertas", "blue")}
        ${stat("calendar", aulas.length, "Aulas registradas", "green")}
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0">
          <div class="card__header"><div><h2>Minhas turmas</h2></div><a class="btn btn-primary btn-sm" href="diario.html">Fazer chamada</a></div>
          <div class="list">${turmas.map((t) => `<div class="list-item"><div class="list-item__body"><strong>${t.nome}</strong><small>${U.esc(t.curso)} · ${t.periodo}</small><p>${discs.filter((d) => d.turmaId === t.id).map((d) => d.nome).join(", ")}</p></div><span class="badge">${Q.alunosDaTurma(t.id).length} alunos</span><a class="btn btn-ghost btn-icon" href="diario.html?turma=${t.id}" title="Abrir diário">${icon("arrowRight")}</a></div>`).join("")}</div>
        </div>
        <div class="card mb-0">
          <div class="card__header"><div><h2>Últimos registros de frequência</h2></div></div>
          <div class="list">${aulas.slice(0, 5).map((l) => { const vals = Object.values(l.presencas); const f = vals.filter((v) => v !== "P").length; return `<div class="list-item"><span class="dot ${f > 2 ? "amber" : "green"}"></span><div class="list-item__body"><strong>${Q.turma(l.turmaId)?.nome} · ${Q.disciplina(l.disciplinaId)?.nome}</strong><small>${U.fmtDate(l.data)} · ${U.esc(l.conteudo)}</small></div><span class="badge ${f ? "badge-warning" : "badge-success"}">${vals.length - f}/${vals.length} presentes</span></div>`; }).join("") || U.empty()}</div>
        </div>
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0"><div class="card__header"><div><h2>Atividades abertas</h2></div><a class="btn btn-secondary btn-sm" href="atividades.html">Ver todas</a></div>
          <div class="list">${atvs.map((a) => `<div class="list-item"><div class="list-item__body"><strong>${U.esc(a.titulo)}</strong><small>${Q.turma(a.turmaId)?.nome} · ${Q.disciplina(a.disciplinaId)?.nome} · entrega ${U.fmtDate(a.entrega)}</small></div>${U.badgeStatus(a.status)}</div>`).join("") || U.empty("Nenhuma atividade aberta.")}</div></div>
        <div class="card mb-0"><div class="card__header"><div><h2>Minhas ocorrências</h2></div><a class="btn btn-secondary btn-sm" href="ocorrencias.html">Ver todas</a></div>${ocorrenciasHtml(ocos, 4)}</div>
      </div>
      <div class="card mt-20 mb-0"><div class="card__header"><div><h2>Comunicados</h2></div></div>${comunicadosHtml(2)}</div>`;
  }

  /* ================= ALUNO / RESPONSÁVEL ================= */
  function alunoOuResponsavel(ehResponsavel) {
    const a = App.alunoDoUsuario();
    if (!a) { dash.innerHTML = U.empty("Nenhum aluno vinculado a este usuário."); return; }
    const f = Q.frequencia(a.id); const media = Q.mediaGeral(a.id); const sit = Q.situacaoAcademica(a.id);
    const turma = Q.turma(a.turmaId);
    const discs = Q.disciplinasDaTurma(a.turmaId);
    const atvs = DB.get("atividades").filter((x) => x.turmaId === a.turmaId && x.status !== "Encerrada").sort((x, y) => x.entrega.localeCompare(y.entrega));
    const ocos = DB.get("ocorrencias").filter((o) => o.alunoId === a.id).sort((x, y) => y.data.localeCompare(x.data));
    const titulo = ehResponsavel ? `${saudacao()}, ${user.nome.split(" ")[0]}!` : `${saudacao()}, ${a.nome.split(" ")[0]}!`;
    const sub = ehResponsavel ? `Acompanhamento de <strong>${U.esc(a.nome)}</strong> · ${turma?.nome} · Mat. ${a.matricula}` : `${turma?.nome} · ${U.esc(a.curso)} · Mat. ${a.matricula}`;
    dash.innerHTML = `
      ${hero(titulo, sub)}
      <div class="grid grid-4">
        ${stat("percent", f.pct + "%", "Frequência", U.corFreq(f.pct) === "green" ? "green" : "amber")}
        ${stat("userX", f.faltas, "Faltas" + (f.justificadas ? ` (+${f.justificadas} justificadas)` : ""), "dark")}
        ${stat("star", U.nota(media), "Média geral", "blue")}
        ${stat("clipboard", atvs.length, "Atividades pendentes")}
      </div>
      <div class="grid grid-3 mt-20">
        <div class="card mb-0 center" style="justify-content:center">
          <div class="ring ${U.corFreq(f.pct)}" style="--p:${f.pct}"><span>${f.pct}%</span></div>
          <div><strong>Situação acadêmica</strong><br><span class="badge badge-${sit.tipo}" style="margin-top:6px">${sit.label}</span></div>
          <small class="muted">${f.presencas} presenças · ${f.faltas} faltas · ${f.total} aulas</small>
        </div>
        <div class="card mb-0" style="grid-column: span 2">
          <div class="card__header"><div><h2>Disciplinas e notas</h2><p>Média por disciplina (atividades + avaliação).</p></div><a class="btn btn-secondary btn-sm" href="notas.html">Detalhes</a></div>
          <div class="table-wrap"><table><thead><tr><th>Disciplina</th><th>Professor</th><th class="t-center">Frequência</th><th class="t-center">Média</th></tr></thead><tbody>
            ${discs.map((d) => { const n = DB.get("notas").find((x) => x.alunoId === a.id && x.disciplinaId === d.id); const m = n ? Q.media(n) : null; const fd = Q.frequencia(a.id, d.id); return `<tr><td><strong>${d.nome}</strong></td><td class="muted">${U.esc(Q.usuario(d.professorId)?.nome || "—")}</td><td class="t-center">${fd.pct}%</td><td class="t-center ${U.corMedia(m)}">${U.nota(m)}</td></tr>`; }).join("")}
          </tbody></table></div>
        </div>
      </div>
      <div class="grid grid-2 mt-20">
        <div class="card mb-0"><div class="card__header"><div><h2>Atividades pendentes</h2></div><a class="btn btn-secondary btn-sm" href="atividades.html">Ver todas</a></div>
          <div class="list">${atvs.map((x) => `<div class="list-item"><div class="list-item__body"><strong>${U.esc(x.titulo)}</strong><small>${Q.disciplina(x.disciplinaId)?.nome} · entrega ${U.fmtDate(x.entrega)} · vale ${U.nota(x.valor)}</small></div>${U.badgeStatus(x.status)}</div>`).join("") || U.empty("Nenhuma atividade pendente.")}</div></div>
        <div class="card mb-0"><div class="card__header"><div><h2>Ocorrências</h2></div><a class="btn btn-secondary btn-sm" href="ocorrencias.html">Ver todas</a></div>${ocorrenciasHtml(ocos, 3)}</div>
      </div>
      <div class="card mt-20 mb-0"><div class="card__header"><div><h2>Comunicados</h2></div><a class="btn btn-secondary btn-sm" href="comunicados.html">Ver todos</a></div>${comunicadosHtml(2)}</div>`;
  }

  ({ diretor, coordenador, professor, aluno: () => alunoOuResponsavel(false), responsavel: () => alunoOuResponsavel(true) })[perfilDaPagina]();
})();
