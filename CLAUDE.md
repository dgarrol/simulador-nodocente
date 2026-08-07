# CLAUDE.md

Este archivo brinda guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Comandos

- `npm run dev` — inicia el servidor de desarrollo de Vite con HMR
- `npm run build` — build de producción (genera `dist/`)
- `npm run preview` — previsualiza el build de producción localmente
- `npm run lint` — corre ESLint sobre el proyecto

No hay suite de tests/framework de testing configurado en este repo.

## Qué es esto

Un simulador salarial de página única ("Simulador Salarial Nodocente") para personal nodocente de universidades argentinas, que calcula el desglose de un recibo de sueldo (haberes/descuentos) bajo el convenio colectivo CCT 366/06. Es una calculadora puramente client-side — sin backend, sin routing, sin persistencia.

## Arquitectura

- **Todo vive en `src/App.jsx`.** No hay separación en componentes, no hay librería de manejo de estado, y no hay routing. El archivo tiene tres partes, en orden: datos de dominio estáticos (`PERIODOS`, constantes), la lógica de negocio `calculateSalary` dentro del componente `App`, y el JSX del formulario/recibo. Al hacer cambios, conviene mantener esta forma en vez de introducir abstracciones prematuras — pero si un cambio hace crecer el archivo considerablemente, separar la data de la grilla salarial y la función de cálculo fuera del componente es el refactor natural a hacer primero.

- **`PERIODOS` es una grilla salarial hardcodeada** indexada por período (ej. `mayo2026`, `junio2026`), cada una con un objeto `grid` indexado por número de categoría (1–7). El comentario en el código aclara explícitamente que esto simula una tabla de paritarias que normalmente viviría en una base de datos — agregar un nuevo período implica sumar una nueva entrada fechada acá con sus propios valores por categoría (básico, adicionales por título, antigüedad, escalones de permanencia, grado, capacitación, garantía, bono).

- **`calculateSalary` es la lógica de dominio**, que se ejecuta al enviar el formulario. Es sensible al orden y codifica reglas reales del convenio colectivo — hay que leerla completa antes de modificar cualquier línea suelta:
  - "Categoría de Revista" (`catRevista`) vs. "Mayor Responsabilidad" (`catMayorResp`): cuando alguien subroga un cargo superior, la categoría efectiva de la grilla (`effectiveCat`) usada para básico/título/grado/capacitación viene de la categoría de MR, pero **la Permanencia siempre se calcula sobre la Categoría de Revista original** (`revistaData`), no sobre la efectiva — esta separación es una regla deliberada, no un descuido.
  - `remunerativo: true/false` en cada ítem de haber controla si cuenta para la `baseImponible` (la base usada para todos los descuentos porcentuales). Solo los ítems remunerativos alimentan la base; `totalHaberes` suma todo sin distinción.
  - Varios adicionales/descuentos de tasa fija referencian el básico de *otra* categoría distinta a la seleccionada (ej. Fallo de Caja = 25% del básico de la categoría 7; Socio Deportes = 1% del básico de la categoría 6) — estos números de categoría son fijos por el convenio, no se derivan del estado del formulario.
  - La validación es mínima (basada en `alert()`): la categoría de MR debe ser numéricamente inferior a la Categoría de Revista (número menor = jerarquía superior), y la permanencia no puede superar la antigüedad.

- **El estilo usa Tailwind CSS v4** vía `@tailwindcss/vite`, incorporado mediante la única línea `@import "tailwindcss";` en `src/index.css`. Las clases utilitarias se usan inline en el JSX en todo el archivo; no hay una capa separada de tokens de diseño/tema. `src/App.css` es CSS remanente de la plantilla de Vite que **no se importa en ningún lado** — se puede ignorar (o eliminar si se hace limpieza).

- **`src/App.jsx.bkp`** es un backup suelto de una revisión anterior (todavía visible en diffs con textos de labels más viejos, sin los sufijos `%`). No forma parte del build; no usarlo como referencia del comportamiento actual.

- El formateo de moneda siempre pasa por `formatCurrency` (`Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`) — reutilizarlo en vez de formatear montos de forma manual.

## Idioma

Todas las respuestas y los comentarios de código en este proyecto deben estar en español.
