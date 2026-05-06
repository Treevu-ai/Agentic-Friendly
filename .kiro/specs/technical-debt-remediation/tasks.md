# Plan de Implementación — Remediación de Deuda Técnica (AGENTIC FIRST)

## Resumen

Implementación incremental y no destructiva de la deuda técnica acumulada. No se introduce bundler ni se cambia la arquitectura CDN+Babel. Cada tarea es quirúrgica y reversible. El orden sigue la prioridad definida en el diseño: Crítica → Alta → Media → Baja.

## Tareas

- [x] 1. Eliminar archivo de video no referenciado en uploads/
  - Verificar que `uploads/grok-video-cc1a7e78-8da3-4073-81e9-f62cf6ad8c01 (1).mp4` no aparece en ningún archivo del proyecto
  - Eliminar el archivo del repositorio
  - _Requisitos: 12.1, 12.2_

- [x] 2. Corregir errores silenciosos en design-canvas.jsx
  - [x] 2.1 Reemplazar `.catch(() => {})` en la lectura del sidecar `.design-canvas.state.json`
    - Cambiar el catch vacío por `console.warn('[DesignCanvas] No se pudo leer', DC_STATE_FILE, err)`
    - _Requisitos: 5.1, 5.2_
  - [x] 2.2 Reemplazar `.catch(() => {})` en la escritura via `window.omelette.writeFile`
    - Cambiar el catch vacío por `console.warn('[DesignCanvas] No se pudo escribir', DC_STATE_FILE, err)`
    - _Requisitos: 5.1, 5.3_
  - [x] 2.3 Añadir manejo de errores en `dcExport` con notificación visible al usuario
    - Envolver la lógica de exportación en `try/catch`
    - En el `catch`: llamar `console.error('[DesignCanvas] Error al exportar artboard:', err)` y mostrar un mensaje de error visible en la interfaz (toast o banner temporal en el overlay)
    - _Requisitos: 5.4_
  - [x] 2.4 Proteger accesos a `localStorage` en DCViewport con try/catch
    - Envolver `localStorage.setItem` y `localStorage.getItem` en bloques `try/catch`
    - En el `catch`: `console.warn('[DCViewport] localStorage no disponible, viewport no persistirá:', err.message)` y continuar sin persistencia
    - _Requisitos: 5.5_

- [ ] 3. Checkpoint — Verificar que design-canvas.jsx carga sin errores
  - Abrir `AGENTIC FIRST.html` en el navegador y confirmar que no hay `ReferenceError` ni `SyntaxError` en la consola relacionados con `DCFocusOverlay` o `DCPostIt`
  - Confirmar que `window.DCPostIt !== undefined` y `window.DesignCanvas !== undefined` en la consola
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 4. Documentar design-canvas.jsx (Req 1 — verificación)
  - Añadir comentario de cabecera en `design-canvas.jsx` que liste las funciones exportadas (`DesignCanvas`, `DCPostIt`) y sus contratos de uso
  - Documentar el canal `window.omelette.writeFile` con el comentario de contrato definido en el diseño (Req 4.5)
  - _Requisitos: 1.1, 1.2, 1.7, 4.5_

- [ ] 5. Migrar CSS embebido de sections.jsx a styles.css
  - Extraer todos los bloques `<style>{`...`}</style>` de `sections.jsx`
  - Añadir el CSS extraído a `styles.css` con comentarios delimitadores: `/* ── marquee ── */`, `/* ── metrics ── */`, `/* ── pillars ── */`, `/* ── timeline ── */`, `/* ── cases ── */`, `/* ── pricing ── */`, `/* ── final-cta ── */`, `/* ── footer ── */`
  - Eliminar los bloques `<style>` del JSX
  - _Requisitos: 3.1, 3.5_

- [ ] 6. Migrar CSS embebido de app.jsx a styles.css
  - Extraer todos los bloques `<style>{`...`}</style>` de `app.jsx`
  - Añadir el CSS extraído a `styles.css` bajo el comentario `/* ── hero ── */`
  - Eliminar los bloques `<style>` del JSX
  - _Requisitos: 3.2, 3.5_

