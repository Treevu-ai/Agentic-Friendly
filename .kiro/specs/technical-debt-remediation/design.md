# Diseño Técnico — Remediación de Deuda Técnica (AGENTIC FIRST)

## Resumen de investigación

Antes de escribir el diseño se verificó el estado real del código:

- **design-canvas.jsx**: `DCFocusOverlay` y `DCPostIt` **ya están implementados** y completos (líneas 789–934). El archivo no está truncado; el truncamiento era un artefacto de la herramienta de lectura. El requisito 1 se reduce a verificar que el archivo carga sin errores y que las funciones están exportadas.
- **SRI**: Los tres scripts CDN (React, ReactDOM, Babel) ya tienen `integrity` SHA-384 y `crossorigin="anonymous"`. El requisito 2 es mantenerlos y documentar la política.
- **CSS embebido**: Todos los archivos JSX (`sections.jsx`, `app.jsx`, `scanner.jsx`, `hero-console.jsx`) contienen bloques `<style>{`...`}</style>`. `tweaks-panel.jsx` usa inyección programática (`__TWEAKS_STYLE`) que se mantiene como excepción.
- **Estado**: `useTweaks` ya emite `CustomEvent('tweakchange')` y `window.parent.postMessage`. El requisito 4 añade documentación y un pequeño ajuste de orden de operaciones.
- **Errores silenciosos**: `design-canvas.jsx` tiene `.catch(() => {})` en la lectura del sidecar y en `writeFile`. `dcExport` no notifica al usuario en caso de fallo.
- **Video**: `preload="auto"` en `app.jsx`. No hay detección de conexión lenta.
- **MutationObserver**: timeout literal `4000` en `motion.js`.
- **Uploads**: `uploads/grok-video-cc1a7e78-8da3-4073-81e9-f62cf6ad8c01 (1).mp4` no está referenciado en ningún archivo del proyecto.
- **Nomenclatura**: `t` y `c` como variables de estado en `app.jsx`. Comentarios mezclados en inglés y español.

---

## Visión general

La remediación es **incremental y no destructiva**: no se introduce bundler, no se cambia la arquitectura CDN+Babel, no se reescribe ningún componente. Cada cambio es quirúrgico y reversible.

El orden de implementación sigue la prioridad de los requisitos:

1. **Crítica**: Req 1 (design-canvas), Req 5 (errores silenciosos)
2. **Alta**: Req 3 (CSS externo), Req 6 (accesibilidad), Req 7 (video)
3. **Media**: Req 2 (SRI), Req 4 (estado), Req 8 (MutationObserver), Req 10 (nomenclatura)
4. **Baja**: Req 9 (README), Req 11 (tests), Req 12 (limpieza assets)

---

## Arquitectura

El proyecto mantiene su arquitectura actual sin cambios estructurales:

```
AGENTIC FIRST.html          ← punto de entrada, carga CDN + scripts
├── styles.css              ← tokens globales + estilos de sección (destino del CSS migrado)
├── dazzle.css              ← estilos del cursor magnético y partículas
├── copy.js                 ← contenido bilingüe (window.COPY)
├── motion.js               ← scroll reveals, nav, ripple (vanilla JS)
├── dazzle.js               ← cursor magnético, aurora (vanilla JS)
└── [componentes JSX]       ← compilados por Babel standalone en el navegador
    ├── tweaks-panel.jsx    ← useTweaks, TweaksPanel, controles
    ├── hero-console.jsx    ← HeroConsole, ENGINES, EngineMark
    ├── scanner.jsx         ← Scanner, hashScore
    ├── sections.jsx        ← Marquee, Metrics, Pillars, Timeline, Cases, Pricing, FinalCTA, Footer
    ├── app.jsx             ← App, Nav, Hero, ScannerSection
    └── design-canvas.jsx   ← DesignCanvas, DCSection, DCArtboard, DCPostIt (canvas de diseño)
```

**Canales de comunicación de estado** (documentados en Req 4):

| Canal | Dirección | Propósito |
|---|---|---|
| `window.parent.postMessage` | página → host omelette | Persistir tweaks en disco (EDITMODE block) |
| `CustomEvent('tweakchange')` | componente → misma página | Notificar cambios de tweak a listeners locales |
| `localStorage` | DCViewport ↔ navegador | Persistir posición/zoom del canvas entre recargas |
| `window.omelette.writeFile` | DesignCanvas → host | Persistir orden/títulos/labels del canvas |

---

## Componentes e interfaces

