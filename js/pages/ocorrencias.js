/* Ocorrências — registro (professor/coordenador), consulta e alteração de situação */
(async function () {
  const user = await App.init({ title: "Ocorrências", roles: ["diretor", "coordenador", "professor", "aluno", "responsavel"] });
  if (!user) return;

  const CATEGORIAS = ["Comportamento", "Atraso", "Falta", "Uso inadequado de equipamento", "Uso de celular", "Desrespeito", "Outros"];
  const tbody = document.getElementById("tbody");
  const fCat = document.getElementById("fCategoria"); const fSit = document.getElementById("fSituacaoOco");
  fCat.innerHTML += CATEGORIAS.map((c) => `<option>${c}</option>`).join("");
  const podeRegistrar = App.is("professor", "coordenador");
  const podeGerir = App.is("coordenador", "diretor");
  if (podeRegistrar) document.getElementById("btnNovaOco").hidden = false;

  function visiveis() {
    let lista = DB.get("ocorrencias");
    if (App.is("aluno", "responsavel")) lista = lista.filter((o) => o.alunoId === user.alunoId);
    if (App.is("professor")) { const ids = new Set(Q.turmasDoProfessor(user.id).map((t) => t.id)); lista = lista.filter((o) => ids.has(Q.aluno(o.alunoId)?.turmaId)); }
    if (fCat.value) lista = lista.filter((o) => o.categoria === fCat.value);
    if (fSit.value) lista = lista.filter((o) => o.situacao === fSit.value);
    return lista.sort((a, b) => b.data.localeCompare(a.data));
  }

  function render() {
    const lista = visiveis();
    document.getElementById("ocoResumo").textContent = `${lista.length} ocorrência(s) · ${lista.filter((o) => o.situacao !== "Resolvida").length} em aberto`;
    if (!lista.length) { tbody.innerHTML = `<tr><td colspan="7">${U.empty("Nenhuma ocorrência registrada.")}</td></tr>`; return; }
    tbody.innerHTML = lista.map((o) => {
      const a = Q.aluno(o.alunoId);
      const podeEditarEsta = podeGerir || (App.is("professor") && o.autorId === user.id);
      return `<tr>
        <td><strong>${U.fmtDate(o.data)}</strong></td>
        <td style="white-space:nowrap">${a ? `<div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><div><strong>${U.esc(a.nome)}</strong><small>${Q.turma(a.turmaId)?.nome || ""}</small></div></div>` : "—"}</td>
        <td><span class="badge" style="white-space:normal">${U.esc(o.categoria)}</span></td>
        <td style="min-width:220px;color:var(--text-2)">${U.esc(o.descricao)}</td>
        <td class="muted" style="white-space:nowrap;font-size:13px">${U.esc(Q.usuario(o.autorId)?.nome || "—")}</td>
        <td>${podeEditarEsta ? `<select class="select" data-sit="${o.id}" style="padding:6px 30px 6px 10px;font-size:13px;width:auto">${["Aberta", "Em análise", "Resolvida"].map((s) => `<option ${o.situacao === s ? "selected" : ""}>${s}</option>`).join("")}</select>` : U.badgeStatus(o.situacao)}</td>
        <td class="actions">${podeEditarEsta ? `<button class="btn btn-secondary btn-icon" data-edit="${o.id}" title="Editar">${icon("edit")}</button><button class="btn btn-danger btn-icon" data-del="${o.id}" title="Excluir">${icon("trash")}</button>` : ""}</td>
      </tr>`;
    }).join("");
  }

  function formOco(o = null) {
    let alunos = DB.get("alunos");
    if (App.is("professor")) { const ids = new Set(Q.turmasDoProfessor(user.id).map((t) => t.id)); alunos = alunos.filter((a) => ids.has(a.turmaId)); }
    alunos.sort((a, b) => a.nome.localeCompare(b.nome));
    Modal.open(o ? "Editar ocorrência" : "Registrar ocorrência", `
      <form id="formOco" novalidate>
        <div class="form-grid">
          <div class="field full"><label>Aluno <span class="req">*</span></label><select class="select" name="alunoId">${U.options(alunos, o?.alunoId, (a) => `${a.nome} — ${Q.turma(a.turmaId)?.nome}`, "Selecione o aluno")}</select><small class="hint"></small></div>
          <div class="field"><label>Data <span class="req">*</span></label><input class="input" type="date" name="data" value="${o?.data || U.today()}" max="${U.today()}"><small class="hint"></small></div>
          <div class="field"><label>Categoria <span class="req">*</span></label><select class="select" name="categoria"><option value="">Selecione</option>${CATEGORIAS.map((c) => `<option ${o?.categoria === c ? "selected" : ""}>${c}</option>`).join("")}</select><small class="hint"></small></div>
          <div class="field full"><label>Descrição <span class="req">*</span></label><textarea class="textarea" name="descricao" placeholder="Descreva o que aconteceu de forma objetiva.">${U.esc(o?.descricao || "")}</textarea><small class="hint"></small></div>
          <div class="field full"><label>Situação</label><select class="select" name="situacao">${["Aberta", "Em análise", "Resolvida"].map((s) => `<option ${(o?.situacao || "Aberta") === s ? "selected" : ""}>${s}</option>`).join("")}</select><small class="hint"></small></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary" type="submit">${o ? "Salvar alterações" : "Registrar"}</button></div>
      </form>`);
    const form = document.getElementById("formOco");
    form.onsubmit = (e) => {
      e.preventDefault();
      const ok = Form.validate(form, {
        alunoId: [Form.required("Selecione o aluno.")], data: [Form.required(), { test: (v) => v <= U.today(), msg: "A data não pode ser futura." }],
        categoria: [Form.required("Selecione a categoria.")], descricao: [Form.required(), Form.min(10)],
      });
      if (!ok) return;
      const dados = Form.data(form);
      if (o) { DB.update("ocorrencias", o.id, dados); toast("Ocorrência atualizada!"); }
      else { DB.insert("ocorrencias", { ...dados, autorId: user.id }); toast("Ocorrência registrada!"); }
      Modal.close(); render();
    };
  }

  tbody.addEventListener("click", (e) => {
    const ed = e.target.closest("[data-edit]"); const del = e.target.closest("[data-del]");
    if (ed) formOco(DB.find("ocorrencias", ed.dataset.edit));
    if (del) Modal.confirm("Excluir ocorrência", "Deseja excluir esta ocorrência?", () => { DB.remove("ocorrencias", del.dataset.del); toast("Ocorrência excluída."); render(); });
  });
  tbody.addEventListener("change", (e) => {
    const s = e.target.closest("[data-sit]");
    if (s) { DB.update("ocorrencias", s.dataset.sit, { situacao: s.value }); toast(`Situação alterada para "${s.value}".`, "info"); render(); }
  });
  if (btnNovaOco) btnNovaOco.onclick = () => formOco();
  fCat.onchange = render; fSit.onchange = render;
  render();
})();