- [ ] 7. Migrar CSS embebido de scanner.jsx y hero-console.jsx a styles.css
  - Extraer todos los bloques `<style>{`...`}</style>` de `scanner.jsx` y añadirlos bajo `/* ── scanner ── */`
  - Extraer todos los bloques `<style>{`...`}</style>` de `hero-console.jsx` y añadirlos bajo `/* ── hero-console ── */`
  - Eliminar los bloques `<style>` del JSX en ambos archivos
  - Añadir comentario en `tweaks-panel.jsx` documentando que `__TWEAKS_STYLE` se mantiene como excepción intencionada (componente autocontenido)
  - _Requisitos: 3.3, 3.4, 3.5, 3.7_

- [ ] 8. Verificar que styles.css está referenciado en el HTML principal
  - Confirmar que `AGENTIC FIRST.html` tiene `<link rel="stylesheet" href="styles.css">` (o equivalente)
  - Si no existe, añadir la etiqueta `<link>` en el `<head>`
  - _Requisitos: 3.6_

- [ ] 9. Checkpoint — Verificar comportamiento visual tras migración de CSS
  - Abrir `AGENTIC FIRST.html` en el navegador y confirmar que el aspecto visual es idéntico al estado previo
  - Verificar que ningún archivo JSX (excepto `tweaks-panel.jsx`) contiene el patrón `<style>{`
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 10. Añadir atributos ARIA a scanner.jsx
  - Añadir `aria-label` al `<input>` del Scanner (ej. `aria-label="Dominio a analizar"`)
  - Añadir `role="status"` al indicador de estado del Scanner (READY / RUNNING / DONE)
  - Añadir `aria-live="polite"` y `aria-atomic="true"` a la región de resultados del Scanner
  - _Requisitos: 6.3, 6.6, 6.7_

- [ ] 11. Añadir atributos ARIA a design-canvas.jsx (DCFocusOverlay)
  - Añadir `aria-expanded={ddOpen}` y `aria-haspopup="listbox"` al botón de dropdown de secciones
  - Añadir `aria-label="Cerrar vista de foco"` al botón de cierre del overlay
  - Añadir `aria-label` a los botones de navegación ArrowLeft/ArrowRight (`"Artboard anterior"` / `"Artboard siguiente"`)
  - _Requisitos: 6.2, 6.5_

- [ ] 12. Revisar y completar atributos ARIA en app.jsx y tweaks-panel.jsx
  - Verificar que todos los elementos interactivos sin texto visible tienen `aria-label` o usan `<button>` nativo
  - Verificar que `TweaksPanel` permite cerrar con Escape y navegar con Tab (comportamiento nativo de los elementos)
  - Mantener la implementación existente de `role="switch"` y `aria-checked` en `TweakToggle` como referencia
  - _Requisitos: 6.1, 6.2, 6.4, 6.8_

- [ ] 13. Optimizar carga de video en app.jsx
  - Cambiar `preload="auto"` a `preload="metadata"` en el elemento `<video>` del hero
  - Añadir lógica de detección de conexión lenta con `navigator.connection?.effectiveType`
  - Si `effectiveType` es `"slow-2g"` o `"2g"`, omitir el renderizado del `<video>` (el fondo de gradiente/grid ya está presente)
  - Mantener los atributos `autoPlay`, `muted`, `loop`, `playsInline` y `aria-hidden="true"`
  - _Requisitos: 7.1, 7.2, 7.3, 7.4_

- [ ] 14. Checkpoint — Verificar accesibilidad y video
  - Confirmar en DevTools que el `<input>` del Scanner tiene `aria-label`
  - Confirmar que el `<video>` tiene `preload="metadata"`
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 15. Documentar política SRI en el HTML principal (Req 2)
  - Verificar que los tres scripts CDN (React, ReactDOM, Babel) tienen `integrity` SHA-384 y `crossorigin="anonymous"`
  - Añadir comentario en `AGENTIC FIRST.html` documentando la política de actualización de hashes SRI y el comando `openssl` para recalcularlos
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 16. Documentar contratos de estado en useTweaks (Req 4)
  - Añadir comentario de contrato en `setTweak` dentro de `tweaks-panel.jsx` documentando el orden de operaciones: (1) `setValues` React, (2) `postMessage` al host, (3) `CustomEvent('tweakchange')`
  - Añadir nota explícita de que `window.parent.postMessage` es solo para el host omelette, no para comunicación entre componentes
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 17. Refactorizar MutationObserver en motion.js (Req 8)
  - Extraer el literal `4000` a una constante nombrada `var MOTION_OBSERVER_TIMEOUT = 2000;`
  - Añadir `console.debug('[motion] MutationObserver desconectado tras', Date.now() - startTime, 'ms')` en el callback del `setTimeout`
  - Verificar que el comportamiento de scroll reveals, estado del nav y ripple de botones no tiene regresiones
  - _Requisitos: 8.1, 8.2, 8.3, 8.4_

