/* Notas — lançamento pelo professor (com média automática) e consulta pelos demais perfis */
(async function () {
  const user = await App.init({ title: "Notas" });
  if (!user) return;
  const root = document.getElementById("notas");

  /* ---- Aluno / responsável: boletim ---- */
  function boletim(alunoId) {
    const a = Q.aluno(alunoId);
    const discs = Q.disciplinasDaTurma(a.turmaId);
    const mg = Q.mediaGeral(alunoId);
    const rows = discs.map((d) => ({ d, n: DB.get("notas").find((x) => x.alunoId === alunoId && x.disciplinaId === d.id) }));
    const acima = rows.filter((r) => r.n && Q.media(r.n) >= 6).length;
    root.innerHTML = `
      <div class="grid grid-3">
        <div class="stat"><div class="stat__icon dark">${icon("star")}</div><div><div class="stat__value">${U.nota(mg)}</div><div class="stat__label">Média geral</div></div></div>
        <div class="stat"><div class="stat__icon green">${icon("checkCircle")}</div><div><div class="stat__value">${acima}/${discs.length}</div><div class="stat__label">Disciplinas com média ≥ 6,0</div></div></div>
        <div class="stat"><div class="stat__icon blue">${icon("book")}</div><div><div class="stat__value">${discs.length}</div><div class="stat__label">Disciplinas</div></div></div>
      </div>
      <div class="card mt-20 mb-0">
        <div class="card__header"><div><h2>Boletim — ${U.esc(a.nome)}</h2><p>${Q.turma(a.turmaId)?.nome} · ${U.esc(a.curso)} · A média é calculada automaticamente (Atividade 1 + Atividade 2 + Avaliação) ÷ 3.</p></div></div>
        <div class="table-wrap"><table><thead><tr><th>Disciplina</th><th>Professor</th><th class="t-center">Atividade 1</th><th class="t-center">Atividade 2</th><th class="t-center">Avaliação</th><th class="t-center">Média</th><th class="t-center">Situação</th></tr></thead><tbody>
          ${rows.map(({ d, n }) => { const m = n ? Q.media(n) : null; return `<tr><td><strong>${d.nome}</strong></td><td class="muted">${U.esc(Q.usuario(d.professorId)?.nome || "—")}</td><td class="t-center">${U.nota(n?.atividade1)}</td><td class="t-center">${U.nota(n?.atividade2)}</td><td class="t-center">${U.nota(n?.avaliacao)}</td><td class="t-center ${U.corMedia(m)}" style="font-size:16px">${U.nota(m)}</td><td class="t-center">${m === null ? '<span class="badge">Sem nota</span>' : m >= 6 ? '<span class="badge badge-success">Aprovado</span>' : '<span class="badge badge-warning">Recuperação</span>'}</td></tr>`; }).join("")}
        </tbody></table></div>
      </div>`;
  }

  /* ---- Equipe: por turma/disciplina ---- */
  function porTurma() {
    const podeEditar = App.is("professor");
    const turmas = podeEditar ? Q.turmasDoProfessor(user.id) : DB.get("turmas");
    root.innerHTML = `<div class="card mb-0">
      <div class="card__header"><div><h2>${podeEditar ? "Lançamento de notas" : "Consulta de notas"}</h2><p id="nResumo">${podeEditar ? "Digite as notas (0 a 10). A média é calculada automaticamente." : ""}</p></div>
        <div class="toolbar"><select class="select" id="selTurma">${U.options(turmas, U.qs("turma") || turmas[0]?.id, (t) => `${t.nome} — ${t.periodo}`)}</select><select class="select" id="selDisc"></select></div></div>
      <div id="tabela"></div>
      ${podeEditar ? `<div class="form-actions"><button class="btn btn-primary" id="btnSalvar">${icon("save")} Salvar notas</button></div>` : ""}
    </div>`;
    const selTurma = document.getElementById("selTurma"); const selDisc = document.getElementById("selDisc");
    function discs() {
      let ds = Q.disciplinasDaTurma(selTurma.value);
      if (podeEditar) ds = ds.filter((d) => d.professorId === user.id);
      selDisc.innerHTML = U.options(ds, "", (d) => d.nome);
    }
    const getNota = (alunoId) => DB.get("notas").find((n) => n.alunoId === alunoId && n.disciplinaId === selDisc.value) || { alunoId, disciplinaId: selDisc.value, atividade1: "", atividade2: "", avaliacao: "" };
    const campo = (aId, k, v) => podeEditar
      ? `<input class="input t-center" type="number" min="0" max="10" step="0.5" data-aluno="${aId}" data-k="${k}" value="${v ?? ""}" style="width:82px;padding:7px 8px;margin:0 auto">`
      : U.nota(v);

    function render() {
      if (!selDisc.value) { document.getElementById("tabela").innerHTML = U.empty("Nenhuma disciplina disponível."); return; }
      const alunos = Q.alunosDaTurma(selTurma.value).sort((a, b) => a.nome.localeCompare(b.nome));
      document.getElementById("tabela").innerHTML = alunos.length ? `<div class="table-wrap"><table><thead><tr><th>Aluno</th><th class="t-center">Atividade 1</th><th class="t-center">Atividade 2</th><th class="t-center">Avaliação</th><th class="t-center">Média</th><th class="t-center">Situação</th></tr></thead><tbody>
        ${alunos.map((a) => { const n = getNota(a.id); const m = Q.media(n); return `<tr data-row="${a.id}"><td><div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><div><strong>${U.esc(a.nome)}</strong><small>Mat. ${a.matricula}</small></div></div></td>
          <td class="t-center">${campo(a.id, "atividade1", n.atividade1)}</td><td class="t-center">${campo(a.id, "atividade2", n.atividade2)}</td><td class="t-center">${campo(a.id, "avaliacao", n.avaliacao)}</td>
          <td class="t-center media ${U.corMedia(m)}" style="font-size:16px">${U.nota(m)}</td><td class="t-center sit">${sitBadge(m)}</td></tr>`; }).join("")}
      </tbody></table></div>` : U.empty("Nenhum aluno nesta turma.");

      if (podeEditar) {
        document.querySelectorAll("input[data-aluno]").forEach((inp) => inp.addEventListener("input", () => {
          const row = inp.closest("tr");
          const vals = {}; row.querySelectorAll("input").forEach((i) => (vals[i.dataset.k] = i.value));
          const m = Q.media(vals);
          inp.classList.toggle("error", inp.value !== "" && (Number(inp.value) < 0 || Number(inp.value) > 10));
          row.querySelector(".media").textContent = U.nota(m);
          row.querySelector(".media").className = `t-center media ${U.corMedia(m)}`;
          row.querySelector(".sit").innerHTML = sitBadge(m);
        }));
      }
    }
    function sitBadge(m) { return m === null ? '<span class="badge">Sem nota</span>' : m >= 6 ? '<span class="badge badge-success">Aprovado</span>' : '<span class="badge badge-warning">Recuperação</span>'; }

    document.getElementById("btnSalvar")?.addEventListener("click", () => {
      const invalidos = [...document.querySelectorAll("input[data-aluno]")].filter((i) => i.value !== "" && (isNaN(Number(i.value)) || Number(i.value) < 0 || Number(i.value) > 10));
      if (invalidos.length) { invalidos.forEach((i) => i.classList.add("error")); toast("As notas devem estar entre 0 e 10.", "error"); return; }
      let count = 0;
      document.querySelectorAll("tr[data-row]").forEach((row) => {
        const alunoId = row.dataset.row; const vals = {}; row.querySelectorAll("input").forEach((i) => (vals[i.dataset.k] = i.value === "" ? "" : Number(i.value)));
        const existente = DB.get("notas").find((n) => n.alunoId === alunoId && n.disciplinaId === selDisc.value);
        if (existente) DB.update("notas", existente.id, vals); else DB.insert("notas", { alunoId, disciplinaId: selDisc.value, ...vals });
        count++;
      });
      toast(`Notas de ${count} aluno(s) salvas com sucesso!`);
    });

    selTurma.onchange = () => { discs(); render(); };
    selDisc.onchange = render;
    discs(); render();
  }

  if (App.is("aluno", "responsavel")) boletim(user.alunoId); else porTurma();
})();
