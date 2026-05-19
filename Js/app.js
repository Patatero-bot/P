/**
 * app.js — Tienda Digimon TCG
 * Criterios cubiertos: 2.1.1 (DOM/carrusel), 2.1.2 (formularios/validación),
 * 2.1.3 y 2.1.4 (estructuras de datos, funciones modulares)
 */

/* ============================================================
   ESTRUCTURAS DE DATOS (Criterio 2.1.3)
   ============================================================ */

/**
 * Objeto que representa la estructura de un usuario registrado.
 * Se usa como "plantilla" para crear nuevas instancias.
 */
const plantillaUsuario = {
    id: null,
    nombre: "",
    email: "",
    telefono: "",
    fechaRegistro: ""
};

/**
 * Arreglo global que almacena los usuarios inscritos en la sesión.
 * Funciona como base de datos en memoria.
 */
const usuariosInscritos = [];

/**
 * Arreglo del carrito de compras. Cada elemento es un objeto { nombre, precio }.
 */
const carrito = [];

/* ============================================================
   VARIABLES GLOBALES DEL CARRUSEL
   ============================================================ */

/** Índice de la imagen actualmente visible */
let indiceActual = 0;

/** Total de slides disponibles */
const TOTAL_SLIDES = 3;

/** ID del intervalo automático del carrusel */
let intervaloCarrusel = null;

/* ============================================================
   CARRUSEL DE IMÁGENES (Criterio 2.1.1)
   ============================================================ */

/**
 * cambiarImagen(direccion)
 * Modifica el DOM para mostrar la imagen anterior (-1) o siguiente (+1).
 * @param {number} direccion — -1 para anterior, +1 para siguiente
 */
function cambiarImagen(direccion) {
    const slides = document.querySelectorAll(".slide");
    const dots   = document.querySelectorAll(".dot");

    // Ocultar slide actual
    slides[indiceActual].classList.remove("active");
    dots[indiceActual].classList.remove("active");

    // Calcular nuevo índice con wrap-around circular
    indiceActual = (indiceActual + direccion + TOTAL_SLIDES) % TOTAL_SLIDES;

    // Mostrar nuevo slide
    slides[indiceActual].classList.add("active");
    dots[indiceActual].classList.add("active");
}

/**
 * irASlide(indice)
 * Navega directamente a un slide específico al hacer clic en un dot.
 * @param {number} indice — índice destino (0, 1, 2...)
 */
function irASlide(indice) {
    const slides = document.querySelectorAll(".slide");
    const dots   = document.querySelectorAll(".dot");

    slides[indiceActual].classList.remove("active");
    dots[indiceActual].classList.remove("active");

    indiceActual = indice;

    slides[indiceActual].classList.add("active");
    dots[indiceActual].classList.add("active");
}

/**
 * iniciarCarruselAutomatico()
 * Avanza el carrusel automáticamente cada 4 segundos.
 */
function iniciarCarruselAutomatico() {
    intervaloCarrusel = setInterval(() => {
        cambiarImagen(1);
    }, 4000);
}

/**
 * detenerCarruselAutomatico()
 * Pausa el avance automático (se activa al pasar el mouse).
 */
function detenerCarruselAutomatico() {
    clearInterval(intervaloCarrusel);
}

/* ============================================================
   VALIDACIONES (Criterio 2.1.2)
   ============================================================ */

/**
 * validarEmail(email)
 * Comprueba que el correo tenga formato válido usando expresión regular.
 * Recomendación de seguridad: nunca confiar solo en validación de cliente;
 * siempre validar también en el servidor.
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
    // Regex estándar para validación de email (RFC 5322 simplificado)
    const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
}

/**
 * validarPassword(password)
 * Verifica que la contraseña tenga al menos 8 caracteres.
 * Recomendación de seguridad: usar mínimo 8 caracteres, idealmente con
 * combinación de letras, números y símbolos.
 * @param {string} password
 * @returns {boolean}
 */
function validarPassword(password) {
    return password.length >= 8;
}

/**
 * validarCampoVacio(valor)
 * Verifica que un campo no esté vacío ni contenga solo espacios.
 * @param {string} valor
 * @returns {boolean}
 */
function validarCampoVacio(valor) {
    return valor.trim() !== "";
}

/**
 * validarTelefono(telefono)
 * Si se ingresa un teléfono, valida que tenga formato chileno u internacional.
 * Campo opcional: si está vacío, retorna true.
 * @param {string} telefono
 * @returns {boolean}
 */
function validarTelefono(telefono) {
    if (telefono.trim() === "") return true; // campo opcional
    const regex = /^[+]?[\d\s\-()]{7,15}$/;
    return regex.test(telefono.trim());
}

/**
 * validarDatos(campos)
 * Función principal de validación: recorre un arreglo de reglas y
 * muestra mensajes de error en el DOM si alguna falla.
 * @param {Array} campos — cada elemento: { valor, idError, mensaje, validacion }
 * @returns {boolean} — true si todos los campos son válidos
 */
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