### Req 1 — design-canvas.jsx

**Estado actual**: `DCFocusOverlay` y `DCPostIt` están completos. La exportación global incluye `DCPostIt` pero no `DesignCanvas` directamente (se exporta como `window.DesignCanvas`).

**Cambios necesarios**: Ninguno en la lógica. Solo verificación y documentación. El archivo ya cumple los criterios 1.1–1.7.

**Acción**: Añadir comentario de cabecera que documente las funciones exportadas y sus contratos.

---

### Req 2 — Integridad SRI

**Estado actual**: Los tres scripts CDN ya tienen `integrity` SHA-384 y `crossorigin="anonymous"`.

**Cambios necesarios**: Ninguno en el HTML. Añadir comentario en el HTML documentando la política de actualización de hashes.

**Política de actualización**: Al actualizar una versión de CDN, recalcular el hash con:
```bash
curl -s https://unpkg.com/react@X.Y.Z/umd/react.development.js | openssl dgst -sha384 -binary | openssl base64 -A
```

---

### Req 3 — Separación de CSS embebido

**Estrategia**: Mover todos los bloques `<style>{`...`}</style>` a `styles.css`, organizados por sección con comentarios delimitadores.

**Estructura de styles.css después de la migración**:
```
/* ── tokens & base ── */          (existente)
/* ── nav ── */                    (existente)
/* ── hero ── */                   (migrado de app.jsx)
/* ── marquee ── */                (migrado de sections.jsx)
/* ── metrics ── */                (migrado de sections.jsx)
/* ── pillars ── */                (migrado de sections.jsx)
/* ── timeline ── */               (migrado de sections.jsx)
/* ── cases ── */                  (migrado de sections.jsx)
/* ── pricing ── */                (migrado de sections.jsx)
/* ── final-cta ── */              (migrado de sections.jsx)
/* ── footer ── */                 (migrado de sections.jsx)
/* ── scanner ── */                (migrado de scanner.jsx)
/* ── hero-console ── */           (migrado de hero-console.jsx)
/* ── motion system ── */          (existente)
```

**Excepción documentada**: `tweaks-panel.jsx` mantiene `__TWEAKS_STYLE` como inyección programática porque el panel es un componente autocontenido diseñado para ser copiado entre proyectos sin dependencias externas de CSS.

**Verificación**: Después de la migración, los archivos JSX no deben contener el patrón `<style>{` (excepto tweaks-panel.jsx).

---

### Req 4 — Gestión de estado

**Cambios en `useTweaks`** (`tweaks-panel.jsx`):

El orden actual ya es correcto: `setValues` (estado React) se llama antes que `postMessage`. Se añade documentación explícita del contrato:

```javascript
// Contrato de setTweak:
// 1. Actualiza estado React local (síncrono, antes de cualquier efecto secundario)
// 2. Notifica al host omelette via postMessage (para persistencia en disco)
// 3. Emite CustomEvent('tweakchange') para listeners en la misma página
// NOTA: window.parent.postMessage es SOLO para el host, no para comunicación
//       entre componentes en la misma página. Para eso usar el evento 'tweakchange'.
```

**Cambios en `DesignCanvas`** (`design-canvas.jsx`):

Documentar el contrato de `window.omelette.writeFile`:
```javascript
// Canal de persistencia: window.omelette.writeFile
// Solo disponible en el entorno omelette (edición). En producción/descarga,
// window.omelette es undefined y el estado no persiste entre recargas.
// El guard `window.omelette?.writeFile(...)` ya maneja este caso.
```

---

### Req 5 — Manejo de errores

**Cambios concretos**:

**`design-canvas.jsx` — lectura del sidecar**:
```javascript
// Antes:
.catch(() => {})
// Después:
.catch((err) => { console.warn('[DesignCanvas] No se pudo leer', DC_STATE_FILE, err); })
```

**`design-canvas.jsx` — escritura via omelette**:
```javascript
// Antes:
window.omelette?.writeFile(...).catch(() => {});
// Después:
window.omelette?.writeFile(...).catch((err) => {
  console.warn('[DesignCanvas] No se pudo escribir', DC_STATE_FILE, err);
});
```

**`design-canvas.jsx` — dcExport**:
```javascript
// Añadir al inicio de dcExport:
try {
  // ... lógica existente ...
} catch (err) {
  console.error('[DesignCanvas] Error al exportar artboard:', err);
  // Notificación visible: añadir un toast/banner temporal en el overlay
}
```

