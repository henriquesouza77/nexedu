/* Página de login — autenticação feita pela API PHP */
(function () {
  Auth.user().then((logged) => {
    if (logged) window.location.href = "pages/" + PERFIS[logged.perfil].dashboard;
  });

  document.getElementById("features").innerHTML = [
    ["book", "Diário de classe"], ["checkCircle", "Controle de frequência"],
    ["star", "Notas e médias"], ["megaphone", "Comunicados"],
  ].map(([i, t]) => `<div>${icon(i)}${t}</div>`).join("");

  // Mostrar/ocultar senha
  const pw = document.getElementById("senha");
  const toggle = document.getElementById("togglePw");
  toggle.innerHTML = icon("eye");
  toggle.onclick = () => {
    const show = pw.type === "password";
    pw.type = show ? "text" : "password";
    toggle.innerHTML = icon(show ? "eyeOff" : "eye");
  };

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (e) => { e.preventDefault(); entrar(); });

  async function entrar() {
    const ok = Form.validate(form, {
      email: [Form.required("Informe seu e-mail."), Form.email()],
      senha: [Form.required("Informe sua senha."), Form.min(6)],
    });
    if (!ok) return;
    const { email, senha } = Form.data(form);
    try {
      const user = await Auth.login(email, senha);
      toast(`Bem-vindo(a), ${user.nome.split(" ")[0]}!`);
      setTimeout(() => { window.location.href = "pages/" + PERFIS[user.perfil].dashboard; }, 350);
    } catch (error) {
      form.elements.senha.classList.add("error");
      form.elements.senha.closest(".field").querySelector(".hint").textContent = error.message;
      toast(error.message, "error");
    }
  }
})();
