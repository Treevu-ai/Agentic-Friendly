# Documento de Requisitos — Remediación de Deuda Técnica

## Introducción

Este documento define los requisitos para remediar la deuda técnica acumulada en el proyecto **AGENTIC FIRST**, una landing page construida en React 18 sin bundler (cargada vía CDN + Babel standalone). El objetivo es estabilizar, completar y mejorar la base de código de forma ordenada y sin romper la funcionalidad existente.

El proyecto consta de los siguientes archivos principales: `AGENTIC FIRST.html`, `app.jsx`, `sections.jsx`, `hero-console.jsx`, `scanner.jsx`, `tweaks-panel.jsx`, `design-canvas.jsx`, `motion.js`, `dazzle.js`, `dazzle.css`, `styles.css` y `copy.js`.

La remediación se organiza en cuatro grupos de prioridad: **Crítica**, **Alta**, **Media** y **Baja**.

---

## Glosario

- **Sistema**: El conjunto de archivos que componen la landing page AGENTIC FIRST.
- **DesignCanvas**: El componente React definido en `design-canvas.jsx` que provee un canvas de diseño con pan/zoom, artboards y notas PostIt.
- **DCFocusOverlay**: La función React dentro de `DesignCanvas` que renderiza el overlay de foco a pantalla completa para un artboard.
- **DCPostIt**: La función React dentro de `DesignCanvas` que renderiza notas adhesivas sobre el canvas.
- **TweaksPanel**: El componente React en `tweaks-panel.jsx` que provee controles de configuración en tiempo real.
- **useTweaks**: El hook React en `tweaks-panel.jsx` que gestiona el estado de los tweaks y su persistencia.
- **Scanner**: El componente React en `scanner.jsx` que simula un análisis de visibilidad agéntica por dominio.
- **hashScore**: La función pura en `scanner.jsx` que calcula un score determinista a partir de un string de dominio.
- **motion.js**: El script vanilla JS que gestiona scroll reveals, estado del nav y ripple de botones.
- **dazzle.js**: El script vanilla JS que gestiona el cursor magnético, partículas hero, aurora y animaciones de sección.
- **Bundler**: Herramienta de empaquetado como Vite, Webpack o Parcel. El proyecto actualmente no usa ninguno.
- **CDN**: Red de distribución de contenido desde la que se cargan React, ReactDOM y Babel standalone.
- **SRI**: Subresource Integrity — atributo `integrity` en etiquetas `<script>` y `<link>` para verificar integridad de recursos externos.
- **CSS-en-JS**: Patrón de incrustar CSS como template literals dentro de componentes JSX mediante `<style>{`...`}</style>`.
- **CSS Variables**: Variables nativas de CSS declaradas con `--nombre` y consumidas con `var(--nombre)`.
- **a11y**: Abreviatura de accesibilidad (accessibility).
- **ARIA**: Accessible Rich Internet Applications — especificación W3C para atributos de accesibilidad.
- **preload**: Atributo HTML del elemento `<video>` que controla cuánto contenido se precarga.
- **MutationObserver**: API del navegador para observar cambios en el DOM.
- **window.omelette**: Bridge de escritura de archivos provisto por el entorno host (omelette). Solo disponible en el entorno de edición.
- **COPY**: Objeto global `window.COPY` definido en `copy.js` que contiene el contenido bilingüe (ES/EN) de la landing.
- **ENGINES**: Array global `window.ENGINES` definido en `hero-console.jsx` que lista los motores de IA soportados.

---

## Requisitos

---

### Requisito 1: Completar design-canvas.jsx

**User Story:** Como desarrollador, quiero que `design-canvas.jsx` esté completo y funcional, para que el canvas de diseño opere sin errores de referencia a funciones indefinidas.

#### Criterios de Aceptación

1. THE Sistema SHALL contener una definición completa y sintácticamente válida de la función `DCFocusOverlay` en `design-canvas.jsx`.
2. THE Sistema SHALL contener una definición completa y sintácticamente válida de la función `DCPostIt` en `design-canvas.jsx`.
3. WHEN el archivo `design-canvas.jsx` es cargado por Babel standalone, THE Sistema SHALL no lanzar errores de `ReferenceError` ni `SyntaxError` relacionados con `DCFocusOverlay` o `DCPostIt`.
4. WHEN un artboard recibe un clic en el botón de expansión, THE DesignCanvas SHALL renderizar el `DCFocusOverlay` con el artboard seleccionado visible a pantalla completa.
5. WHEN el usuario presiona la tecla `Escape` mientras `DCFocusOverlay` está activo, THE DesignCanvas SHALL cerrar el overlay y restaurar la vista del canvas.
6. WHEN el usuario presiona `ArrowLeft` o `ArrowRight` mientras `DCFocusOverlay` está activo, THE DesignCanvas SHALL navegar al artboard anterior o siguiente dentro de la misma sección.
7. THE Sistema SHALL exportar `DCPostIt` al scope global mediante `Object.assign(window, {...})` o equivalente, de forma consistente con el patrón de exportación del resto del archivo.

