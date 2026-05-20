const plantillaUsuario = {
    id: null,
    nombre: "",
    email: "",
    telefono: "",
    fechaRegistro: ""
};

const usuariosInscritos = [];
const carrito = [];

let indiceActual = 0;
const TOTAL_SLIDES = 3;
let intervaloCarrusel = null;

function cambiarImagen(direccion) {
    const slides = document.querySelectorAll(".slide");
    const dots   = document.querySelectorAll(".dot");

    slides[indiceActual].classList.remove("active");
    dots[indiceActual].classList.remove("active");

    indiceActual = (indiceActual + direccion + TOTAL_SLIDES) % TOTAL_SLIDES;

    slides[indiceActual].classList.add("active");
    dots[indiceActual].classList.add("active");
}

function irASlide(indice) {
    const slides = document.querySelectorAll(".slide");
    const dots   = document.querySelectorAll(".dot");

    slides[indiceActual].classList.remove("active");
    dots[indiceActual].classList.remove("active");

    indiceActual = indice;

    slides[indiceActual].classList.add("active");
    dots[indiceActual].classList.add("active");
}

function iniciarCarruselAutomatico() {
    intervaloCarrusel = setInterval(() => cambiarImagen(1), 4000);
}

function detenerCarruselAutomatico() {
    clearInterval(intervaloCarrusel);
}

function validarEmail(email) {
    const trimmed = email.trim();
    if (trimmed.indexOf("@") < 8) return false;
    return /^[a-zA-Z0-9._%+\-]{8,}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(trimmed);
}

function validarPassword(password) {
    return password.length >= 8;
}

function validarCampoVacio(valor) {
    return valor.trim() !== "";
}

function validarTelefono(telefono) {
    if (telefono.trim() === "") return true;
    return /^[+]?[\d\s\-()]{7,15}$/.test(telefono.trim());
}

function validarDatos(campos) {
    let esValido = true;
    campos.forEach(campo => {
        const errorEl = document.getElementById(campo.idError);
        if (!campo.validacion(campo.valor)) {
            mostrarError(errorEl, campo.mensaje);
            esValido = false;
        } else {
            limpiarError(errorEl);
        }
    });
    return esValido;
}

function mostrarError(elemento, mensaje) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.style.display = "block";
    const input = elemento.previousElementSibling;
    if (input) input.setAttribute("aria-invalid", "true");
}

function limpiarError(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.style.display = "none";
    const input = elemento.previousElementSibling;
    if (input) input.removeAttribute("aria-invalid");
}

function mostrarMensaje(idContenedor, texto, tipo) {
    const el = document.getElementById(idContenedor);
    if (!el) return;
    el.textContent = texto;
    el.className = "form-msg form-msg--" + tipo;
    el.style.display = "block";
    setTimeout(() => {
        el.style.display = "none";
        el.textContent = "";
        el.className = "form-msg";
    }, 5000);
}

function actualizarDOM() {
    const lista   = document.getElementById("lista-inscritos");
    const wrapper = document.getElementById("lista-inscritos-wrapper");
    if (!lista || !wrapper) return;

    lista.innerHTML = "";

    if (usuariosInscritos.length === 0) {
        wrapper.style.display = "none";
        return;
    }

    wrapper.style.display = "block";

    usuariosInscritos.forEach(usuario => {
        const li = document.createElement("li");
        li.textContent = `#${usuario.id} — ${usuario.nombre} (${usuario.email})`;
        lista.appendChild(li);
    });
}

function registrarUsuario() {
    const nombre    = document.getElementById("reg-nombre").value;
    const email     = document.getElementById("reg-email").value;
    const password  = document.getElementById("reg-password").value;
    const confirm   = document.getElementById("reg-confirm").value;
    const telefono  = document.getElementById("reg-telefono").value;

    const reglas = [
        { valor: nombre,   idError: "error-reg-nombre",   mensaje: "El nombre no puede estar vacío.",              validacion: validarCampoVacio },
        { valor: email,    idError: "error-reg-email",    mensaje: "Ingresa un correo electrónico válido.",         validacion: validarEmail },
        { valor: password, idError: "error-reg-password", mensaje: "La contraseña debe tener al menos 8 caracteres.", validacion: validarPassword },
        { valor: confirm,  idError: "error-reg-confirm",  mensaje: "Las contraseñas no coinciden.",                 validacion: (val) => val === password },
        { valor: telefono, idError: "error-reg-telefono", mensaje: "Formato de teléfono inválido.",                 validacion: validarTelefono }
    ];

    if (!validarDatos(reglas)) return;

    const yaExiste = usuariosInscritos.some(u => u.email === email.trim().toLowerCase());
    if (yaExiste) {
        mostrarMensaje("msg-inscripcion", "Este correo ya está registrado.", "error");
        return;
    }

    const nuevoUsuario = {
        ...plantillaUsuario,
        id: usuariosInscritos.length + 1,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        password: password,
        fechaRegistro: new Date().toLocaleDateString("es-CL")
    };

    usuariosInscritos.push(nuevoUsuario);
    cerrarModalRegistro();

    const saludo      = document.getElementById("saludo-usuario");
    const btnLogin    = document.getElementById("btn-abrir-login");
    const btnRegistro = document.getElementById("btn-abrir-registro");

    if (saludo) {
        saludo.textContent = `👋 Bienvenido, ${nuevoUsuario.nombre}`;
        saludo.style.display = "inline-block";
    }
    if (btnLogin)    btnLogin.style.display    = "none";
    if (btnRegistro) btnRegistro.style.display = "none";

    mostrarNotificacion(`✅ ¡Cuenta creada! Bienvenido, ${nuevoUsuario.nombre}`);
}

