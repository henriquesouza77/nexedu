/* ============================================================
   NexEdu — Núcleo da aplicação
   (autenticação simulada, layout, permissões e utilitários)
   ============================================================ */

const API_BASE = window.location.pathname.includes("/pages/") ? "../backend" : "backend";

/* ---------- Ícones (SVG inline, estilo Lucide) ---------- */
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  trendDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  userX: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;

/* ---------- Perfis ---------- */
const PERFIS = {
  diretor: { label: "Diretor", dashboard: "dashboard-diretor.html", icon: "briefcase" },
  coordenador: { label: "Coordenador", dashboard: "dashboard-coordenador.html", icon: "shield" },
  professor: { label: "Professor", dashboard: "dashboard-professor.html", icon: "book" },
  aluno: { label: "Aluno", dashboard: "dashboard-aluno.html", icon: "graduation" },
  responsavel: { label: "Responsável", dashboard: "dashboard-responsavel.html", icon: "heart" },
};

const MENU = {
  diretor: [
    ["Visão geral", "dashboard-diretor.html", "home"],
    ["Alunos", "alunos.html", "users"],
    ["Turmas", "turmas.html", "layers"],
    ["Frequência", "frequencia.html", "checkCircle"],
    ["Notas", "notas.html", "star"],
    ["Ocorrências", "ocorrencias.html", "alert"],
    ["Comunicados", "comunicados.html", "megaphone"],
  ],
  coordenador: [
    ["Painel", "dashboard-coordenador.html", "home"],
    ["Alunos", "alunos.html", "users"],
    ["Turmas", "turmas.html", "layers"],
    ["Frequência", "frequencia.html", "checkCircle"],
    ["Notas", "notas.html", "star"],
    ["Atividades", "atividades.html", "clipboard"],
    ["Ocorrências", "ocorrencias.html", "alert"],
    ["Comunicados", "comunicados.html", "megaphone"],
  ],
  professor: [
    ["Painel", "dashboard-professor.html", "home"],
    ["Minhas turmas", "turmas.html", "layers"],
    ["Diário de classe", "diario.html", "book"],
    ["Frequência", "frequencia.html", "checkCircle"],
    ["Notas", "notas.html", "star"],
    ["Atividades", "atividades.html", "clipboard"],
    ["Ocorrências", "ocorrencias.html", "alert"],
    ["Comunicados", "comunicados.html", "megaphone"],
  ],
  aluno: [
    ["Meu portal", "dashboard-aluno.html", "home"],
    ["Frequência", "frequencia.html", "checkCircle"],
    ["Notas", "notas.html", "star"],
    ["Atividades", "atividades.html", "clipboard"],
    ["Comunicados", "comunicados.html", "megaphone"],
  ],
  responsavel: [
    ["Acompanhamento", "dashboard-responsavel.html", "home"],
    ["Frequência", "frequencia.html", "checkCircle"],
    ["Notas", "notas.html", "star"],
    ["Atividades", "atividades.html", "clipboard"],
    ["Comunicados", "comunicados.html", "megaphone"],
  ],
};

