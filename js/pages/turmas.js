/* Turmas — cards com resumo; coordenador pode cadastrar/editar turmas */
(async function () {
  const user = await App.init({ title: "Turmas", roles: ["diretor", "coordenador", "professor"] });
  if (!user) return;

  const grid = document.getElementById("turmasGrid");
  const podeEditar = App.is("coordenador");
  if (podeEditar) document.getElementById("btnNovaTurma").hidden = false;
  if (App.is("professor")) document.getElementById("turmasTitulo").textContent = "Minhas turmas";

  function turmasVisiveis() {
    return App.is("professor") ? Q.turmasDoProfessor(user.id) : DB.get("turmas");
  }

  function render() {
    const turmas = turmasVisiveis();
    document.getElementById("turmasResumo").textContent = `${turmas.length} turma(s) · ${turmas.reduce((s, t) => s + Q.alunosDaTurma(t.id).length, 0)} alunos`;
    if (!turmas.length) { grid.innerHTML = `<div class="card" style="grid-column:1/-1">${U.empty("Nenhuma turma cadastrada.")}</div>`; return; }
    grid.innerHTML = turmas.map((t) => {
      const alunos = Q.alunosDaTurma(t.id); const f = Q.frequenciaTurma(t.id);
      const discs = Q.disciplinasDaTurma(t.id);
      const medias = alunos.map((a) => Q.mediaGeral(a.id)).filter((m) => m !== null);
      const mediaTurma = medias.length ? Math.round((medias.reduce((s, v) => s + v, 0) / medias.length) * 10) / 10 : null;
      return `<div class="card mb-0" style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div><h3 style="font-size:22px;font-weight:800;letter-spacing:-.02em">${U.esc(t.nome)}</h3><p class="muted" style="font-size:13px">${U.esc(t.curso)}</p></div>
          <span class="badge badge-primary">${t.periodo}</span>
        </div>
        <div class="kv" style="gap:8px 16px">
          <div><small>Semestre</small><span>${U.esc(t.semestre)}</span></div>
          <div><small>Alunos</small><span>${alunos.length}</span></div>
          <div><small>Prof. responsável</small><span>${U.esc(Q.usuario(t.professorId)?.nome || "—")}</span></div>
          <div><small>Média da turma</small><span class="${U.corMedia(mediaTurma)}">${U.nota(mediaTurma)}</span></div>
        </div>
        <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span class="muted">Frequência média</span><strong>${f}%</strong></div><div class="progress ${U.corFreq(f)}"><span style="width:${f}%"></span></div></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${discs.map((d) => `<span class="badge">${U.esc(d.nome)}</span>`).join("") || '<span class="muted" style="font-size:13px">Sem disciplinas</span>'}</div>
        <div style="display:flex;gap:8px;margin-top:auto;flex-wrap:wrap">
          <a class="btn btn-secondary btn-sm" href="alunos.html?turma=${t.id}">${icon("users")} Alunos</a>
          ${App.is("professor") ? `<a class="btn btn-primary btn-sm" href="diario.html?turma=${t.id}">${icon("book")} Diário</a>` : `<a class="btn btn-secondary btn-sm" href="frequencia.html?turma=${t.id}">${icon("checkCircle")} Frequência</a>`}
          ${podeEditar ? `<button class="btn btn-ghost btn-sm" data-edit="${t.id}">${icon("edit")} Editar</button>` : ""}
        </div>
      </div>`;
    }).join("");
  }

  function formTurma(t = null) {
    Modal.open(t ? "Editar turma" : "Nova turma", `
      <form id="formTurma" novalidate>
        <div class="form-grid">
          <div class="field"><label>Nome da turma <span class="req">*</span></label><input class="input" name="nome" value="${U.esc(t?.nome || "")}" placeholder="Ex.: TDS3A"><small class="hint"></small></div>
          <div class="field"><label>Período <span class="req">*</span></label><select class="select" name="periodo"><option value="">Selecione</option>${["Manhã", "Tarde", "Noite"].map((p) => `<option ${t?.periodo === p ? "selected" : ""}>${p}</option>`).join("")}</select><small class="hint"></small></div>
          <div class="field full"><label>Curso <span class="req">*</span></label><input class="input" name="curso" value="${U.esc(t?.curso || "")}" placeholder="Ex.: Técnico em Desenvolvimento de Sistemas"><small class="hint"></small></div>
          <div class="field"><label>Semestre <span class="req">*</span></label><input class="input" name="semestre" value="${U.esc(t?.semestre || "")}" placeholder="Ex.: 2º Semestre"><small class="hint"></small></div>
          <div class="field"><label>Professor responsável <span class="req">*</span></label><select class="select" name="professorId">${U.options(Q.professores(), t?.professorId, (p) => p.nome, "Selecione")}</select><small class="hint"></small></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary" type="submit">Salvar</button></div>
      </form>`);
    const form = document.getElementById("formTurma");
    form.onsubmit = (e) => {
      e.preventDefault();
      const ok = Form.validate(form, {
        nome: [Form.required(), { test: (v) => !DB.get("turmas").some((x) => x.nome.toLowerCase() === v.toLowerCase() && x.id !== t?.id), msg: "Já existe uma turma com este nome." }],
        periodo: [Form.required()], curso: [Form.required()], semestre: [Form.required()], professorId: [Form.required()],
      });
      if (!ok) return;
      const dados = Form.data(form);
      if (t) { DB.update("turmas", t.id, dados); toast("Turma atualizada!"); }
      else { DB.insert("turmas", dados); toast("Turma cadastrada!"); }
      Modal.close(); render();
    };
  }

  document.getElementById("btnNovaTurma").onclick = () => formTurma();
  grid.addEventListener("click", (e) => { const b = e.target.closest("[data-edit]"); if (b) formTurma(Q.turma(b.dataset.edit)); });
  render();
})();