**`design-canvas.jsx` — localStorage**:
```javascript
// Envolver accesos a localStorage en try/catch con fallback silencioso:
try {
  localStorage.setItem(tfKey, JSON.stringify(tf.current));
} catch (err) {
  // localStorage no disponible (modo privado, cuota excedida) — continuar sin persistencia
  console.warn('[DCViewport] localStorage no disponible, viewport no persistirá:', err.message);
}
```

---

### Req 6 — Accesibilidad

**Cambios por componente**:

**`scanner.jsx`**:
```jsx
// Añadir aria-label al input:
<input
  aria-label={copy.inputLabel || "Dominio a analizar"}
  ...
/>
// Añadir role="status" al indicador de estado:
<div className="scanner-status mono" role="status" aria-live="polite">
// Añadir aria-live="polite" a la región de resultados:
<div className="scanner-result" aria-live="polite" aria-atomic="true">
```

**`design-canvas.jsx` — DCFocusOverlay**:
```jsx
// Botón de sección dropdown:
<button
  aria-expanded={ddOpen}
  aria-haspopup="listbox"
  aria-label={`Sección: ${meta.title}. Cambiar sección`}
  ...
>
// Botón de cierre:
<button aria-label="Cerrar vista de foco" ...>×</button>
// Botones de navegación Arrow:
<button aria-label={dir === 'left' ? 'Artboard anterior' : 'Artboard siguiente'} ...>
```

**`app.jsx` — Nav**:
```jsx
// Botones de idioma ya tienen texto visible (ES/EN), no necesitan aria-label.
// Añadir aria-label al botón CTA si solo tiene icono.
```

**`tweaks-panel.jsx`**:
```jsx
// El panel ya tiene aria-label="Close tweaks" en el botón X.
// Añadir manejo de Escape para cerrar el panel (ya implementado via __deactivate_edit_mode).
// Verificar que Tab navega correctamente por los controles (comportamiento nativo de los elementos).
```

---

### Req 7 — Optimización de video

**Cambios en `app.jsx`** — componente `Hero`:

```jsx
function Hero({ copy }) {
  // Detectar conexión lenta para omitir el video
  const slowConnection = React.useMemo(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g');
  }, []);

  return (
    <section className="hero" ...>
      <div className="hero-bg">
        {!slowConnection && (
          <video
            className="hero-video"
            src={(window.__resources && window.__resources.heroVideo) || "assets/hero.mp4"}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"   // ← cambiado de "auto"
            aria-hidden="true"
          />
        )}
        {/* El fondo de gradiente y grid ya existe y se muestra siempre */}
        ...
      </div>
    </section>
  );
}
```

**Nota**: Si el video no carga (error de red), el fondo de gradiente + grid ya está presente en el DOM y se muestra automáticamente porque el `<video>` es `position: absolute` sobre el fondo. No se necesita manejo adicional de error de video.

---

### Req 8 — MutationObserver timeout

**Cambios en `motion.js`**:

```javascript
// Constante nombrada en lugar de literal
var MOTION_OBSERVER_TIMEOUT = 2000; // ms — tiempo máximo de observación tras mount de React

function start() {
  init();
  var startTime = Date.now();
  var mo = new MutationObserver(function () { init(); });
  mo.observe(document.body, { childList: true, subtree: true });
  setTimeout(function () {
    mo.disconnect();
    console.debug('[motion] MutationObserver desconectado tras', Date.now() - startTime, 'ms');
  }, MOTION_OBSERVER_TIMEOUT);
}
```

---

### Req 9 — README

**Estructura del README.md**:

```markdown
# AGENTIC FIRST

Landing page de posicionamiento agéntico. React 18 sin bundler.

## Stack
## Archivos principales
## Cómo ejecutar localmente
## Sistema de tweaks (TWEAK_DEFAULTS, useTweaks, TweaksPanel)
## Bridge window.omelette
## Política de assets
## Convenciones de código
```

---

### Req 10 — Nomenclatura

**Cambios en `app.jsx`**:

```javascript
// Antes:
const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
const c = window.COPY[lang];

// Después:
const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
const copy = window.COPY[lang];
```

Todas las referencias a `t.lang`, `t.accentHue`, etc. se actualizan a `tweaks.lang`, `tweaks.accentHue`, etc. Las referencias a `c.hero`, `c.metrics`, etc. se actualizan a `copy.hero`, `copy.metrics`, etc.

**Excepción**: Variables de una sola letra en callbacks de array (`.map((e) => ...)`, `.filter((s) => ...)`) se mantienen.