/* ============================================================
   ACTUALIZACIÓN DEL DOM (Criterio 2.1.1 y 2.1.4)
   ============================================================ */

/**
 * mostrarError(elemento, mensaje)
 * Muestra un mensaje de error bajo el campo correspondiente.
 * @param {HTMLElement} elemento
 * @param {string} mensaje
 */
function mostrarError(elemento, mensaje) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.style.display = "block";
    // Accesibilidad: marcar el input como inválido
    const input = elemento.previousElementSibling;
    if (input) input.setAttribute("aria-invalid", "true");
}

/**
 * limpiarError(elemento)
 * Elimina el mensaje de error de un campo.
 * @param {HTMLElement} elemento
 */
function limpiarError(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.style.display = "none";
    const input = elemento.previousElementSibling;
    if (input) input.removeAttribute("aria-invalid");
}

/**
 * mostrarMensaje(idContenedor, texto, tipo)
 * Actualiza el DOM para mostrar un mensaje de éxito o error en el formulario.
 * @param {string} idContenedor — ID del div de mensaje
 * @param {string} texto — mensaje a mostrar
 * @param {string} tipo — "exito" | "error"
 */
function mostrarMensaje(idContenedor, texto, tipo) {
    const el = document.getElementById(idContenedor);
    if (!el) return;
    el.textContent = texto;
    el.className = "form-msg form-msg--" + tipo;
    el.style.display = "block";

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        el.style.display = "none";
        el.textContent = "";
        el.className = "form-msg";
    }, 5000);
}

/**
 * actualizarDOM()
 * Actualiza la lista visible de usuarios inscritos en pantalla.
 */
function actualizarDOM() {
    const lista   = document.getElementById("lista-inscritos");
    const wrapper = document.getElementById("lista-inscritos-wrapper");

    if (!lista || !wrapper) return;

    // Limpiar lista antes de redibujar
    lista.innerHTML = "";

    if (usuariosInscritos.length === 0) {
        wrapper.style.display = "none";
        return;
    }

    wrapper.style.display = "block";

    // Agregar un <li> por cada usuario registrado
    usuariosInscritos.forEach(usuario => {
        const li = document.createElement("li");
        li.textContent = `#${usuario.id} — ${usuario.nombre} (${usuario.email})`;
        lista.appendChild(li);
    });
}

/* ============================================================
   FORMULARIO DE INSCRIPCIÓN (Criterio 2.1.2 y 2.1.3)
   ============================================================ */

/**
 * registrarUsuario()
 * Lee el formulario de inscripción, valida los datos y, si son correctos,
 * crea un objeto usuario y lo almacena en el arreglo usuariosInscritos.
 */
function registrarUsuario() {
    const nombre    = document.getElementById("reg-nombre").value;
    const email     = document.getElementById("reg-email").value;
    const password  = document.getElementById("reg-password").value;
    const confirm   = document.getElementById("reg-confirm").value;
    const telefono  = document.getElementById("reg-telefono").value;

    // Definir reglas de validación
    const reglas = [
        {
            valor: nombre,
            idError: "error-reg-nombre",
            mensaje: "El nombre no puede estar vacío.",
            validacion: validarCampoVacio
        },
        {
            valor: email,
            idError: "error-reg-email",
            mensaje: "Ingresa un correo electrónico válido.",
            validacion: validarEmail
        },
        {
            valor: password,
            idError: "error-reg-password",
            mensaje: "La contraseña debe tener al menos 8 caracteres.",
            validacion: validarPassword
        },
        {
            valor: confirm,
            idError: "error-reg-confirm",
            mensaje: "Las contraseñas no coinciden.",
            validacion: (val) => val === password
        },
        {
            valor: telefono,
            idError: "error-reg-telefono",
            mensaje: "Formato de teléfono inválido.",
            validacion: validarTelefono
        }
    ];

    // Ejecutar validaciones
    if (!validarDatos(reglas)) return;

    // Verificar si el email ya está registrado
    const yaExiste = usuariosInscritos.some(u => u.email === email.trim().toLowerCase());
    if (yaExiste) {
        mostrarMensaje("msg-inscripcion", "⚠️ Este correo ya está registrado.", "error");
        return;
    }

    // Crear nuevo objeto usuario (basado en plantillaUsuario)
    const nuevoUsuario = {
        ...plantillaUsuario,
        id: usuariosInscritos.length + 1,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        password: password,
        fechaRegistro: new Date().toLocaleDateString("es-CL")
    };

    // Almacenar en el arreglo
    usuariosInscritos.push(nuevoUsuario);

    // Limpiar formulario
    document.getElementById("form-inscripcion").reset();

    // Actualizar DOM con la nueva lista
    actualizarDOM();

    // Mostrar confirmación
    mostrarMensaje(
        "msg-inscripcion",
        `✅ ¡Bienvenido, ${nuevoUsuario.nombre}! Tu cuenta fue creada exitosamente.`,
        "exito"
    );
}

