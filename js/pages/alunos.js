/* Lista de alunos — pesquisa, filtros, visualizar, editar e excluir */
(async function () {
  const user = await App.init({ title: "Alunos", roles: ["diretor", "coordenador", "professor"] });
  if (!user) return;

  const podeEditar = App.is("diretor");
  if (podeEditar) document.getElementById("btnNovo").hidden = false;

  const tbody = document.getElementById("tbody");
  const busca = document.getElementById("busca");
  const fTurma = document.getElementById("fTurma");
  const fSituacao = document.getElementById("fSituacao");
  const alunos = (await Api.request("alunos.php")).data;
  const turmas = (await Api.request("turmas.php")).data;

  // Professor vê apenas alunos das suas turmas
  const turmasVisiveis = turmas;
  fTurma.innerHTML += U.options(turmasVisiveis, "", (t) => t.nome);
  const q = U.qs("turma"); if (q) fTurma.value = q;

  if (App.is("diretor")) {
    const toolbar = document.querySelector(".toolbar");
    const btn = document.createElement("button"); btn.className = "btn btn-secondary"; btn.type = "button"; btn.textContent = "Novo funcionário";
    toolbar.appendChild(btn); btn.onclick = () => Modal.open("Novo funcionário", `<form id="formFuncionario"><div class="form-grid">
      <div class="field full"><label>Nome completo *</label><input class="input" name="nome"><small class="hint"></small></div>
      <div class="field"><label>E-mail *</label><input class="input" type="email" name="email"><small class="hint"></small></div>
      <div class="field"><label>Senha *</label><input class="input" type="password" name="senha" minlength="6"><small class="hint"></small></div>
      <div class="field full"><label>Cargo *</label><select class="select" name="perfil"><option value="coordenador">Coordenador</option><option value="professor">Professor</option><option value="responsavel">Responsável de aluno</option><option value="diretor">Diretor</option></select><small class="hint"></small></div>
    </div><div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary">Cadastrar funcionário</button></div></form>`);
    document.getElementById("formFuncionario").onsubmit = async (e) => { e.preventDefault(); const form = e.target;
      if (!Form.validate(form, { nome: [Form.required(), Form.min(3)], email: [Form.required(), Form.email()], senha: [Form.required(), Form.min(6)] })) return;
      try { await Api.request("funcionarios.php", { method: "POST", body: JSON.stringify(Form.data(form)) }); Modal.close(); toast("Funcionário cadastrado."); } catch (error) { toast(error.message, "error"); }
    };
  }

  document.getElementById("btnNovo").onclick = () => Modal.open("Novo aluno / usuário", `<form id="formNovoAluno"><div class="form-grid">
    <div class="field full"><label>Nome completo *</label><input class="input" name="nome"><small class="hint"></small></div>
    <div class="field"><label>Matrícula *</label><input class="input" name="matricula"><small class="hint"></small></div>
    <div class="field"><label>Nascimento *</label><input class="input" type="date" name="nascimento"><small class="hint"></small></div>
    <div class="field"><label>E-mail de acesso *</label><input class="input" type="email" name="email"><small class="hint"></small></div>
    <div class="field"><label>Senha inicial</label><input class="input" name="senha" value="123456"><small class="hint"></small></div>
    <div class="field"><label>Turma *</label><select class="select" name="turma_id">${U.options(turmas, "", (t) => t.nome, "Selecione")}</select><small class="hint"></small></div>
    <div class="field"><label>Telefone *</label><input class="input" name="telefone"><small class="hint"></small></div>
    <div class="field"><label>Responsável *</label><input class="input" name="responsavel"><small class="hint"></small></div>
    <div class="field"><label>Telefone responsável *</label><input class="input" name="tel_responsavel"><small class="hint"></small></div>
    <input type="hidden" name="situacao" value="Ativo">
  </div><div class="form-actions"><button type="button" class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-primary">Cadastrar aluno</button></div></form>`);
  document.getElementById("formNovoAluno").onsubmit = async (e) => { e.preventDefault(); const form = e.target;
    if (!Form.validate(form, { nome: [Form.required(), Form.min(3)], matricula: [Form.required()], nascimento: [Form.required()], email: [Form.required(), Form.email()], turma_id: [Form.required()], responsavel: [Form.required()], tel_responsavel: [Form.required()] })) return;
    try { await Api.request("alunos.php", { method: "POST", body: JSON.stringify(Form.data(form)) }); Modal.close(); toast("Aluno e usuário cadastrados."); window.location.reload(); } catch (error) { toast(error.message, "error"); }
  };

  function filtrar() {
    const termo = busca.value.trim().toLowerCase();
    const idsTurmas = new Set(turmasVisiveis.map((t) => t.id));
    return alunos.filter((a) =>
      idsTurmas.has(String(a.turma_id)) &&
      (!fTurma.value || String(a.turma_id) === fTurma.value) &&
      (!fSituacao.value || a.situacao === fSituacao.value) &&
      (!termo || a.nome.toLowerCase().includes(termo) || a.matricula.includes(termo))
    ).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  function render() {
    const lista = filtrar();
    document.getElementById("resumo").textContent = `${lista.length} aluno(s) encontrado(s)`;
    if (!lista.length) { tbody.innerHTML = `<tr><td colspan="8">${U.empty("Nenhum aluno encontrado com os filtros atuais.")}</td></tr>`; return; }
    tbody.innerHTML = lista.map((a) => {
      const f = { pct: 100 }; const m = null;
      return `<tr>
        <td class="muted">${a.matricula}</td>
        <td><div class="avatar-name"><div class="av">${U.initials(a.nome)}</div><div><strong>${U.esc(a.nome)}</strong><small>${U.esc(a.email)}</small></div></div></td>
        <td><span class="badge">${U.esc(a.turma_nome || "—")}</span></td>
        <td class="muted">${U.esc(a.curso)}</td>
        <td><div style="display:flex;align-items:center;gap:8px"><div class="progress ${U.corFreq(f.pct)}" style="width:70px"><span style="width:${f.pct}%"></span></div><span>${f.pct}%</span></div></td>
        <td class="${U.corMedia(m)}">${U.nota(m)}</td>
        <td>${U.badgeSituacao(a.situacao)}</td>
        <td class="actions">
          <button class="btn btn-secondary btn-icon" data-view="${a.id}" title="Visualizar">${icon("eye")}</button>
          ${podeEditar ? `<a class="btn btn-secondary btn-icon" href="aluno-cadastro.html?id=${a.id}" title="Editar">${icon("edit")}</a>
          <button class="btn btn-danger btn-icon" data-del="${a.id}" title="Excluir">${icon("trash")}</button>` : ""}
        </td></tr>`;
    }).join("");
  }

  tbody.addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]"); const d = e.target.closest("[data-del]");
    if (v) verAluno(v.dataset.view);
    if (d) {
      const a = alunos.find((item) => String(item.id) === d.dataset.del);
      Modal.confirm("Excluir aluno", `Deseja realmente excluir <strong>${U.esc(a.nome)}</strong>? Esta ação não pode ser desfeita.`, () => {
        Api.request(`alunos.php?id=${a.id}`, { method: "DELETE" }).then(() => { toast("Aluno excluído com sucesso."); window.location.reload(); }).catch((error) => toast(error.message, "error"));
      });
    }
  });

  function verAluno(id) {
    const a = Q.aluno(id); const f = Q.frequencia(id); const m = Q.mediaGeral(id); const sit = Q.situacaoAcademica(id);
    const notas = Q.notasDoAluno(id);
    Modal.open(`Ficha do aluno`, `
      <div class="avatar-name" style="margin-bottom:20px"><div class="av" style="width:52px;height:52px;font-size:18px">${U.initials(a.nome)}</div><div><strong style="font-size:18px">${U.esc(a.nome)}</strong><small>Matrícula ${a.matricula} · ${Q.turma(a.turmaId)?.nome || "—"}</small></div><div style="flex:1"></div>${U.badgeSituacao(a.situacao)}</div>
      <div class="kv">
        <div><small>Curso</small><span>${U.esc(a.curso)}</span></div>
        <div><small>Período</small><span>${a.periodo}</span></div>
        <div><small>Nascimento</small><span>${U.fmtDate(a.nascimento)}</span></div>
        <div><small>E-mail</small><span>${U.esc(a.email)}</span></div>
        <div><small>Telefone</small><span>${U.esc(a.telefone || "—")}</span></div>
        <div><small>Responsável</small><span>${U.esc(a.responsavel)} · ${U.esc(a.telResponsavel)}</span></div>
      </div>
      <div class="grid grid-3" style="margin-top:20px;gap:12px">
        <div class="stat"><div><div class="stat__value">${f.pct}%</div><div class="stat__label">Frequência</div></div></div>
        <div class="stat"><div><div class="stat__value">${f.faltas}</div><div class="stat__label">Faltas</div></div></div>
        <div class="stat"><div><div class="stat__value">${U.nota(m)}</div><div class="stat__label">Média geral</div></div></div>
      </div>
      <p style="margin-top:16px"><span class="muted">Situação acadêmica:</span> <span class="badge badge-${sit.tipo}">${sit.label}</span></p>
      <div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Disciplina</th><th class="t-center">Ativ. 1</th><th class="t-center">Ativ. 2</th><th class="t-center">Avaliação</th><th class="t-center">Média</th></tr></thead>
        <tbody>${notas.map((n) => `<tr><td>${Q.disciplina(n.disciplinaId)?.nome}</td><td class="t-center">${U.nota(n.atividade1)}</td><td class="t-center">${U.nota(n.atividade2)}</td><td class="t-center">${U.nota(n.avaliacao)}</td><td class="t-center ${U.corMedia(Q.media(n))}">${U.nota(Q.media(n))}</td></tr>`).join("") || `<tr><td colspan="5" class="muted t-center">Sem notas lançadas.</td></tr>`}</tbody></table></div>`);
  }

  [busca, fTurma, fSituacao].forEach((el) => el.addEventListener("input", render));
  render();
})();
