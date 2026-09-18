# DESIGN.md — Pollos y Parrillas El Mesón

> Sistema de diseño inmutable para rework completo del front en **Stitch**.
> Fuente técnica: `js/tailwind-config.js:4`, `css/base.css:3`, `app/globals.css:3`, `imagenes/logo.jpg`.

---

## 1. Principios Inmutables

| Token | Valor | No negociable |
|---|---|---|
| **Paleta Brasa** | `brand` 50-950 (ver §2) | **SI** — identidad fuego/carbón |
| **Ink** | `#0f172a` | **SI** — nav, footer, CTA primario |
| **Logo** | `public/imagenes/logo.jpg` / `imagenes/logo.jpg` | **SI** — no rediseñar, solo adaptar |
| **Tipografía** | `Inter` (sans) + `Sora` (display) | **SI** — via `next/font` variables `--font-inter/--font-sora` |

Todo lo demás (layout, iconografía, ilustración, fotografía) puede re-trabajarse en Stitch siempre que respete estos 4.

---

## 2. Color — Paleta Brasa (única fuente)

Definida en `tailwind-config.js:8` y `app/globals.css:4` via `@theme`. **No cambiar hex.**

```
brand-50  #fff7ed
brand-100 #ffedd5
brand-200 #fed7aa
brand-300 #fdba74
brand-400 #fb923c
brand-500 #f97316
brand-600 #ea580c  // PRIMARY CTA, hover card, nav underline
brand-700 #c2410c  // PRIMARY hover/active, scrollbar, seleccion
brand-800 #9a3412
brand-900 #7c2d12
brand-950 #431407

ink     #0f172a  // body text, nav sticky, footer bg, botón oscuro
accent  #f59e0b  // outline focus css/base.css:28, selección secundaria
slate   #f8fafc bg + radial dots css/base.css:12, #f1f5f9 scrollbar track
amber-400 #fbbf24 / #facc15 // badge carrito, CTA "Reservar ahora" hero
```

**Usos semánticos:**
- `bg-ink text-white` → header barra superior, nav carrito pill, footer, CTA primario hero
- `bg-brand-600 -> brand-700 hover` → agregar al carrito, filtros activos
- `bg-white ring-slate-900/5 shadow-card` → cards platos
- `text-brand-600` → eyebrow "Los favoritos", precio destacado
- `selection: brand-700` `css/base.css:25`

**Prohibido:** introducir otro naranja/rojo que compita. Neutros solo `slate`/`white`/`ink`.

---

## 3. Tipografía

- **Sans:** `Inter 400/500/600/700` → body, labels, nav, cards `font-sans`
- **Display:** `Sora 700/800` → H1/H2 precio/hero `font-display`
- Carga: `next/font/google` con `display:swap`, variables `--font-inter` `--font-sora` en `app/layout.tsx:6`
- Escala:
  - Hero H1 `text-4xl md:text-5xl font-extrabold leading-[1.08]`
  - Sección H2 `text-2xl md:text-3xl font-bold`
  - Eyebrow `text-xs font-bold uppercase tracking-[0.18em] text-brand-600`
  - Body `text-sm md:text-base text-slate-600`

---

## 4. Logo

- Archivo: `public/imagenes/logo.jpg` (cuadrado, fondo claro)
- Usos:
  - Nav `w-9 h-9 rounded-xl ring-1 ring-slate-900/10 shadow-card` `components/Header.tsx:34`
  - Footer `w-10 h-10 rounded-lg ring-white/15`
- No estirar, no cambiar colores, no agregar sombra dura. En Stitch usar contenedor `ring-1` sutil, nunca `drop-shadow` fuerte.
- Favicon = mismo logo.

**Falta por definir (pedir a cliente/Stitch):** versión vectorial SVG (hoy es JPG), versión monograma para `w-6` y versión horizontal si se necesita.

---

## 5. Fotografía / Imagen

- Estilo actual: foto real pollo a la brasa, parrillas al carbón, fondo cálido, iluminación natural. Mantener.
- Assets: `public/imagenes/{cuarto-brasa.png, pollo-entero.jpg, pollo-parrilla.jpg, mixto.jpg, brocheta.jpg, anticuchos.jpg, chaufa.jpg, chicha.jpg, gaseosa.jpg}`
- Tratamiento: `object-cover rounded-2xl/3xl`, hover `scale-105 duration-500`, badge flotante `badge-float shadow 0 6px 18px -6px rgba(15,23,42,.4)`
- **Pendiente Stitch:** definir si se migra a `next/image` optimizado o se queda `<img>` (hoy warning lint, build ok). Recomendado `next/image` + `webp`.

