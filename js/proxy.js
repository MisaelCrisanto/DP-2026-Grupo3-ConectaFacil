class AlmacenReal {
    leer() {
        return JSON.parse(localStorage.getItem("contactos") || "[]");
    }

    guardar(lista) {
        localStorage.setItem("contactos", JSON.stringify(lista));
    }
}

class AlmacenProxy {
    constructor() {
        this.real = new AlmacenReal();
    }

    leer() {
        registrar("[Proxy] Leyendo contactos guardados");
        try {
            const datos = this.real.leer();
            return Array.isArray(datos) ? datos : [];
        } catch (error) {
            registrar("[Proxy] No se pudieron leer los contactos: " + error.message);
            return [];
        }
    }

    guardar(lista) {
        if (!Array.isArray(lista)) {
            return this.bloquear("No se pudo guardar: los datos no tienen un formato válido.");
        }

        for (const contacto of lista) {
            if (!contacto || typeof contacto.nombre !== "string" ||
                typeof contacto.telefono !== "string") {
                return this.bloquear("Hay un contacto con datos incompletos.");
            }

            const nombre = contacto.nombre.trim();
            const telefono = contacto.telefono.trim();
            const digitos = telefono.replace(/\D/g, "");

            if (nombre.length < 2) {
                return this.bloquear("El nombre debe tener al menos 2 caracteres.");
            }

            if (!/^[0-9+\-().\s]+$/.test(telefono) ||
                digitos.length < 7 || digitos.length > 15) {
                return this.bloquear("Ingresa un número válido, con entre 7 y 15 dígitos.");
            }
        }

        const numeros = lista.map(c => c.telefono.replace(/\D/g, ""));
        if (new Set(numeros).size !== numeros.length) {
            return this.bloquear("Ya existe un contacto con ese número.");
        }

        try {
            this.real.guardar(lista);
            registrar("[Proxy] Guardado permitido (" + lista.length + " contactos)");
            return null;
        } catch (error) {
            return this.bloquear("No se pudieron guardar los contactos. Comprueba el almacenamiento del navegador.");
        }
    }

    bloquear(motivo) {
        registrar("[Proxy] BLOQUEADO: " + motivo);
        return motivo;
    }
}

class NavegadorReal {
    abrir(url) {
        window.open(url, "_blank", "noopener,noreferrer");
    }
}

class NavegadorProxy {
    constructor() {
        this.real = new NavegadorReal();
    }

    abrir(direccion) {
        if (!navigator.onLine) {
            registrar("[Proxy] BLOQUEADO: sin Internet");
            return "No hay conexión a Internet.";
        }

        let url;
        try {
            url = new URL(direccion);
        } catch (error) {
            registrar("[Proxy] BLOQUEADO: dirección no válida");
            return "La dirección web no es válida.";
        }

        if (url.protocol !== "https:") {
            registrar("[Proxy] BLOQUEADO: la página no usa HTTPS");
            return "Solo se permiten páginas seguras (HTTPS).";
        }

        registrar("[Proxy] Navegación permitida");
        this.real.abrir(url.href);
        return null;
    }
}