/* ============================================================
   FORMULARIO DE LOGIN (Criterio 2.1.2)
   ============================================================ */

/**
 * iniciarSesion()
 * Valida el formulario de login y verifica si el usuario existe en el arreglo.
 * Nota de seguridad: en producción, la verificación debe hacerse en el servidor
 * y las contraseñas deben almacenarse hasheadas (bcrypt, argon2).
 */
function iniciarSesion() {
    const email    = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const reglas = [
        {
            valor: email,
            idError: "error-login-email",
            mensaje: "Ingresa un correo electrónico válido.",
            validacion: validarEmail
        },
        {
            valor: password,
            idError: "error-login-password",
            mensaje: "La contraseña no puede estar vacía.",
            validacion: validarCampoVacio
        }
    ];

    if (!validarDatos(reglas)) return;

    // Buscar usuario verificando email Y contraseña
    const usuarioEncontrado = usuariosInscritos.find(
        u => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (usuarioEncontrado) {
        mostrarMensaje(
            "msg-login",
            `✅ Sesión iniciada correctamente. ¡Hola, ${usuarioEncontrado.nombre}!`,
            "exito"
        );
        document.getElementById("form-login").reset();
    } else {
        // No se muestra si la contraseña o el usuario es incorrecto por separado
        // (seguridad: evitar enumeración de usuarios)
        mostrarMensaje(
            "msg-login",
            "❌ Credenciales incorrectas. Verifica tu correo y contraseña.",
            "error"
        );
    }
}

/* ============================================================
   FORMULARIO DE CONTACTO (Criterio 2.1.2)
   ============================================================ */

/**
 * enviarContacto()
 * Valida los campos del formulario de contacto y simula el envío del mensaje.
 */
function enviarContacto() {
    const nombre  = document.getElementById("cont-nombre").value;
    const email   = document.getElementById("cont-email").value;
    const mensaje = document.getElementById("cont-mensaje").value;

    const reglas = [
        {
            valor: nombre,
            idError: "error-cont-nombre",
            mensaje: "El nombre no puede estar vacío.",
            validacion: validarCampoVacio
        },
        {
            valor: email,
            idError: "error-cont-email",
            mensaje: "Ingresa un correo electrónico válido.",
            validacion: validarEmail
        },
        {
            valor: mensaje,
            idError: "error-cont-mensaje",
            mensaje: "El mensaje no puede estar vacío.",
            validacion: validarCampoVacio
        }
    ];

    if (!validarDatos(reglas)) return;

    // Simular envío (en producción se haría fetch/POST al servidor)
    mostrarMensaje(
        "msg-contacto",
        "✅ Mensaje enviado. Te responderemos dentro de 24 horas.",
        "exito"
    );
    document.getElementById("form-contacto").reset();
}

/* ============================================================
   CARRITO DE COMPRAS (funcionalidad extra)
   ============================================================ */

/**
 * agregarAlCarrito(nombre, precio)
 * Agrega un producto al arreglo carrito y muestra una notificación.
 * @param {string} nombre
 * @param {number} precio
 */
function agregarAlCarrito(nombre, precio) {
    const producto = { nombre, precio, cantidad: 1 };
    carrito.push(producto);
    mostrarNotificacion(`🛒 "${nombre}" añadido al carrito — $${precio.toLocaleString("es-CL")}`);
}

/**
 * mostrarNotificacion(texto)
 * Muestra un toast temporal en pantalla.
 * @param {string} texto
 */
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

/* ============================================================
   MODO OSCURO
   ============================================================ */

/**
 * configurarModoOscuro()
 * Agrega el listener al botón de modo oscuro.
 */
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

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

/**
 * init()
 * Punto de entrada: se ejecuta cuando el DOM está listo.
 * Inicializa todas las funcionalidades de la página.
 */
function init() {
    // Año en el footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Carrusel automático
    iniciarCarruselAutomatico();

    // Pausar carrusel al pasar el mouse
    const carousel = document.getElementById("carousel");
    if (carousel) {
        carousel.addEventListener("mouseenter", detenerCarruselAutomatico);
        carousel.addEventListener("mouseleave", iniciarCarruselAutomatico);
    }

    // Modo oscuro
    configurarModoOscuro();

    // Soporte de teclado para carrusel (accesibilidad)
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft")  cambiarImagen(-1);
        if (e.key === "ArrowRight") cambiarImagen(1);
    });

    console.log("✅ Tienda Digimon TCG inicializada correctamente.");
    console.log("📦 Usuarios inscritos:", usuariosInscritos);
    console.log("🛒 Carrito:", carrito);
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", init);