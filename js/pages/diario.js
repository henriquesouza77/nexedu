/* Diário de classe — chamada (P / F / FJ), conteúdo da aula e histórico */
(async function () {
  const user = await App.init({ title: "Diário de classe", roles: ["professor"] });
  if (!user) return;

  const selTurma = document.getElementById("selTurma");
  const selDisc = document.getElementById("selDisciplina");
  const selData = document.getElementById("selData");
  const chamada = document.getElementById("chamada");
  const historico = document.getElementById("historico");

  const turmas = Q.turmasDoProfessor(user.id);
  selTurma.innerHTML = U.options(turmas, U.qs("turma") || turmas[0]?.id, (t) => t.nome);
  selData.value = U.today();
  selData.max = U.today();

  let presencas = {}; // estado da chamada em edição

  function discsDaTurma() { return Q.disciplinasDoProfessor(user.id).filter((d) => d.turmaId === selTurma.value); }
  function aulaAtual() {
    return DB.get("aulas").find((l) => l.turmaId === selTurma.value && l.disciplinaId === selDisc.value && l.data === selData.value) || null;
  }

  function atualizarDisciplinas() {
    const ds = discsDaTurma();
    selDisc.innerHTML = U.options(ds, ds[0]?.id, (d) => d.nome);
    renderChamada();
  }

  function renderChamada() {
    const alunos = Q.alunosDaTurma(selTurma.value).filter((a) => a.situacao === "Ativo").sort((a, b) => a.nome.localeCompare(b.nome));
    const aula = aulaAtual();
    presencas = {}; alunos.forEach((a) => (presencas[a.id] = aula?.presencas[a.id] || "P"));

    if (!selDisc.value) { chamada.innerHTML = U.empty("Você não possui disciplinas nesta turma."); historico.innerHTML = ""; return; }
    if (!alunos.length) { chamada.innerHTML = U.empty("Nenhum aluno ativo nesta turma."); renderHistorico(); return; }

    chamada.innerHTML = `
      ${aula ? `<div class="notice" style="margin-bottom:16px;border-left-color:var(--info)"><div class="notice__head"><h3>${icon("info")} Aula já registrada nesta data</h3><span class="badge badge-info">Editando</span></div><p>Você pode ajustar a chamada e o conteúdo. As alterações substituirão o registro anterior.</p></div>` : ""}
      <div class="toolbar" style="margin-bottom:12px;justify-content:space-between">
        <span class="muted" id="resumoChamada"></span>
        <div class="toolbar"><button class="btn btn-secondary btn-sm" id="todosP">${icon("check")} Marcar todos presentes</button></div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Aluno</th><th>Matrícula</th><th class="t-right">Presença</th></tr></thead><tbody>
        ${alunos.map((a, i) => `<tr><td class="muted">${i + 1}</td><td><div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><strong>${U.esc(a.nome)}</strong></div></td><td class="muted">${a.matricula}</td>
          <td class="t-right"><div class="seg" data-aluno="${a.id}">
            <button type="button" data-v="P" class="${presencas[a.id] === "P" ? "on-P" : ""}">Presente</button>
            <button type="button" data-v="F" class="${presencas[a.id] === "F" ? "on-F" : ""}">Falta</button>
            <button type="button" data-v="FJ" class="${presencas[a.id] === "FJ" ? "on-FJ" : ""}">Justificada</button>
          </div></td></tr>`).join("")}
      </tbody></table></div>
      <form id="formAula" novalidate style="margin-top:20px">
        <h3 class="section-title">Conteúdo da aula</h3>
        <div class="form-grid">
          <div class="field full"><label>Conteúdo trabalhado <span class="req">*</span></label><textarea class="textarea" name="conteudo" style="min-height:80px" placeholder="Ex.: Introdução ao JavaScript e manipulação básica do DOM.">${U.esc(aula?.conteudo || "")}</textarea><small class="hint"></small></div>
          <div class="field full"><label>Observações</label><textarea class="textarea" name="observacao" style="min-height:60px" placeholder="Observações gerais sobre a aula (opcional).">${U.esc(aula?.observacao || "")}</textarea><small class="hint"></small></div>
        </div>
        <div class="form-actions">
          ${aula ? `<button type="button" class="btn btn-danger" id="btnExcluirAula">${icon("trash")} Excluir registro</button>` : ""}
          <button class="btn btn-primary" type="submit">${icon("save")} ${aula ? "Salvar alterações" : "Salvar chamada"}</button>
        </div>
      </form>`;

    atualizarResumo();
    chamada.querySelectorAll(".seg").forEach((seg) => seg.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      presencas[seg.dataset.aluno] = b.dataset.v;
      seg.querySelectorAll("button").forEach((x) => (x.className = x.dataset.v === b.dataset.v ? `on-${b.dataset.v}` : ""));
      atualizarResumo();
    }));
    document.getElementById("todosP").onclick = () => {
      Object.keys(presencas).forEach((k) => (presencas[k] = "P"));
      chamada.querySelectorAll(".seg button").forEach((x) => (x.className = x.dataset.v === "P" ? "on-P" : ""));
      atualizarResumo();
    };

    const form = document.getElementById("formAula");
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!Form.validate(form, { conteudo: [Form.required("Descreva o conteúdo trabalhado."), Form.min(5)] })) return;
      if (!selData.value) { toast("Selecione a data da aula.", "error"); return; }
      const dados = { turmaId: selTurma.value, disciplinaId: selDisc.value, data: selData.value, ...Form.data(form), presencas: { ...presencas } };
      const existente = aulaAtual();
      if (existente) DB.update("aulas", existente.id, dados); else DB.insert("aulas", dados);
      toast(existente ? "Registro de aula atualizado!" : "Chamada salva com sucesso!");
      renderChamada();
    };
    document.getElementById("btnExcluirAula")?.addEventListener("click", () => {
      Modal.confirm("Excluir registro", "Deseja excluir o registro desta aula (chamada e conteúdo)?", () => { DB.remove("aulas", aulaAtual().id); toast("Registro excluído."); renderChamada(); });
    });
    renderHistorico();
  }

  function atualizarResumo() {
    const vals = Object.values(presencas);
    const p = vals.filter((v) => v === "P").length, f = vals.filter((v) => v === "F").length, fj = vals.filter((v) => v === "FJ").length;
    document.getElementById("resumoChamada").innerHTML = `<strong>${vals.length}</strong> alunos · <span class="text-success fw-700">${p}</span> presentes · <span class="text-danger fw-700">${f}</span> faltas · <span style="color:var(--warning)" class="fw-700">${fj}</span> justificadas`;
  }

  function renderHistorico() {
    const aulas = DB.get("aulas").filter((l) => l.turmaId === selTurma.value && l.disciplinaId === selDisc.value).sort((a, b) => b.data.localeCompare(a.data));
    if (!aulas.length) { historico.innerHTML = U.empty("Nenhuma aula registrada ainda."); return; }
    historico.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Conteúdo</th><th>Observação</th><th class="t-center">Presentes</th><th class="t-center">Faltas</th><th class="t-right">Ações</th></tr></thead><tbody>
      ${aulas.map((l) => { const v = Object.values(l.presencas); const f = v.filter((x) => x !== "P").length; return `<tr><td><strong>${U.fmtDate(l.data)}</strong></td><td>${U.esc(l.conteudo)}</td><td class="muted">${U.esc(l.observacao || "—")}</td><td class="t-center"><span class="badge badge-success">${v.length - f}</span></td><td class="t-center"><span class="badge ${f ? "badge-danger" : ""}">${f}</span></td><td class="actions"><button class="btn btn-secondary btn-icon" data-abrir="${l.data}" title="Abrir">${icon("edit")}</button></td></tr>`; }).join("")}
    </tbody></table></div>`;
    historico.querySelectorAll("[data-abrir]").forEach((b) => (b.onclick = () => { selData.value = b.dataset.abrir; renderChamada(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
  }

  selTurma.addEventListener("change", atualizarDisciplinas);
  selDisc.addEventListener("change", renderChamada);
  selData.addEventListener("change", renderChamada);
  atualizarDisciplinas();
})();
