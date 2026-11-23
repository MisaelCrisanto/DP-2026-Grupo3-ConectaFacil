INTEGRANTES DE GRUPO: 

1. Misael Alexander Crisanto Barranzuela
2. Gutiérrez Sernaque Eduard Denilson
3. Carlos Martin Emilio Rubio Roman
4. Christopher Xavier nonajulca
5. Calle calva Bayron Gabriel

# ConectaFácil — Proyecto de Diseño de Patrones

Aplicación web académica desarrollada con HTML, CSS y JavaScript para demostrar los patrones **Proxy** y **State**.

## Estructura del proyecto

```text
ConectaFacil/
├── index.html
├── estilos.css
├── README.md
└── js/
    ├── app.js
    ├── proxy.js
    └── state.js
```

## Cómo ejecutar

1. Mantén todos los archivos en la estructura indicada.
2. Abre `index.html` con un navegador.
3. Para observar los mensajes de los patrones, abre las herramientas del navegador con `F12` y entra en la pestaña Consola.

No se necesita instalar dependencias.

## 1. Patrón Proxy (estructural)

Un Proxy controla el acceso a otro objeto. En este proyecto se utiliza para dos operaciones:

### Almacenamiento de contactos

- `AlmacenReal` lee y guarda los contactos en `localStorage`.
- `AlmacenProxy` ofrece los métodos `leer()` y `guardar()`, pero añade validaciones antes de guardar.
- Comprueba que los datos tengan formato correcto, que el nombre tenga al menos dos caracteres, que el teléfono contenga entre 7 y 15 dígitos y que no existan números duplicados.
- También controla errores que puedan ocurrir al acceder al almacenamiento del navegador.

### Navegación web

- `NavegadorReal` abre una dirección web.
- `NavegadorProxy` comprueba que exista conexión y que la dirección sea válida y use HTTPS antes de permitir la navegación.

**Cómo demostrarlo:** intenta guardar un contacto con teléfono no válido o repetido. En la consola aparecerá un mensaje `[Proxy] BLOQUEADO`. Después guarda un contacto válido y observa `[Proxy] Guardado permitido`.

## 2. Patrón State (comportamiento)

State permite que un objeto cambie su comportamiento según el estado que tenga actualmente.

### Formulario de contactos

`FormularioContacto` es el contexto y mantiene el estado actual:

- `EstadoCreando`: configura el formulario para agregar un contacto.
- `EstadoEditando`: configura el formulario para reemplazar el contacto seleccionado.

El contexto delega la operación `guardar()` al estado actual. Por eso, la operación añade o reemplaza según el estado.

**Cómo demostrarlo:** entra en “Hablar con alguien”, agrega un contacto y luego pulsa “Editar”. Observa cómo cambian el título y el botón. Guarda los cambios y el formulario vuelve al estado de creación.

### Revisión de mensajes

`FlujoMensaje` es el contexto y puede utilizar tres estados:

- `EstadoEscribiendo`: el campo está vacío y no permite continuar.
- `EstadoRevisando`: se encontraron sugerencias y pregunta si se desea continuar.
- `EstadoListo`: no se encontraron sugerencias y permite continuar.

El contexto analiza el texto y cambia al estado correspondiente. Cada estado define su propia vista y la pregunta que se muestra antes de continuar.

**Cómo demostrarlo:** escribe `hola` y observa las sugerencias. Luego escribe un mensaje como `Hola, ¿cómo estás?` y observa el estado de revisión completada.

## 3. Cómo trabajan juntos

En el guardado de un contacto:

1. El patrón **State** decide la operación según el estado del formulario: agregar o reemplazar.
2. El patrón **Proxy** valida los datos y decide si permite guardarlos.
3. Si la validación es correcta, `AlmacenReal` realiza el guardado.

En resumen: State determina el comportamiento de la operación y Proxy controla el acceso al almacenamiento.
