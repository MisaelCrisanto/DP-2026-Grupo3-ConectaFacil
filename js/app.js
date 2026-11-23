const resultado = document.getElementById("resultado");
const almacen = new AlmacenProxy();
const navegador = new NavegadorProxy();

let contactos = almacen.leer();
let formulario = null;
let flujoMensaje = null;

function registrar(texto) {
    console.log(texto);
}

function escaparHTML(valor) {
    const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(valor).replace(/[&<>"']/g, caracter => mapa[caracter]);
}

function mostrarOpcion(opcion) {
    if (!resultado) return;

    if (opcion === "mensaje") {
        resultado.innerHTML = `
            <h3>Enviar mensaje</h3>
            <textarea id="textoMensaje" rows="5" maxlength="2000"
                placeholder="Escribe aquí tu mensaje..."
                aria-label="Mensaje"
                style="width:100%;padding:12px;"
                oninput="flujoMensaje.revisar(this.value)"></textarea>
            <div id="resultadoRevision"></div>
            <button type="button" onclick="enviarMensaje()">Continuar para enviar</button>
        `;
        flujoMensaje = new FlujoMensaje();
        flujoMensaje.revisar("");

    } else if (opcion === "llamada") {
        resultado.innerHTML = `
            <h3>Hablar con alguien</h3>
            <h4 id="tituloFormulario"></h4>
            <form id="formContacto" onsubmit="agregarContacto(event)">
                <input id="nombreContacto" type="text" maxlength="80"
                    placeholder="Nombre del contacto" aria-label="Nombre del contacto" required>
                <input id="telefonoContacto" type="tel" maxlength="25"
                    placeholder="Número, por ejemplo +51 999 999 999"
                    aria-label="Número de teléfono" required>
                <button id="btnGuardarContacto" type="submit"></button>
                <button class="btn-cancelar" type="button"
                    onclick="formulario.cancelar()">Limpiar formulario</button>
            </form>
            <h4>Mis contactos</h4>
            <input id="buscadorContactos" type="search"
                placeholder="Buscar por nombre o teléfono"
                aria-label="Buscar contactos"
                oninput="mostrarContactos()">
            <div id="listaContactos"></div>
        `;
        formulario = new FormularioContacto();
        mostrarContactos();

    } else if (opcion === "busqueda") {
        resultado.innerHTML = `
            <h3>Buscar en la web</h3>
            <form onsubmit="buscarEnWeb(event)">
                <input id="textoBusqueda" type="search" maxlength="200"
                    placeholder="¿Qué deseas buscar?" aria-label="Texto de búsqueda" required
                    style="width:100%;padding:12px;">
                <button type="submit">Buscar en Google</button>
            </form>
        `;
    }
}

function enviarMensaje() {
    const campo = document.getElementById("textoMensaje");
    if (!campo || !flujoMensaje) return;

    const texto = campo.value;
    flujoMensaje.revisar(texto);

    const pregunta = flujoMensaje.estado.pregunta();
    if (pregunta === null) {
        alert("Escribe un mensaje antes de continuar.");
    } else if (confirm(pregunta)) {
        abrirWeb("https://wa.me/?text=" + encodeURIComponent(texto.trim()));
    }
}

function buscarEnWeb(event) {
    event.preventDefault();
    const campo = document.getElementById("textoBusqueda");
    if (!campo) return;

    const consulta = campo.value.trim();
    if (!consulta) {
        alert("Escribe algo para buscar.");
        return;
    }
    abrirWeb("https://www.google.com/search?q=" + encodeURIComponent(consulta));
}

function abrirWeb(url) {
    const error = navegador.abrir(url);
    if (error) alert(error);
}

function agregarContacto(event) {
    event.preventDefault();
    if (!formulario) return;

    const nuevo = {
        nombre: document.getElementById("nombreContacto").value.trim().replace(/\s+/g, " "),
        telefono: document.getElementById("telefonoContacto").value.trim()
    };

    const copia = [...contactos];

    try {
        formulario.estado.guardar(copia, nuevo);
    } catch (error) {
        alert(error.message);
        return;
    }

    const error = almacen.guardar(copia);
    if (error) {
        alert(error);
        return;
    }

    contactos = copia;
    formulario.cancelar();
    mostrarContactos();
    alert("Contacto guardado correctamente.");
}

function editarContacto(indice) {
    if (!formulario || !Number.isInteger(indice) ||
        indice < 0 || indice >= contactos.length) {
        alert("No se encontró el contacto que deseas editar.");
        return;
    }

    formulario.cambiar(new EstadoEditando(indice));
    document.getElementById("nombreContacto").value = contactos[indice].nombre;
    document.getElementById("telefonoContacto").value = contactos[indice].telefono;
    document.getElementById("nombreContacto").focus();
}

function eliminarContacto(indice) {
    if (!Number.isInteger(indice) || indice < 0 || indice >= contactos.length) return;
    if (!confirm("¿Deseas eliminar a " + contactos[indice].nombre + "?")) return;

    const copia = [...contactos];
    copia.splice(indice, 1);

    const error = almacen.guardar(copia);
    if (error) {
        alert(error);
        return;
    }

    contactos = copia;
    if (formulario) formulario.cancelar();
    mostrarContactos();
}

function llamarContacto(indice) {
    if (!Number.isInteger(indice) || indice < 0 || indice >= contactos.length) return;

    const contacto = contactos[indice];
    const numero = contacto.telefono.replace(/[^\d+]/g, "");
    if (confirm("¿Abrir la aplicación de llamadas para " + contacto.nombre + "?")) {
        window.location.href = "tel:" + numero;
    }
}

function mostrarContactos() {
    const buscador = document.getElementById("buscadorContactos");
    const lista = document.getElementById("listaContactos");
    if (!buscador || !lista) return;

    const consulta = buscador.value.trim().toLowerCase();

    const html = contactos
        .map((contacto, indice) => ({ contacto, indice }))
        .filter(({ contacto }) =>
            (contacto.nombre + " " + contacto.telefono).toLowerCase().includes(consulta))
        .map(({ contacto, indice }) => `
            <article class="contacto-tarjeta">
                <h4>${escaparHTML(contacto.nombre)}</h4>
                <p>Teléfono: ${escaparHTML(contacto.telefono)}</p>
                <div class="contacto-acciones">
                    <button type="button" onclick="editarContacto(${indice})">Editar</button>
                    <button type="button" onclick="llamarContacto(${indice})">Llamar</button>
                    <button type="button" class="btn-eliminar"
                        onclick="eliminarContacto(${indice})">Eliminar</button>
                </div>
            </article>`)
        .join("");

    lista.innerHTML = html ||
        '<p class="mensaje-contactos">No hay contactos para mostrar.</p>';
}
