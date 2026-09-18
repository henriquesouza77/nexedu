/* Frequência — visão por turma (equipe) ou visão individual (aluno/responsável) */
(async function () {
  const user = await App.init({ title: "Frequência" });
  if (!user) return;
  const root = document.getElementById("freq");

  /* ---- Visão individual ---- */
  function individual(alunoId) {
    const a = Q.aluno(alunoId); const f = Q.frequencia(alunoId);
    const discs = Q.disciplinasDaTurma(a.turmaId);
    const faltas = DB.get("aulas").filter((l) => l.presencas[alunoId] && l.presencas[alunoId] !== "P").sort((x, y) => y.data.localeCompare(x.data));
    root.innerHTML = `
      <div class="grid grid-4">
        <div class="stat"><div class="stat__icon blue">${icon("calendar")}</div><div><div class="stat__value">${f.total}</div><div class="stat__label">Total de aulas</div></div></div>
        <div class="stat"><div class="stat__icon green">${icon("checkCircle")}</div><div><div class="stat__value">${f.presencas}</div><div class="stat__label">Presenças</div></div></div>
        <div class="stat"><div class="stat__icon amber">${icon("userX")}</div><div><div class="stat__value">${f.faltas}</div><div class="stat__label">Faltas${f.justificadas ? ` · ${f.justificadas} justificadas` : ""}</div></div></div>
        <div class="stat"><div class="stat__icon ${f.pct >= 75 ? "green" : ""}">${icon("percent")}</div><div><div class="stat__value">${f.pct}%</div><div class="stat__label">Frequência</div></div></div>
      </div>
      <div class="grid grid-3 mt-20">
        <div class="card mb-0 center" style="justify-content:center">
          <div class="ring ${U.corFreq(f.pct)}" style="--p:${f.pct}"><span>${f.pct}%</span></div>
          <strong>${U.esc(a.nome)}</strong><small class="muted">${Q.turma(a.turmaId)?.nome} · Mat. ${a.matricula}</small>
          <span class="badge badge-${f.pct >= 75 ? "success" : "danger"}">${f.pct >= 75 ? "Frequência regular (mín. 75%)" : "Abaixo do mínimo de 75%"}</span>
        </div>
        <div class="card mb-0" style="grid-column:span 2">
          <div class="card__header"><div><h2>Frequência por disciplina</h2></div></div>
          <div class="table-wrap"><table><thead><tr><th>Disciplina</th><th class="t-center">Aulas</th><th class="t-center">Presenças</th><th class="t-center">Faltas</th><th style="width:220px">Frequência</th></tr></thead><tbody>
            ${discs.map((d) => { const fd = Q.frequencia(alunoId, d.id); return `<tr><td><strong>${d.nome}</strong><br><small class="muted">${U.esc(Q.usuario(d.professorId)?.nome || "")}</small></td><td class="t-center">${fd.total}</td><td class="t-center">${fd.presencas}</td><td class="t-center ${fd.faltas ? "text-danger fw-700" : ""}">${fd.faltas}${fd.justificadas ? ` <small class="muted">(+${fd.justificadas} just.)</small>` : ""}</td><td><div style="display:flex;align-items:center;gap:10px"><div class="progress ${U.corFreq(fd.pct)}" style="flex:1"><span style="width:${fd.pct}%"></span></div><strong style="min-width:40px">${fd.pct}%</strong></div></td></tr>`; }).join("")}
          </tbody></table></div>
        </div>
      </div>
      <div class="card mt-20 mb-0">
        <div class="card__header"><div><h2>Registro de faltas</h2><p>Todas as ausências registradas pelos professores.</p></div></div>
        ${faltas.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Disciplina</th><th>Conteúdo da aula</th><th class="t-right">Tipo</th></tr></thead><tbody>
          ${faltas.map((l) => `<tr><td><strong>${U.fmtDate(l.data)}</strong></td><td>${Q.disciplina(l.disciplinaId)?.nome}</td><td class="muted">${U.esc(l.conteudo)}</td><td class="t-right">${U.presencaBadge(l.presencas[alunoId])}</td></tr>`).join("")}
        </tbody></table></div>` : U.empty("Nenhuma falta registrada. Parabéns!")}
      </div>`;
  }

  /* ---- Visão por turma ---- */
  function porTurma() {
    const turmas = App.is("professor") ? Q.turmasDoProfessor(user.id) : DB.get("turmas");
    root.innerHTML = `<div class="card mb-0">
      <div class="card__header"><div><h2>Frequência por turma</h2><p id="fResumo"></p></div>
        <div class="toolbar"><select class="select" id="selTurma">${U.options(turmas, U.qs("turma") || turmas[0]?.id, (t) => `${t.nome} — ${t.periodo}`)}</select><select class="select" id="selDisc"></select></div></div>
      <div id="tabela"></div></div>`;
    const selTurma = document.getElementById("selTurma"); const selDisc = document.getElementById("selDisc");
    function discs() {
      let ds = Q.disciplinasDaTurma(selTurma.value);
      if (App.is("professor")) ds = ds.filter((d) => d.professorId === user.id);
      selDisc.innerHTML = `<option value="">Todas as disciplinas</option>` + U.options(ds, "", (d) => d.nome);
    }
    function render() {
      const alunos = Q.alunosDaTurma(selTurma.value).sort((a, b) => a.nome.localeCompare(b.nome));
      const rows = alunos.map((a) => ({ a, f: Q.frequencia(a.id, selDisc.value || null) }));
      const media = rows.length ? Math.round(rows.reduce((s, r) => s + r.f.pct, 0) / rows.length) : 0;
      document.getElementById("fResumo").textContent = `${alunos.length} alunos · frequência média ${media}% · ${rows.filter((r) => r.f.pct < 75).length} abaixo de 75%`;
      document.getElementById("tabela").innerHTML = rows.length ? `<div class="table-wrap"><table><thead><tr><th>Aluno</th><th class="t-center">Aulas</th><th class="t-center">Presenças</th><th class="t-center">Faltas</th><th class="t-center">Justificadas</th><th style="width:220px">Frequência</th><th class="t-right">Ações</th></tr></thead><tbody>
        ${rows.map(({ a, f }) => `<tr><td><div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><div><strong>${U.esc(a.nome)}</strong><small>Mat. ${a.matricula}</small></div></div></td><td class="t-center">${f.total}</td><td class="t-center">${f.presencas}</td><td class="t-center ${f.faltas > 3 ? "text-danger fw-700" : ""}">${f.faltas}</td><td class="t-center">${f.justificadas}</td><td><div style="display:flex;align-items:center;gap:10px"><div class="progress ${U.corFreq(f.pct)}" style="flex:1"><span style="width:${f.pct}%"></span></div><strong style="min-width:40px">${f.pct}%</strong></div></td><td class="actions"><button class="btn btn-secondary btn-icon" data-ver="${a.id}" title="Detalhar">${icon("eye")}</button></td></tr>`).join("")}
      </tbody></table></div>` : U.empty("Nenhum aluno nesta turma.");
      document.querySelectorAll("[data-ver]").forEach((b) => (b.onclick = () => detalhe(b.dataset.ver)));
    }
    function detalhe(alunoId) {
      const a = Q.aluno(alunoId);
      const faltas = DB.get("aulas").filter((l) => l.presencas[alunoId] && l.presencas[alunoId] !== "P").sort((x, y) => y.data.localeCompare(x.data));
      const f = Q.frequencia(alunoId);
      Modal.open(`Faltas de ${U.esc(a.nome)}`, `<p class="muted" style="margin-bottom:14px">${f.total} aulas · ${f.presencas} presenças · <strong class="text-danger">${f.faltas} faltas</strong> · ${f.justificadas} justificadas · <strong>${f.pct}%</strong></p>
        ${faltas.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Disciplina</th><th class="t-right">Tipo</th></tr></thead><tbody>${faltas.map((l) => `<tr><td>${U.fmtDate(l.data)}</td><td>${Q.disciplina(l.disciplinaId)?.nome}</td><td class="t-right">${U.presencaBadge(l.presencas[alunoId])}</td></tr>`).join("")}</tbody></table></div>` : U.empty("Nenhuma falta registrada.")}`);
    }
    selTurma.onchange = () => { discs(); render(); };
    selDisc.onchange = render;
    discs(); render();
  }

  if (App.is("aluno", "responsavel")) individual(user.alunoId); else porTurma();
})();
