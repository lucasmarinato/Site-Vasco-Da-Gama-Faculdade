"use strict";

/* ===== Modo noturno ===== */
const raiz = document.documentElement;
const temaBtn = document.getElementById("tema-btn");
const temaIcone = temaBtn.querySelector(".tema-btn__icone");

function aplicarTema(tema) {
    raiz.setAttribute("data-tema", tema);
    const escuro = tema === "escuro";
    temaIcone.textContent = escuro ? "☀️" : "🌙";
    temaBtn.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo noturno");
}

aplicarTema(raiz.getAttribute("data-tema") || "claro");

temaBtn.addEventListener("click", () => {
    const novo = raiz.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
    aplicarTema(novo);
    try { localStorage.setItem("tema", novo); } catch (e) { /* armazenamento indisponível */ }
});

/* ===== Menu mobile ===== */
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

function alternarMenu(abrir) {
    menu.classList.toggle("aberto", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}

menuBtn.addEventListener("click", () => {
    alternarMenu(!menu.classList.contains("aberto"));
});

menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) alternarMenu(false);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") alternarMenu(false);
});

/* ===== Link ativo conforme a rolagem ===== */
const links = menu.querySelectorAll("a");
const secoes = [...links]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                links.forEach((a) =>
                    a.classList.toggle("ativo", a.getAttribute("href") === "#" + entrada.target.id));
            }
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    secoes.forEach((s) => observador.observe(s));
}

/* ===== Botão voltar ao topo ===== */
const topoBtn = document.getElementById("topo-btn");

window.addEventListener("scroll", () => {
    topoBtn.hidden = window.scrollY < 600;
}, { passive: true });

topoBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== Formulário ===== */
const form = document.getElementById("form-contato");
const status = document.getElementById("form-status");
const mensagem = document.getElementById("mensagem");
const contador = document.getElementById("contador");
const telefone = document.getElementById("telefone");

// Contador de caracteres
mensagem.addEventListener("input", () => {
    contador.textContent = `${mensagem.value.length} / ${mensagem.maxLength}`;
});

// Máscara de telefone: (99) 99999-9999
telefone.addEventListener("input", () => {
    const d = telefone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 6) {
        const meio = d.length > 10 ? 7 : 6;
        v = `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
    } else if (d.length > 2) {
        v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length > 0) {
        v = `(${d}`;
    }
    telefone.value = v;
});

function mostrarErro(campo, texto) {
    const alvo = form.querySelector(`[data-erro-para="${campo.name}"]`);
    if (alvo) alvo.textContent = texto;
    campo.classList.toggle("invalido", Boolean(texto));
    campo.setAttribute("aria-invalid", texto ? "true" : "false");
}

function validar() {
    let primeiroInvalido = null;
    const marcar = (campo, texto) => {
        mostrarErro(campo, texto);
        if (texto && !primeiroInvalido) primeiroInvalido = campo;
    };

    const nome = form.nome;
    marcar(nome, nome.value.trim().length < 3 ? "Informe seu nome completo." : "");

    const email = form.email;
    marcar(email, email.validity.valid && email.value.trim() ? "" : "Informe um e-mail válido.");

    const digitos = form.telefone.value.replace(/\D/g, "");
    marcar(form.telefone,
        digitos && digitos.length < 10 ? "Telefone incompleto." : "");

    marcar(form.mensagem,
        form.mensagem.value.trim().length < 10 ? "Escreva pelo menos 10 caracteres." : "");

    marcar(form.aceito, form.aceito.checked ? "" : "É preciso aceitar os termos de uso.");

    if (primeiroInvalido) primeiroInvalido.focus();
    return !primeiroInvalido;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";

    if (!validar()) return;

    // Aqui você enviaria os dados para um servidor (fetch/POST).
    const primeiroNome = form.nome.value.trim().split(" ")[0];
    form.reset(); // o evento "reset" limpa o status, então a mensagem vem depois
    status.textContent = `Obrigado, ${primeiroNome}! Sua mensagem foi enviada com sucesso.`;
});

form.addEventListener("reset", () => {
    status.textContent = "";
    contador.textContent = `0 / ${mensagem.maxLength}`;
    form.querySelectorAll(".erro").forEach((el) => (el.textContent = ""));
    form.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
});

// Remove o erro assim que o usuário corrige o campo
form.addEventListener("input", (e) => {
    if (e.target.classList.contains("invalido")) mostrarErro(e.target, "");
});
form.addEventListener("change", (e) => {
    if (e.target.name === "aceito" && e.target.checked) mostrarErro(e.target, "");
});
