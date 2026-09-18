/* Atividades — somente professores criam/alteram; demais perfis consultam. */
(async function () {
  const user = await App.init({ title: "Atividades" });
  if (!user) return;

  const grid = document.getElementById("atvGrid");
  const fStatus = document.getElementById("fStatus");
  const btnNovaAtv = document.getElementById("btnNovaAtv");
  const podeEditar = App.is("professor");
  if (!podeEditar && btnNovaAtv) btnNovaAtv.hidden = true;
  if (podeEditar && btnNovaAtv) btnNovaAtv.hidden = false;

  function visiveis() {
    let lista = DB.get("atividades");
    if (App.is("professor")) { const ids = new Set(Q.disciplinasDoProfessor(user.id).map((d) => d.id)); lista = lista.filter((a) => ids.has(a.disciplinaId)); }
    if (App.is("aluno", "responsavel")) { const al = App.alunoDoUsuario(); lista = lista.filter((a) => al && a.turmaId === al.turmaId); }
    if (fStatus.value) lista = lista.filter((a) => a.status === fStatus.value);
    return lista.sort((a, b) => a.entrega.localeCompare(b.entrega));
  }

  function render() {
    const lista = visiveis();
    document.getElementById("atvResumo").textContent = `${lista.length} atividade(s) · ${lista.filter((a) => a.status !== "Encerrada").length} em aberto`;
    if (!lista.length) { grid.innerHTML = `<div class="card mb-0" style="grid-column:1/-1">${U.empty("Nenhuma atividade encontrada.")}</div>`; return; }
    const hoje = U.today();
    grid.innerHTML = lista.map((a) => {
      const atrasada = a.status !== "Encerrada" && a.entrega < hoje;
      return `<div class="card mb-0" style="display:flex;flex-direction:column;gap:12px;border-top:4px solid ${a.status === "Encerrada" ? "var(--border)" : a.status === "Em andamento" ? "var(--warning)" : "var(--info)"}">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3 style="font-size:16px">${U.esc(a.titulo)}</h3>${U.badgeStatus(a.status)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge">${Q.turma(a.turmaId)?.nome || "—"}</span><span class="badge">${Q.disciplina(a.disciplinaId)?.nome || "—"}</span><span class="badge badge-primary">Vale ${U.nota(a.valor)}</span></div>
        <p style="color:var(--text-2);font-size:14px;flex:1">${U.esc(a.descricao)}</p>
        <div class="kv" style="gap:6px 12px"><div><small>Criada em</small><span>${U.fmtDate(a.criacao)}</span></div><div><small>Entrega</small><span class="${atrasada ? "text-danger fw-700" : ""}">${U.fmtDate(a.entrega)}${atrasada ? " · atrasada" : ""}</span></div></div>
        ${podeEditar ? `<div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:12px">
          <select class="select btn-sm" data-status="${a.id}" style="flex:1;min-width:140px;padding:7px 32px 7px 10px">${["Disponível", "Em andamento", "Encerrada"].map((s) => `<option ${a.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
          <button class="btn btn-secondary btn-icon" data-edit="${a.id}" title="Editar">${icon("edit")}</button>
          <button class="btn btn-danger btn-icon" data-del="${a.id}" title="Excluir">${icon("trash")}</button></div>` : ""}
      </div>`;
    }).join("");
  }

  function formAtividade(a = null) {
    if (!podeEditar) return;
    const discs = App.is("professor") ? Q.disciplinasDoProfessor(user.id) : DB.get("disciplinas");
    Modal.open(a ? "Editar atividade" : "Nova atividade", `
      <form id="formAtv" novalidate>
        <div class="form-grid">
          <div class="field full"><label>Título <span class="req">*</span></label><input class="input" name="titulo" value="${U.esc(a?.titulo || "")}" placeholder="Ex.: Lista de exercícios — Flexbox"><small class="hint"></small></div>
          <div class="field full"><label>Disciplina / turma <span class="req">*</span></label><select class="select" name="disciplinaId">${U.options(discs, a?.disciplinaId, (d) => `${d.nome} — ${Q.turma(d.turmaId)?.nome}`, "Selecione")}</select><small class="hint"></small></div>
          <div class="field full"><label>Descrição <span class="req">*</span></label><textarea class="textarea" name="descricao" placeholder="Descreva o que deve ser entregue.">${U.esc(a?.descricao || "")}</textarea><small class="hint"></small></div>
          <div class="field"><label>Data de entrega <span class="req">*</span></label><input class="input" type="date" name="entrega" value="${a?.entrega || ""}"><small class="hint"></small></div>
          <div class="field"><label>Valor (0 a 10) <span class="req">*</span></label><input class="input" type="number" name="valor" min="0" max="10" step="0.5" value="${a?.valor ?? 10}"><small class="hint"></small></div>
          <div class="field full"><label>Status</label><select class="select" name="status">${["Disponível", "Em andamento", "Encerrada"].map((s) => `<option ${(a?.status || "Disponível") === s ? "selected" : ""}>${s}</option>`).join("")}</select><small class="hint"></small></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary" type="submit">${a ? "Salvar alterações" : "Criar atividade"}</button></div>
      </form>`);
    const form = document.getElementById("formAtv");
    form.onsubmit = (e) => {
      e.preventDefault();
      const ok = Form.validate(form, {
        titulo: [Form.required(), Form.min(3)], disciplinaId: [Form.required("Selecione a disciplina.")], descricao: [Form.required(), Form.min(10)],
        entrega: [Form.required("Informe a data de entrega."), { test: (v) => !!a || v >= U.today(), msg: "A entrega não pode ser no passado." }],
        valor: [Form.required(), Form.numberRange(0, 10)],
      });
      if (!ok) return;
      const dados = Form.data(form); dados.valor = Number(dados.valor);
      dados.turmaId = Q.disciplina(dados.disciplinaId).turmaId;
      if (a) { DB.update("atividades", a.id, dados); toast("Atividade atualizada!"); }
      else { DB.insert("atividades", { ...dados, criacao: U.today(), autorId: user.id }); toast("Atividade criada com sucesso!"); }
      Modal.close(); render();
    };
  }

  grid.addEventListener("click", (e) => {
    if (!podeEditar) return;
    const ed = e.target.closest("[data-edit]"); const del = e.target.closest("[data-del]");
    if (ed) formAtividade(DB.find("atividades", ed.dataset.edit));
    if (del) Modal.confirm("Excluir atividade", "Deseja excluir esta atividade?", () => { DB.remove("atividades", del.dataset.del); toast("Atividade excluída."); render(); });
  });
  grid.addEventListener("change", (e) => {
    if (!podeEditar) return;
    const s = e.target.closest("[data-status]");
    if (s) { DB.update("atividades", s.dataset.status, { status: s.value }); toast(`Status alterado para "${s.value}".`, "info"); render(); }
  });
  if (btnNovaAtv) btnNovaAtv.onclick = () => { if (podeEditar) formAtividade(); };
  fStatus.onchange = render;
  render();
})();