---

### Requisito 2: Integridad de recursos CDN

**User Story:** Como operador del sitio, quiero que todos los recursos cargados desde CDN tengan verificación de integridad, para que una modificación maliciosa o accidental del recurso externo sea detectada por el navegador.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir el atributo `integrity` con hash SHA-384 en la etiqueta `<script>` de React (`react.development.js` o `react.production.min.js`).
2. THE Sistema SHALL incluir el atributo `integrity` con hash SHA-384 en la etiqueta `<script>` de ReactDOM.
3. THE Sistema SHALL incluir el atributo `integrity` con hash SHA-384 en la etiqueta `<script>` de Babel standalone.
4. THE Sistema SHALL incluir el atributo `crossorigin="anonymous"` en todas las etiquetas `<script>` de CDN que tengan atributo `integrity`.
5. IF el hash SRI de un recurso CDN no coincide con el recurso descargado, THEN THE Sistema SHALL bloquear la ejecución del script afectado según el comportamiento estándar del navegador.

> **Nota:** Los hashes SRI actuales en el HTML ya existen para React y Babel. Este requisito formaliza que deben mantenerse actualizados y presentes para todos los recursos CDN.

---

### Requisito 3: Separación de CSS embebido en JSX

**User Story:** Como desarrollador, quiero que los estilos CSS no estén incrustados como template literals dentro de los componentes JSX, para que el código sea más mantenible y los estilos sean reutilizables.

#### Criterios de Aceptación

1. THE Sistema SHALL mover todos los bloques `<style>{`...`}</style>` de `sections.jsx` a archivos CSS externos o al archivo `styles.css` existente.
2. THE Sistema SHALL mover todos los bloques `<style>{`...`}</style>` de `app.jsx` a archivos CSS externos o al archivo `styles.css` existente.
3. THE Sistema SHALL mover todos los bloques `<style>{`...`}</style>` de `scanner.jsx` a archivos CSS externos o al archivo `styles.css` existente.
4. THE Sistema SHALL mover todos los bloques `<style>{`...`}</style>` de `hero-console.jsx` a archivos CSS externos o al archivo `styles.css` existente.
5. WHEN los estilos son movidos a archivos CSS, THE Sistema SHALL mantener el comportamiento visual idéntico al estado previo a la refactorización.
6. THE Sistema SHALL referenciar los archivos CSS externos mediante etiquetas `<link rel="stylesheet">` en el HTML principal.
7. WHERE los estilos de `tweaks-panel.jsx` son necesarios únicamente para ese componente y se inyectan programáticamente, THE Sistema SHALL mantener la inyección programática existente (`__TWEAKS_STYLE`) como excepción documentada.

---

### Requisito 4: Gestión de estado consistente

**User Story:** Como desarrollador, quiero que la gestión de estado del sistema use un mecanismo coherente y predecible, para que los cambios de configuración se propaguen de forma fiable sin efectos secundarios inesperados.

#### Criterios de Aceptación

1. THE Sistema SHALL documentar en comentarios de código el contrato de cada canal de comunicación de estado: `window.parent.postMessage` (para el host omelette), `localStorage` (para persistencia de viewport), y `window.omelette.writeFile` (para persistencia de estado del canvas).
2. WHEN `useTweaks` recibe una llamada `setTweak(key, value)`, THE Sistema SHALL actualizar el estado React local antes de emitir el mensaje `window.parent.postMessage`.
3. WHEN `useTweaks` recibe una llamada `setTweak(key, value)`, THE Sistema SHALL emitir el evento `CustomEvent('tweakchange')` en `window` para notificar a listeners en la misma página.
4. THE Sistema SHALL no usar `window.parent.postMessage` para comunicación de estado entre componentes en la misma página; para ese caso SHALL usar el evento `tweakchange` o props de React.
5. WHEN `DesignCanvas` persiste estado al sidecar `.design-canvas.state.json`, THE Sistema SHALL usar exclusivamente `window.omelette.writeFile` y SHALL manejar el caso en que `window.omelette` no esté disponible sin lanzar excepciones no capturadas.

