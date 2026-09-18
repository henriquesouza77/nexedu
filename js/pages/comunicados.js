/* Comunicados — mural filtrado por perfil; equipe pedagógica publica */
(async function () {
  const user = await App.init({ title: "Comunicados" });
  if (!user) return;

  const lista = document.getElementById("lista");
  const podePublicar = App.is("diretor", "coordenador", "professor");
  if (podePublicar) document.getElementById("btnNovoCom").hidden = false;

  function render() {
    const cs = Q.comunicadosPara(user);
    document.getElementById("comResumo").textContent = `${cs.length} comunicado(s)`;
    if (!cs.length) { lista.innerHTML = `<div class="card">${U.empty("Nenhum comunicado publicado.")}</div>`; return; }
    lista.innerHTML = cs.map((c) => `<div class="notice" style="padding:20px 22px">
      <div class="notice__head"><h3 style="font-size:17px">${U.esc(c.titulo)}</h3><div style="display:flex;gap:8px;align-items:center"><span class="badge badge-primary">${U.destinatarioLabel(c.destinatario)}</span>
        ${podePublicar ? `<button class="btn btn-secondary btn-icon" data-edit="${c.id}" title="Editar">${icon("edit")}</button><button class="btn btn-danger btn-icon" data-del="${c.id}" title="Excluir">${icon("trash")}</button>` : ""}</div></div>
      <p style="white-space:pre-line">${U.esc(c.mensagem)}</p>
      <div class="notice__meta"><span>${icon("calendar")} ${U.fmtDate(c.data)}</span><span>Publicado por <strong>${U.esc(Q.usuario(c.autorId)?.nome || "—")}</strong> (${PERFIS[Q.usuario(c.autorId)?.perfil]?.label || "—"})</span></div>
    </div>`).join("");
  }

  function formCom(c = null) {
    if (!podePublicar) return;
    const destinos = [["todos", "Todos"], ["professores", "Professores"], ["alunos", "Alunos"], ["responsaveis", "Responsáveis"], ...DB.get("turmas").map((t) => [t.id, `Turma ${t.nome}`])];
    Modal.open(c ? "Editar comunicado" : "Publicar comunicado", `
      <form id="formCom" novalidate>
        <div class="form-grid">
          <div class="field full"><label>Título <span class="req">*</span></label><input class="input" name="titulo" value="${U.esc(c?.titulo || "")}" placeholder="Ex.: Reunião de pais"><small class="hint"></small></div>
          <div class="field full"><label>Mensagem <span class="req">*</span></label><textarea class="textarea" name="mensagem" style="min-height:130px" placeholder="Escreva o comunicado...">${U.esc(c?.mensagem || "")}</textarea><small class="hint"></small></div>
          <div class="field"><label>Destinatário <span class="req">*</span></label><select class="select" name="destinatario">${destinos.map(([v, l]) => `<option value="${v}" ${(c?.destinatario || "todos") === v ? "selected" : ""}>${l}</option>`).join("")}</select><small class="hint"></small></div>
          <div class="field"><label>Data <span class="req">*</span></label><input class="input" type="date" name="data" value="${c?.data || U.today()}"><small class="hint"></small></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary" type="submit">${icon("megaphone")} ${c ? "Salvar" : "Publicar"}</button></div>
      </form>`);
    const form = document.getElementById("formCom");
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!Form.validate(form, { titulo: [Form.required(), Form.min(3)], mensagem: [Form.required(), Form.min(10)], destinatario: [Form.required()], data: [Form.required()] })) return;
      const dados = Form.data(form);
      if (c) { DB.update("comunicados", c.id, dados); toast("Comunicado atualizado!"); }
      else { DB.insert("comunicados", { ...dados, autorId: user.id }); toast("Comunicado publicado!"); }
      Modal.close(); render();
    };
  }

  lista.addEventListener("click", (e) => {
    if (!podePublicar) return;
    const ed = e.target.closest("[data-edit]"); const del = e.target.closest("[data-del]");
    if (ed) formCom(DB.find("comunicados", ed.dataset.edit));
    if (del) Modal.confirm("Excluir comunicado", "Deseja excluir este comunicado?", () => { DB.remove("comunicados", del.dataset.del); toast("Comunicado excluído."); render(); });
  });
  document.getElementById("btnNovoCom").onclick = () => { if (podePublicar) formCom(); };
  render();
})();