function iniciarSesion() {
    const email    = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const reglas = [
        { valor: email,    idError: "error-login-email",    mensaje: "Ingresa un correo electrónico válido.", validacion: validarEmail },
        { valor: password, idError: "error-login-password", mensaje: "La contraseña no puede estar vacía.",  validacion: validarCampoVacio }
    ];

    if (!validarDatos(reglas)) return;

    const usuarioEncontrado = usuariosInscritos.find(
        u => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (usuarioEncontrado) {
        cerrarModalLogin();

        const saludo      = document.getElementById("saludo-usuario");
        const btnLogin    = document.getElementById("btn-abrir-login");
        const btnRegistro = document.getElementById("btn-abrir-registro");

        if (saludo) {
            saludo.textContent = `👋 Bienvenido, ${usuarioEncontrado.nombre}`;
            saludo.style.display = "inline-block";
        }
        if (btnLogin)    btnLogin.style.display    = "none";
        if (btnRegistro) btnRegistro.style.display = "none";
    } else {
        mostrarMensaje("msg-login", "Contraseña o correo incorrecto.", "error");
    }
}



function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio, cantidad: 1 });
    mostrarNotificacion(`🛒 "${nombre}" añadido al carrito — $${precio.toLocaleString("es-CL")}`);
}

function mostrarNotificacion(texto) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = texto;
    toast.classList.add("toast--visible");
    setTimeout(() => toast.classList.remove("toast--visible"), 3000);
}

function configurarModoOscuro() {
    const toggle = document.getElementById("dark-mode-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        toggle.textContent = document.body.classList.contains("dark-mode")
            ? "☀️ Modo Claro"
            : "🌙 Modo Oscuro";
    });
}

function abrirModalRegistro() {
    const overlay = document.getElementById("modal-registro-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
        const input = document.getElementById("reg-nombre");
        if (input) input.focus();
    }, 100);
}

function cerrarModalRegistro() {
    const overlay = document.getElementById("modal-registro-overlay");
    if (!overlay) return;
    overlay.style.display = "none";
    document.body.style.overflow = "";
    document.getElementById("form-inscripcion").reset();
    const msg = document.getElementById("msg-inscripcion");
    if (msg) { msg.style.display = "none"; msg.textContent = ""; }
    ["error-reg-nombre","error-reg-email","error-reg-password",
     "error-reg-confirm","error-reg-telefono"].forEach(id => {
        const el = document.getElementById(id);
        if (el) limpiarError(el);
    });
}

function cambiarARegistro() {
    cerrarModalLogin();
    abrirModalRegistro();
}

function cambiarALogin() {
    cerrarModalRegistro();
    abrirModalLogin();
}

function abrirModalLogin() {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
        const emailInput = document.getElementById("login-email");
        if (emailInput) emailInput.focus();
    }, 100);
}

function cerrarModalLogin() {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;
    overlay.style.display = "none";
    document.body.style.overflow = "";
    document.getElementById("form-login").reset();
    const msg = document.getElementById("msg-login");
    if (msg) { msg.style.display = "none"; msg.textContent = ""; }
    ["error-login-email", "error-login-password"].forEach(id => {
        const el = document.getElementById(id);
        if (el) limpiarError(el);
    });
}

function init() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    iniciarCarruselAutomatico();

    const carousel = document.getElementById("carousel");
    if (carousel) {
        carousel.addEventListener("mouseenter", detenerCarruselAutomatico);
        carousel.addEventListener("mouseleave", iniciarCarruselAutomatico);
    }

    configurarModoOscuro();

    const overlayReg = document.getElementById("modal-registro-overlay");
    if (overlayReg) {
        overlayReg.addEventListener("click", (e) => {
            if (e.target === overlayReg) cerrarModalRegistro();
        });
    }

    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) cerrarModalLogin();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { cerrarModalLogin(); cerrarModalRegistro(); }
        if (e.key === "ArrowLeft")  cambiarImagen(-1);
        if (e.key === "ArrowRight") cambiarImagen(1);
    });
}

document.addEventListener("DOMContentLoaded", init);