- [ ] 18. Renombrar variables y estandarizar comentarios en app.jsx (Req 10)
  - Renombrar `t` → `tweaks` y `c` → `copy` en los contextos de estado (no en callbacks de array)
  - Actualizar todas las referencias: `t.lang` → `tweaks.lang`, `t.accentHue` → `tweaks.accentHue`, `c.hero` → `copy.hero`, etc.
  - Estandarizar todos los comentarios del archivo a español
  - _Requisitos: 10.1, 10.2, 10.3, 10.4_

- [ ] 19. Estandarizar comentarios en el resto de archivos JSX y JS (Req 10)
  - Revisar `motion.js`, `dazzle.js`, `scanner.jsx`, `hero-console.jsx`, `sections.jsx`, `design-canvas.jsx` y `tweaks-panel.jsx`
  - Convertir comentarios en inglés a español (excepto términos técnicos estándar como `TODO`, `FIXME`, nombres de API)
  - _Requisitos: 10.2_

- [ ] 20. Checkpoint — Verificar que la aplicación funciona tras refactorizaciones
  - Abrir `AGENTIC FIRST.html` y confirmar que no hay errores en consola
  - Verificar que el TweaksPanel abre/cierra correctamente y los tweaks se aplican
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 21. Exportar funciones puras para tests
  - Añadir `window.hashScore = hashScore;` al final de `scanner.jsx`
  - Añadir `window.__twkIsLight = __twkIsLight;` al final de `tweaks-panel.jsx`
  - _Requisitos: 11.1, 11.2, 11.3_

- [ ] 22. Crear tests.html con runner de tests estático
  - Crear `tests.html` en la raíz del proyecto con la misma estructura CDN que el proyecto principal
  - Incluir `<script src="copy.js"></script>` y los scripts Babel de `tweaks-panel.jsx` y `scanner.jsx`
  - Incluir `fast-check` via CDN (`unpkg.com/fast-check/lib/bundle/fast-check.js`)
  - Crear un mini-framework inline con `console.assert` para tests síncronos y un runner básico para tests asíncronos
  - _Requisitos: 11.5_

- [ ] 23. Implementar tests de ejemplo (example-based) en tests.html
  - [ ] 23.1 Tests de smoke para Req 1: verificar `window.DCPostIt !== undefined` y `window.DesignCanvas !== undefined`
    - _Requisitos: 1.1, 1.2, 1.7_
  - [ ]* 23.2 Tests de smoke para Req 2: verificar que ningún script CDN carece de atributo `integrity`
    - _Requisitos: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 23.3 Tests de smoke para Req 7: verificar `document.querySelector('video[preload="metadata"]')` no es null
    - _Requisitos: 7.1_
  - [ ]* 23.4 Tests de smoke para Req 8: verificar que `MOTION_OBSERVER_TIMEOUT === 2000` (exponer la constante via `window.MOTION_OBSERVER_TIMEOUT` en motion.js)
    - _Requisitos: 8.1, 8.2_
  - [ ]* 23.5 Tests de ejemplo para `__twkIsLight`: verificar `true` para `#ffffff`, `#f0f0f0` y `false` para `#000000`, `#111111`
    - _Requisitos: 11.3_