/* ---------- API e autenticação ---------- */
const Api = {
  async request(path, options = {}) {
    const response = await fetch(`${API_BASE}/${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    let body = null;
    try { body = await response.json(); } catch (e) { /* resposta sem JSON */ }
    if (!response.ok) throw new Error(body?.error || "Não foi possível concluir a operação.");
    return body;
  },
};

const Auth = {
  async login(email, senha) {
    const result = await Api.request("login.php", { method: "POST", body: JSON.stringify({ email, senha }) });
    return normalizeUser(result.user);
  },
  async logout() {
    try { await Api.request("logout.php", { method: "POST" }); } catch (e) { /* continua para limpar a tela */ }
    window.location.href = App.root() + "index.html";
  },
  async user() {
    try { return normalizeUser((await Api.request("me.php")).user); } catch (e) { return null; }
  },
};

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, alunoId: user.aluno_id ?? user.alunoId ?? null };
}

/* ---------- Utilitários ---------- */
const U = {
  fmtDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  },
  today() { return new Date().toISOString().slice(0, 10); },
  longDate() {
    return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  },
  initials(nome) { return nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join(""); },
  nota(v) { return v === null || v === undefined || v === "" ? "—" : Number(v).toFixed(1).replace(".", ","); },
  esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  badgeSituacao(s) {
    const map = { Ativo: "success", Inativo: "", Transferido: "warning", Concluído: "info" };
    return `<span class="badge badge-${map[s] || ""}">${U.esc(s)}</span>`;
  },
  badgeStatus(s) {
    const map = { Disponível: "info", "Em andamento": "warning", Encerrada: "", Aberta: "danger", "Em análise": "warning", Resolvida: "success" };
    return `<span class="badge badge-${map[s] || ""}">${U.esc(s)}</span>`;
  },
  corFreq(pct) { return pct >= 85 ? "green" : pct >= 75 ? "amber" : "red"; },
  corMedia(m) { return m === null ? "" : m >= 7 ? "text-success fw-700" : m >= 6 ? "fw-700" : "text-danger fw-700"; },
  presencaLabel(p) { return { P: "Presente", F: "Falta", FJ: "Falta justificada" }[p] || "—"; },
  presencaBadge(p) { return { P: '<span class="badge badge-success">Presente</span>', F: '<span class="badge badge-danger">Falta</span>', FJ: '<span class="badge badge-warning">Justificada</span>' }[p] || "—"; },
  destinatarioLabel(d) {
    const fixo = { todos: "Todos", professores: "Professores", alunos: "Alunos", responsaveis: "Responsáveis" };
    if (fixo[d]) return fixo[d];
    const t = Q.turma(d); return t ? `Turma ${t.nome}` : d;
  },
  qs(name) { return new URLSearchParams(window.location.search).get(name); },
  empty(msg = "Nenhum registro encontrado.") { return `<div class="empty">${icon("inbox")}<p>${msg}</p></div>`; },
  options(list, value, labelFn = (x) => x.nome, placeholder = null) {
    let html = placeholder ? `<option value="">${placeholder}</option>` : "";
    list.forEach((x) => { html += `<option value="${x.id}" ${x.id === value ? "selected" : ""}>${U.esc(labelFn(x))}</option>`; });
    return html;
  },
};

/* ---------- Toast ---------- */
function toast(msg, type = "success") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = icon(type === "success" ? "checkCircle" : type === "error" ? "alert" : "info") + `<span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---------- Modal ---------- */
const Modal = {
  open(title, bodyHtml, { small = false } = {}) {
    this.close();
    const bd = document.createElement("div");
    bd.className = "modal-backdrop open";
    bd.innerHTML = `<div class="modal ${small ? "modal--sm" : ""}" role="dialog" aria-modal="true">
      <div class="modal__header"><h3>${title}</h3><button class="btn btn-ghost btn-icon" data-close aria-label="Fechar">${icon("x")}</button></div>
      <div class="modal__body">${bodyHtml}</div></div>`;
    bd.addEventListener("click", (e) => { if (e.target === bd || e.target.closest("[data-close]")) Modal.close(); });
    document.body.appendChild(bd);
    document.addEventListener("keydown", Modal._esc);
    return bd;
  },
  close() { document.querySelectorAll(".modal-backdrop").forEach((m) => m.remove()); document.removeEventListener("keydown", Modal._esc); },
  _esc(e) { if (e.key === "Escape") Modal.close(); },
  confirm(title, msg, onOk, okLabel = "Excluir") {
    this.open(title, `<p style="color:var(--text-2)">${msg}</p>
      <div class="form-actions" style="margin-top:20px"><button class="btn btn-secondary" data-close>Cancelar</button><button class="btn btn-danger" id="modalOk">${okLabel}</button></div>`, { small: true });
    document.getElementById("modalOk").onclick = () => { Modal.close(); onOk(); };
  },
};

/* ---------- Validação de formulários ---------- */
const Form = {
  /** rules: { campo: [{ test: fn(value, form) => bool, msg }] } */
  validate(form, rules) {
    let ok = true;
    form.querySelectorAll(".hint").forEach((h) => (h.textContent = ""));
    form.querySelectorAll(".error").forEach((e) => e.classList.remove("error"));
    Object.entries(rules).forEach(([name, checks]) => {
      const input = form.elements[name];
      if (!input) return;
      const value = input.value.trim();
      for (const c of checks) {
        if (!c.test(value, form)) {
          ok = false;
          input.classList.add("error");
          const hint = input.closest(".field")?.querySelector(".hint");
          if (hint) hint.textContent = c.msg;
          break;
        }
      }
    });
    if (!ok) form.querySelector(".error")?.focus();
    return ok;
  },
  required: (msg = "Campo obrigatório.") => ({ test: (v) => v.length > 0, msg }),
  email: () => ({ test: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Informe um e-mail válido." }),
  min: (n) => ({ test: (v) => !v || v.length >= n, msg: `Mínimo de ${n} caracteres.` }),
  numberRange: (a, b) => ({ test: (v) => !v || (!isNaN(Number(v)) && Number(v) >= a && Number(v) <= b), msg: `Informe um valor entre ${a} e ${b}.` }),
  data(form) { return Object.fromEntries(new FormData(form).entries()); },
};

/* ---------- App / Layout ---------- */
const App = {
  user: null,
  root() { return window.location.pathname.includes("/pages/") ? "../" : "./"; },
  pagesRoot() { return window.location.pathname.includes("/pages/") ? "./" : "./pages/"; },

  /** Inicializa uma página protegida. roles: perfis autorizados (vazio = todos). */
  async init({ title, roles = [] }) {
    const user = await Auth.user();
    if (!user) { window.location.href = this.root() + "index.html"; return null; }
    if (roles.length && !roles.includes(user.perfil)) {
      window.location.href = PERFIS[user.perfil].dashboard; return null;
    }
    this.user = user;
    await DB.hydrate();
    document.title = `${title} · NexEdu`;
    this.renderLayout(title);
    return user;
  },

  renderLayout(title) {
    const u = this.user;
    const page = window.location.pathname.split("/").pop();
    const nav = MENU[u.perfil].map(([label, href, ic]) =>
      `<a class="nav-item ${page === href ? "active" : ""}" href="${href}">${icon(ic)}<span>${label}</span></a>`).join("");

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
      <div class="sidebar__brand">
        <img class="brand-mark brand-mark--small" src="../assets/img/logo-teal.svg" alt="NexEdu">
        <strong>Nex<span>Edu</span></strong>
      </div>
      <nav class="sidebar__nav"><div class="sidebar__label">Menu</div>${nav}</nav>
      <div class="sidebar__footer">
        <div class="user-chip">
          <div class="user-chip__avatar">${U.initials(u.nome)}</div>
          <div class="user-chip__info"><strong>${U.esc(u.nome)}</strong><small>${PERFIS[u.perfil].label}</small></div>
          <button class="btn btn-ghost btn-icon" id="btnLogout" title="Sair">${icon("logout")}</button>
        </div>
      </div>`;
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.onclick = () => document.body.classList.remove("nav-open");

    const app = document.getElementById("app");
    app.prepend(overlay);
    app.prepend(sidebar);

    const main = document.querySelector(".main");
    const footer = document.createElement("footer");
    footer.className = "app-footer";
    footer.innerHTML = `
      <div class="app-footer__brand">
        <img class="brand-mark brand-mark--small" src="../assets/img/logo-teal.svg" alt="Logo NexEdu">
        <span>NexEdu</span>
      </div>
      <p>© 2026 NexEdu · Gestão escolar inteligente</p>
    `;
    if (main && !main.querySelector(".app-footer")) main.appendChild(footer);

    const topbar = document.getElementById("topbar");
    topbar.innerHTML = `
      <button class="btn btn-ghost btn-icon menu-btn" id="btnMenu" aria-label="Abrir menu">${icon("menu")}</button>
      <h1>${title}</h1>
      <span class="date">${U.longDate()}</span>`;
    document.getElementById("btnMenu").onclick = () => document.body.classList.toggle("nav-open");
    document.getElementById("btnLogout").onclick = () => Auth.logout();
  },

  /** Aluno "em foco" para perfis aluno/responsável */
  alunoDoUsuario() { return this.user?.alunoId ? Q.aluno(this.user.alunoId) : null; },
  is(...perfis) { return perfis.includes(this.user?.perfil); },
};