**Comentarios**: Todos los comentarios de código se estandarizan en español.

---

### Req 11 — Tests unitarios

**Runner de tests**: Archivo HTML estático `tests.html` en la raíz del proyecto. Usa `console.assert` para tests síncronos y un mini-framework inline para tests asíncronos. Compatible con el entorno sin bundler.

**Funciones a testear**:

1. `hashScore(domain)` — exportada desde `scanner.jsx` via `window.hashScore`
2. `__twkIsLight(hex)` — exportada desde `tweaks-panel.jsx` via `window.__twkIsLight`
3. `useTweaks(defaults)` — hook React, testeable con un componente de prueba mínimo

**Estructura de `tests.html`**:
```html
<!doctype html>
<html>
<head>
  <!-- Mismos CDN que el proyecto principal -->
  <script src="copy.js"></script>
  <script type="text/babel" src="tweaks-panel.jsx"></script>
  <script type="text/babel" src="scanner.jsx"></script>
</head>
<body>
  <div id="test-root"></div>
  <script type="text/babel">
    // Tests de hashScore, __twkIsLight, useTweaks
    // Usando console.assert + fast-check via CDN para property tests
  </script>
</body>
</html>
```

**Librería PBT**: [`fast-check`](https://fast-check.io/) via CDN (`unpkg.com/fast-check/lib/bundle/fast-check.js`). Es la librería de property-based testing más madura para JavaScript, con soporte para generadores arbitrarios y shrinking automático.

---

### Req 12 — Limpieza de assets

**Verificación**: El archivo `uploads/grok-video-cc1a7e78-8da3-4073-81e9-f62cf6ad8c01 (1).mp4` no aparece referenciado en ningún archivo del proyecto (confirmado por búsqueda en todo el código fuente).

**Acción**: Eliminar el archivo. Documentar en README la política de assets.

---

## Modelos de datos

### Estado de DesignCanvas (`.design-canvas.state.json`)

```typescript
interface DesignCanvasState {
  sections: {
    [sectionId: string]: {
      title?: string;           // título editado por el usuario
      order?: string[];         // IDs de artboards en orden persistido
      labels?: { [artboardId: string]: string }; // labels editados
      hidden?: string[];        // IDs de artboards eliminados
      srcKey?: string;          // fingerprint del conjunto de artboards fuente
    }
  }
}
```

### Estado de TweaksPanel (`TWEAK_DEFAULTS`)

```typescript
interface TweakDefaults {
  lang: "es" | "en";
  accentHue: number;        // 0-360
  density: "compact" | "regular" | "comfy";
  showTicker: boolean;
  scannerMode: "interactive";
}
```

### Viewport de DCViewport (`localStorage`)

```typescript
interface ViewportState {
  x: number;    // traslación horizontal en píxeles del mundo
  y: number;    // traslación vertical en píxeles del mundo
  scale: number; // factor de zoom (0.1 – 8)
}
// Clave: 'dc-viewport:' + location.pathname
```

---

## Propiedades de corrección

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Propiedad 1: hashScore es determinista

*Para cualquier* string de dominio no vacío `d`, `hashScore(d)` debe retornar siempre el mismo valor entero cuando se llama múltiples veces con el mismo input.

**Validates: Requirements 11.2**

---

### Propiedad 2: hashScore está acotado en [8, 98]

*Para cualquier* string de dominio no vacío `d`, `hashScore(d)` debe retornar un número entero `n` tal que `8 ≤ n ≤ 98`.

**Validates: Requirements 11.1**

---

### Propiedad 3: __twkIsLight clasifica correctamente por luminancia

*Para cualquier* color hexadecimal válido `hex`, `__twkIsLight(hex)` debe retornar `true` si y solo si la luminancia relativa del color (calculada con los coeficientes estándar 299/587/114) supera el umbral de 148000 (en escala 0–255000).

**Validates: Requirements 11.3**

---

### Propiedad 4: setTweak actualiza el estado con el valor correcto

*Para cualquier* clave `key` y valor `value` válidos, después de llamar `setTweak(key, value)`, el estado de tweaks debe contener `{ [key]: value }` con el valor exacto pasado.

**Validates: Requirements 11.4**

---

### Propiedad 5: Navegación circular en DCFocusOverlay

*Para cualquier* lista de N artboards (N ≥ 1) y cualquier índice inicial `i`, presionar ArrowRight `N` veces consecutivas debe resultar en el mismo artboard activo que el inicial (propiedad de ciclo completo).

**Validates: Requirements 1.6**

---

### Propiedad 6: CSS externo no contiene bloques style embebidos en JSX

*Para cualquier* archivo en `{sections.jsx, app.jsx, scanner.jsx, hero-console.jsx}`, el contenido del archivo no debe contener el patrón `<style>{` (indicador de CSS-en-JS).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

### Propiedad 7: Video hero omitido en conexiones lentas

*Para cualquier* valor de `navigator.connection.effectiveType` igual a `"slow-2g"` o `"2g"`, el componente Hero no debe renderizar el elemento `<video>` en el DOM.

**Validates: Requirements 7.2**

---

## Manejo de errores

| Escenario | Comportamiento actual | Comportamiento objetivo |
|---|---|---|
| Fallo al leer `.design-canvas.state.json` | `.catch(() => {})` silencioso | `console.warn` con nombre de archivo y operación |
| Fallo al escribir via `omelette.writeFile` | `.catch(() => {})` silencioso | `console.warn` con nombre de archivo |
| Fallo en `dcExport` | Sin manejo | `console.error` + notificación visible al usuario |
| `localStorage` no disponible | Excepción no capturada | `try/catch` con `console.warn`, continuar sin persistencia |
| Video hero no carga | Sin manejo explícito | Fondo de gradiente/grid ya presente, no se necesita handler adicional |
| `window.omelette` no disponible | `?.` guard ya presente | Mantener, añadir documentación |

---

## Estrategia de testing

### Enfoque dual

Los tests se organizan en dos capas complementarias:

**Tests de propiedad** (property-based, con `fast-check` via CDN):
- Mínimo 100 iteraciones por propiedad
- Cubren las Propiedades 1–7 definidas arriba
- Se ejecutan en `tests.html` en el navegador

**Tests de ejemplo** (example-based, con `console.assert`):
- Comportamientos específicos de UI (apertura/cierre de overlay, navegación con teclado)
- Verificación de atributos ARIA en el DOM renderizado
- Verificación de configuración (SRI hashes, preload="metadata", MOTION_OBSERVER_TIMEOUT)

### Configuración de tests de propiedad

```javascript
// Etiqueta de referencia para cada test de propiedad:
// Feature: technical-debt-remediation, Property N: <texto de la propiedad>

// Ejemplo — Propiedad 2: hashScore acotado
fc.assert(
  fc.property(
    fc.string({ minLength: 1 }),
    (domain) => {
      const score = window.hashScore(domain);
      return Number.isInteger(score) && score >= 8 && score <= 98;
    }
  ),
  { numRuns: 100 }
  // Feature: technical-debt-remediation, Property 2: hashScore está acotado en [8, 98]
);
```

### Exportaciones necesarias para tests

Para que las funciones puras sean accesibles desde `tests.html`, se añaden al scope global:

```javascript
// En scanner.jsx — añadir al final:
window.hashScore = hashScore;

// En tweaks-panel.jsx — ya exportado implícitamente via window.__twkIsLight
// (la función ya está en scope global al ser definida en el módulo Babel)
window.__twkIsLight = __twkIsLight;
```

### Tests de humo (smoke tests)

Verificaciones de configuración que se ejecutan una sola vez:

- `window.DCPostIt !== undefined` — DCPostIt exportado
- `window.DesignCanvas !== undefined` — DesignCanvas exportado
- `document.querySelector('video[preload="metadata"]')` — video con preload correcto
- Verificar que ningún script CDN carece de atributo `integrity`
- Verificar que `MOTION_OBSERVER_TIMEOUT === 2000` en motion.js

### Cobertura por requisito

| Requisito | Tipo de test | Archivo |
|---|---|---|
| Req 1 (design-canvas) | Smoke + Example | tests.html |
| Req 2 (SRI) | Smoke | tests.html |
| Req 3 (CSS externo) | Property 6 | tests.html |
| Req 4 (estado) | Example | tests.html |
| Req 5 (errores) | Example (mock console) | tests.html |
| Req 6 (a11y) | Example (DOM assertions) | tests.html |
| Req 7 (video) | Property 7 + Smoke | tests.html |
| Req 8 (MutationObserver) | Smoke | tests.html |
| Req 9 (README) | Manual | — |
| Req 10 (nomenclatura) | Manual / linting | — |
| Req 11 (tests) | Properties 1–4 | tests.html |
| Req 12 (assets) | Smoke (file existence) | tests.html / manual |
