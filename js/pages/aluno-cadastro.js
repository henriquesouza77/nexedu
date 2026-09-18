/* Cadastro / edição de aluno — com validação de formulário */
(async function () {
  const user = await App.init({ title: "Cadastro de aluno", roles: ["diretor"] });
  if (!user) return;

  const form = document.getElementById("formAluno");
  const selTurma = form.elements.turmaId;
  const turmas = (await Api.request("turmas.php")).data;
  selTurma.innerHTML = U.options(turmas, "", (t) => `${t.nome} — ${t.curso}`, "Selecione a turma");

  // Preenche curso e período automaticamente a partir da turma
  selTurma.addEventListener("change", () => {
    const t = turmas.find((item) => String(item.id) === selTurma.value);
    if (t) { form.elements.curso.value = t.curso; form.elements.periodo.value = t.periodo; }
  });

  // Máscara simples de telefone
  ["telefone", "telResponsavel"].forEach((n) => form.elements[n].addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    e.target.value = v;
  }));

  // Modo edição
  const id = U.qs("id");
  let editando = null;
  if (id) editando = (await Api.request("alunos.php")).data.find((aluno) => String(aluno.id) === id) || null;
  if (id && !editando) { toast("Aluno não encontrado.", "error"); setTimeout(() => (window.location.href = "alunos.html"), 800); return; }
  if (editando) {
    document.getElementById("formTitle").textContent = "Editar aluno";
    document.getElementById("btnSalvar").textContent = "Salvar alterações";
    document.title = "Editar aluno · NexEdu";
    Object.keys(editando).forEach((k) => { if (form.elements[k]) form.elements[k].value = editando[k]; });
  } else {
    // Sugere a próxima matrícula
    form.elements.matricula.value = "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = Form.validate(form, {
      nome: [Form.required("Informe o nome completo."), Form.min(3), { test: (v) => v.split(" ").filter(Boolean).length >= 2, msg: "Informe nome e sobrenome." }],
      matricula: [Form.required("Informe a matrícula."), { test: (v) => /^\d{4,}$/.test(v), msg: "A matrícula deve ter apenas números (mín. 4)." },
        { test: () => true, msg: "" }],
      nascimento: [Form.required("Informe a data de nascimento."), { test: (v) => v < U.today(), msg: "A data deve ser anterior a hoje." }],
      email: [Form.required("Informe o e-mail."), Form.email()],
      turmaId: [Form.required("Selecione a turma.")],
      curso: [Form.required("Informe o curso.")],
      periodo: [Form.required("Selecione o período.")],
      situacao: [Form.required()],
      responsavel: [Form.required("Informe o nome do responsável.")],
      telResponsavel: [Form.required("Informe o telefone do responsável."), { test: (v) => v.replace(/\D/g, "").length >= 10, msg: "Telefone incompleto." }],
    });
    if (!ok) { toast("Verifique os campos destacados.", "error"); return; }

    const dados = Form.data(form);
    const payload = {
      ...dados,
      turma_id: Number(dados.turmaId),
      tel_responsavel: dados.telResponsavel,
    };
    delete payload.turmaId;
    delete payload.telResponsavel;
    try {
      await Api.request(editando ? `alunos.php?id=${id}` : "alunos.php", { method: editando ? "PUT" : "POST", body: JSON.stringify(payload) });
      toast(editando ? "Dados do aluno atualizados!" : "Aluno cadastrado com sucesso!");
      setTimeout(() => (window.location.href = "alunos.html?turma=" + dados.turmaId), 600);
    } catch (error) {
      toast(error.message, "error");
    }
  });
})();