---

## 6. Layout & Grid

- Contenedor: `max-w-6xl mx-auto px-4`
- Nav: sticky `bg-white/80 backdrop-blur-md border-b border-slate-200` + barra `bg-ink text-xs` superior
- Hero: `hero-docs` radial gradients `brand` `layout.css:12` + `hero-grid` linear grid 36px + mask fade 88% → 100%
- Cards: `grid sm:grid-cols-2 lg:grid-cols-3 gap-5`, stagger `aparecer .5s` `components.css:7`
- Footer: `bg-ink` 4 cols `sm:grid-cols-2 md:grid-cols-4`
- Sticky footer technique `body flex-col min-h-dvh > main flex-1` `css/base.css:15`

---

## 7. Componentes (API para Stitch)

**Botón primario:** `bg-ink text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 hover:-translate-y-0.5 shadow-card`
**Botón brasa:** `bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 active:scale-95`
**CTA amber:** `bg-amber-400 text-ink font-bold px-7 py-3 rounded-xl hover:bg-amber-300`
**Chip filtro:** `px-4 py-2 rounded-full ring-1 ring-slate-900/10 bg-white` / activo `chip-active bg-ink text-white` `components.css:16`
**Card plato:** `bg-white rounded-2xl ring-1 ring-slate-900/5 shadow-card overflow-hidden hover:shadow-pop hover:-translate-y-1`
**Badge:** `bg-white/95 text-ink text-xs font-bold px-3 py-1 rounded-full badge-float` / precio `bg-ink/90 text-white`
**Input:** `border-slate-200 bg-slate-50 p-3 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100`
**Toast:** `#toast fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-pop` `layout.css:27`

Shadows: `card: 0 1px 2px rgba(15,23,42,.06),0 8px 24px -12px rgba(15,23,42,.18)` | `pop: 0 12px 40px -12px rgba(234,88,12,.45)`

---

## 8. Motion & Accesibilidad

- `aparecer` translateY 14px + opacity .5s, delay stagger .07s
- `prefers-reduced-motion` desactiva animation/transition `css/base.css:41`
- `focus-visible: 3px solid rgba(245,158,11,.7)` `css/base.css:27`
- `aria-current="page"` en nav, `aria-live` en carrito, `sr-only` legends
- Scrollbar `w-11 brand-700` `css/base.css:33`

---

## 9. Qué falta para Stitch — Data a pedir

Marca como `TODO` antes de generar pantallas en Stitch:

1. **Logo vector** SVG + versión monocromo (¿existe? solo hay JPG)
2. **Paleta extendida:** ¿se permite `green-500` para WhatsApp o se mantiene solo brand? (hoy `bg-green-500` en carrito)
3. **Fotografía final:** ¿las 9 imágenes son definitivas o habrá sesión nueva?
4. **Tonos de texto:** ¿`ink` es único negro o se acepta `slate-800`?
5. **Iconografía:** ¿lucide/heroicons o custom SVG fuego? (hoy 3 SVG inline hero)
6. **Copy definitivo:** precios `S/ 10.90 vs 13.90 martes` — ¿cuál es referencia para Stitch?
7. **Estados vacíos/ilustraciones:** carrito vacío, reserva confirmada
8. **Breakpoints Stitch:** ¿mobile 360, tablet 768, desktop 1280?
9. **Modo oscuro:** ¿se soporta? (hoy no, `globals.css` tiene media dark pero no usado)
10. **Entregables Stitch:** ¿Figma auto-layout o solo HTML/Tailwind?

> Con solo colores+logo+tipografía puedes iniciar Stitch. Pega este DESIGN.md como prompt de sistema + adjunta `public/imagenes/logo.jpg` y `@theme` de `app/globals.css`.

---

## 10. Referencias técnicas

- `app/globals.css:1` → `@import "tailwindcss"` + `@theme` (fuente verdad)
- `js/tailwind-config.js:4` → origen legacy (migrado)
- `components/Header.tsx:34` / `Footer.tsx:10` → uso logo
- `firestore.rules:3` / `storage.rules:1` → no afecta diseño, pero limita upload imágenes admin-only