---

### Requisito 5: Manejo de errores explícito

**User Story:** Como desarrollador, quiero que todos los bloques `catch` registren o propaguen el error capturado, para que los fallos silenciosos no oculten problemas en producción o durante el desarrollo.

#### Criterios de Aceptación

1. THE Sistema SHALL eliminar todos los bloques `.catch(() => {})` vacíos del código fuente.
2. WHEN una operación `fetch` falla en `DesignCanvas` (lectura del sidecar de estado), THE Sistema SHALL registrar el error en `console.warn` con un mensaje descriptivo que incluya el nombre del archivo y la operación.
3. WHEN `window.omelette.writeFile` falla, THE Sistema SHALL registrar el error en `console.warn` con el nombre del archivo afectado.
4. WHEN la exportación de artboard (`dcExport`) falla en cualquier paso, THE Sistema SHALL registrar el error en `console.error` y SHALL notificar al usuario con un mensaje visible en la interfaz.
5. IF `localStorage` no está disponible (modo privado, cuota excedida), THEN THE Sistema SHALL capturar la excepción y continuar operando sin persistencia de viewport, sin lanzar errores no capturados.

---

### Requisito 6: Accesibilidad de componentes interactivos

**User Story:** Como usuario con necesidades de accesibilidad, quiero que todos los controles interactivos tengan roles y etiquetas ARIA correctos, para que los lectores de pantalla y la navegación por teclado funcionen correctamente.

#### Criterios de Aceptación

1. THE Sistema SHALL asignar `role="button"` o usar el elemento `<button>` nativo en todos los elementos interactivos que no sean `<a>`, `<button>`, `<input>`, `<select>` o `<textarea>`.
2. THE Sistema SHALL asignar `aria-label` descriptivo a todos los botones que no contengan texto visible (botones de icono, botones de cierre, botones de expansión).
3. THE Sistema SHALL asignar `aria-label` al campo `<input>` del Scanner que actualmente carece de `<label>` asociado.
4. WHEN el `TweaksPanel` está abierto, THE Sistema SHALL gestionar el foco de teclado de forma que el usuario pueda navegar por los controles con Tab y cerrar el panel con Escape.
5. THE Sistema SHALL asignar `aria-expanded` al botón de navegación del `DCFocusOverlay` que abre el dropdown de secciones.
6. THE Sistema SHALL asignar `aria-live="polite"` a la región de resultados del Scanner para que los lectores de pantalla anuncien el resultado cuando el análisis termina.
7. THE Sistema SHALL asignar `role="status"` al indicador de estado del Scanner (READY / RUNNING / DONE).
8. WHERE el componente `TweakToggle` ya implementa `role="switch"` y `aria-checked`, THE Sistema SHALL mantener esa implementación como referencia del patrón correcto.

---

### Requisito 7: Optimización de carga de video

**User Story:** Como visitante del sitio, quiero que el video del hero no consuma ancho de banda innecesario en conexiones lentas, para que la página cargue rápido independientemente de la velocidad de conexión.

#### Criterios de Aceptación

1. THE Sistema SHALL cambiar el atributo `preload` del elemento `<video>` del hero de `"auto"` a `"metadata"`.
2. WHEN el navegador soporta la API `navigator.connection`, THE Sistema SHALL evaluar `effectiveType` y SHALL omitir la carga del video si el tipo efectivo es `"slow-2g"` o `"2g"`.
3. THE Sistema SHALL mantener los atributos `autoPlay`, `muted`, `loop` y `playsInline` en el elemento `<video>` del hero.
4. IF el archivo de video no puede cargarse, THEN THE Sistema SHALL mostrar el fondo de gradiente y grid existente sin errores visibles en la interfaz.

---

### Requisito 8: Optimización del MutationObserver en motion.js

**User Story:** Como desarrollador, quiero que el `MutationObserver` de `motion.js` tenga un ciclo de vida controlado y configurable, para que no consuma recursos innecesariamente después de que React haya montado todos los componentes.

#### Criterios de Aceptación

