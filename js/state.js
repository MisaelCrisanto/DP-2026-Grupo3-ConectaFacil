class EstadoCreando {
    constructor() {
        this.titulo = "Agregar contacto";
        this.boton = "Guardar contacto";
    }

    guardar(lista, contacto) {
        lista.push(contacto);
    }
}

class EstadoEditando {
    constructor(indice) {
        this.indice = indice;
        this.titulo = "Editar contacto";
        this.boton = "Guardar cambios";
    }

    guardar(lista, contacto) {
        if (this.indice < 0 || this.indice >= lista.length) {
            throw new Error("El contacto que intentas editar ya no existe.");
        }
        lista[this.indice] = contacto;
    }
}

class FormularioContacto {
    constructor() {
        this.cambiar(new EstadoCreando());
    }

    cambiar(nuevoEstado) {
        this.estado = nuevoEstado;
        registrar("[State] Formulario de contactos → " + nuevoEstado.constructor.name);

        const titulo = document.getElementById("tituloFormulario");
        const boton = document.getElementById("btnGuardarContacto");
        if (titulo) titulo.textContent = nuevoEstado.titulo;
        if (boton) boton.textContent = nuevoEstado.boton;
    }

    cancelar() {
        const formulario = document.getElementById("formContacto");
        if (formulario) formulario.reset();
        this.cambiar(new EstadoCreando());
    }
}

function escaparTextoHTML(valor) {
    const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(valor).replace(/[&<>"']/g, caracter => mapa[caracter]);
}

class EstadoEscribiendo {
    vista() {
        return "<p>Escribe un mensaje para revisarlo.</p>";
    }

    pregunta() {
        return null;
    }
}

class EstadoRevisando {
    constructor(sugerencias) {
        this.sugerencias = sugerencias;
    }

    vista() {
        const items = this.sugerencias
            .map(s => "<li>" + escaparTextoHTML(s) + "</li>")
            .join("");
        return "<p><strong>Sugerencias:</strong></p><ul>" + items + "</ul>";
    }

    pregunta() {
        return "Todavía hay sugerencias sin atender. ¿Abrir WhatsApp de todos modos?";
    }
}

class EstadoListo {
    vista() {
        return "<p><strong>Revisión completada.</strong> No se encontraron problemas.</p>";
    }

    pregunta() {
        return "Se abrirá WhatsApp con tu mensaje. ¿Continuar?";
    }
}

class FlujoMensaje {
    constructor() {
        this.estado = new EstadoEscribiendo();
    }

    revisar(texto) {
        const sugerencias = sugerenciasPara(texto);
        let nuevoEstado;

        if (texto.trim() === "") {
            nuevoEstado = new EstadoEscribiendo();
        } else if (sugerencias.length > 0) {
            nuevoEstado = new EstadoRevisando(sugerencias);
        } else {
            nuevoEstado = new EstadoListo();
        }

        if (nuevoEstado.constructor !== this.estado.constructor) {
            registrar("[State] Mensaje: " + this.estado.constructor.name +
                " → " + nuevoEstado.constructor.name);
        }

        this.estado = nuevoEstado;

        const resultado = document.getElementById("resultadoRevision");
        if (resultado) resultado.innerHTML = nuevoEstado.vista();
    }
}

function sugerenciasPara(original) {
    const texto = original.trim();
    const sugerencias = [];

    if (texto === "") return sugerencias;
    if (texto.length < 5) sugerencias.push("El mensaje es muy corto.");
    if (/\s{2,}/.test(original)) sugerencias.push("Hay espacios repetidos.");
    if (/[!?.,]{2,}/.test(texto)) sugerencias.push("Hay signos de puntuación repetidos.");
    if (/^[a-záéíóúñ]/.test(texto)) sugerencias.push("Puedes comenzar con mayúscula.");
    if (/\s[,.!?]/.test(texto)) sugerencias.push("Quita los espacios antes de la puntuación.");
    if (/(ola k ase|q haces|xq|tqm)/i.test(texto)) {
        sugerencias.push("Si es formal, escribe las palabras completas.");
    }
    if (!/[.!?]$/.test(texto)) sugerencias.push("Termina la oración con punto, ? o !.");

    return sugerencias;
}