- [ ] 24. Implementar property tests en tests.html
  - [ ] 24.1 Implementar property test para Propiedad 1: hashScore es determinista
    - Para cualquier string no vacío `d`, `hashScore(d) === hashScore(d)` (llamadas múltiples retornan el mismo valor)
    - Usar `fc.string({ minLength: 1 })` como generador
    - **Propiedad 1: hashScore es determinista**
    - **Valida: Requisito 11.2**
  - [ ]* 24.2 Implementar property test para Propiedad 2: hashScore acotado en [8, 98]
    - Para cualquier string no vacío `d`, `Number.isInteger(score) && score >= 8 && score <= 98`
    - Usar `fc.string({ minLength: 1 })` como generador, mínimo 100 iteraciones
    - **Propiedad 2: hashScore está acotado en [8, 98]**
    - **Valida: Requisito 11.1**
  - [ ]* 24.3 Implementar property test para Propiedad 3: __twkIsLight clasifica por luminancia
    - Para cualquier color hexadecimal válido, verificar que el resultado es consistente con la luminancia calculada con coeficientes 299/587/114
    - Usar `fc.tuple(fc.integer({min:0,max:255}), fc.integer({min:0,max:255}), fc.integer({min:0,max:255}))` como generador
    - **Propiedad 3: __twkIsLight clasifica correctamente por luminancia**
    - **Valida: Requisito 11.3**
  - [ ]* 24.4 Implementar property test para Propiedad 6: archivos JSX no contienen `<style>{`
    - Verificar que el contenido de `sections.jsx`, `app.jsx`, `scanner.jsx`, `hero-console.jsx` no contiene el patrón `<style>{` (fetch de los archivos desde tests.html)
    - **Propiedad 6: CSS externo no contiene bloques style embebidos en JSX**
    - **Valida: Requisitos 3.1, 3.2, 3.3, 3.4**

- [ ] 25. Implementar property test para Propiedad 4: setTweak actualiza el estado
  - [ ] 25.1 Crear componente React de prueba mínimo en tests.html que use `useTweaks`
    - El componente debe exponer el estado actual y la función `setTweak` via `window.__testTweaks`
    - _Requisitos: 11.4_
  - [ ]* 25.2 Implementar property test para Propiedad 4
    - Para cualquier clave `key` y valor `value` válidos, después de `setTweak(key, value)`, el estado debe contener `{ [key]: value }`
    - Usar `fc.constantFrom(...Object.keys(TWEAK_DEFAULTS))` como generador de claves
    - **Propiedad 4: setTweak actualiza el estado con el valor correcto**
    - **Valida: Requisito 11.4**

- [ ] 26. Checkpoint — Ejecutar tests.html y verificar que todos los tests pasan
  - Abrir `tests.html` en el navegador y confirmar que no hay fallos en la consola
  - Verificar que los property tests de fast-check completan sin contraejemplos
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 27. Crear README.md en la raíz del proyecto
  - Escribir sección "Stack": React 18 CDN + Babel standalone, sin bundler
  - Escribir sección "Archivos principales": tabla con nombre de archivo y responsabilidad para cada archivo del proyecto
  - Escribir sección "Cómo ejecutar localmente": instrucciones para servidor HTTP estático (ej. `python -m http.server 8080` o `npx serve .`)
  - Escribir sección "Sistema de tweaks": documentar `TWEAK_DEFAULTS`, `useTweaks`, `TweaksPanel` y cómo añadir nuevos controles
  - Escribir sección "Bridge window.omelette": documentar cuándo está disponible y qué métodos expone
  - Escribir sección "Política de assets": videos de producción en `assets/`, archivos temporales no deben commitearse
  - Escribir sección "Convenciones de código": idioma de comentarios (español), nomenclatura, excepción de `__TWEAKS_STYLE`
  - El README debe estar escrito en español
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 12.3_

- [ ] 28. Checkpoint final — Verificar el estado completo del proyecto
  - Confirmar que no hay archivos en `uploads/` con videos no referenciados
  - Confirmar que `AGENTIC FIRST.html` carga sin errores en consola
  - Confirmar que `tests.html` ejecuta todos los tests sin fallos
  - Confirmar que `README.md` existe y está completo
  - Preguntar al usuario si hay dudas o ajustes finales.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que implementa para trazabilidad
- Los checkpoints garantizan validación incremental antes de continuar
- El proyecto mantiene la arquitectura CDN+Babel sin introducir bundler en ningún momento
- `tweaks-panel.jsx` mantiene `__TWEAKS_STYLE` como excepción documentada (componente autocontenido)
- Los property tests usan `fast-check` via CDN y se ejecutan en el navegador desde `tests.html`