1. THE Sistema SHALL reducir el timeout de desconexión del `MutationObserver` en `motion.js` de 4000ms a 2000ms.
2. THE Sistema SHALL exponer la constante de timeout como una variable nombrada (`MOTION_OBSERVER_TIMEOUT`) en lugar de un literal numérico.
3. WHEN el `MutationObserver` se desconecta, THE Sistema SHALL registrar en `console.debug` un mensaje que indique que el observer fue desconectado y el tiempo transcurrido.
4. THE Sistema SHALL mantener el comportamiento funcional de scroll reveals, estado del nav y ripple de botones sin regresiones.

---

### Requisito 9: Documentación del proyecto (README)

**User Story:** Como desarrollador nuevo en el proyecto, quiero un README que explique la arquitectura y cómo ejecutar el proyecto, para poder contribuir sin necesidad de leer todo el código fuente.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir un archivo `README.md` en la raíz del proyecto.
2. THE `README.md` SHALL describir la arquitectura del proyecto: stack tecnológico (React CDN + Babel standalone), lista de archivos principales y su responsabilidad.
3. THE `README.md` SHALL incluir instrucciones para ejecutar el proyecto localmente (servidor HTTP estático).
4. THE `README.md` SHALL documentar el sistema de tweaks (`TWEAK_DEFAULTS`, `useTweaks`, `TweaksPanel`) y cómo añadir nuevos controles.
5. THE `README.md` SHALL documentar el bridge `window.omelette` y cuándo está disponible.
6. THE `README.md` SHALL estar escrito en español, con secciones en inglés opcionales para términos técnicos.

---

### Requisito 10: Estandarización de nomenclatura y comentarios

**User Story:** Como desarrollador, quiero que el código use nombres de variables descriptivos y comentarios en un único idioma, para que el código sea legible y mantenible por cualquier miembro del equipo.

#### Criterios de Aceptación

1. THE Sistema SHALL renombrar las variables de una sola letra en `app.jsx` (`t` → `tweaks`, `c` → `copy`) en los contextos donde no sean parámetros de callbacks de array.
2. THE Sistema SHALL estandarizar todos los comentarios de código en español (idioma principal del proyecto).
3. THE Sistema SHALL mantener los nombres de variables de una sola letra en callbacks de array estándar (`.map((e) => ...)`, `.filter((s) => ...)`) donde la convención es aceptada.
4. WHERE una variable abreviada es parte de la API pública de un componente (prop name, hook return), THE Sistema SHALL mantener el nombre existente para no romper el contrato de la API.

---

### Requisito 11: Tests unitarios para funciones puras

**User Story:** Como desarrollador, quiero que las funciones puras del proyecto tengan tests unitarios, para poder refactorizar con confianza y detectar regresiones automáticamente.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir tests para la función `hashScore` de `scanner.jsx` que verifiquen que el valor retornado es siempre un número entero entre 8 y 98 para cualquier string de dominio no vacío.
2. FOR ALL strings de dominio no vacíos `d`, THE `hashScore` SHALL retornar el mismo valor cuando se llama múltiples veces con el mismo input (propiedad de determinismo / idempotencia).
3. THE Sistema SHALL incluir tests para la función `__twkIsLight` de `tweaks-panel.jsx` que verifiquen que retorna `true` para colores claros (`#ffffff`, `#f0f0f0`) y `false` para colores oscuros (`#000000`, `#111111`).
4. THE Sistema SHALL incluir tests para la función `useTweaks` que verifiquen que `setTweak(key, value)` actualiza el estado con el valor correcto.
5. THE Sistema SHALL configurar un runner de tests compatible con el entorno sin bundler (por ejemplo, un archivo HTML de test con un framework ligero como `uvu` o tests inline con `console.assert`), o alternativamente configurar un entorno de test con Node.js para las funciones puras exportables.

---

### Requisito 12: Eliminación de archivos temporales y limpieza de assets

**User Story:** Como operador del sitio, quiero que el repositorio no contenga archivos de video temporales ni assets sin referenciar, para mantener el repositorio limpio y reducir el tamaño del proyecto.

#### Criterios de Aceptación

1. THE Sistema SHALL evaluar si el archivo `uploads/grok-video-cc1a7e78-8da3-4073-81e9-f62cf6ad8c01 (1).mp4` está referenciado en algún archivo del proyecto.
2. IF el archivo de video en `uploads/` no está referenciado en ningún archivo del proyecto, THEN THE Sistema SHALL eliminarlo del repositorio.
3. THE Sistema SHALL documentar en el README la política de assets: los videos de producción van en `assets/`, los archivos temporales no deben commitearse.
4. THE Sistema SHALL verificar que `assets/hero.mp4` es el único video referenciado en el HTML principal y que la ruta es correcta.
