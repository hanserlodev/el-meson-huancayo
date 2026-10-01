# Pollos y Parrillas El Mesón — Next.js

Proyecto web para **Pollos y Parrillas El Mesón** (Huancayo, desde 1985). Migración de sitio legacy estático (`js/`, `css/`) a **Next.js 16 + React 19 + Firestore + Tailwind v4**.

> Stack: `next 16.3.5`, `react 19.2`, `firebase 12`, `typescript strict`, `tailwindcss 4`, `pnpm 11`

---

## 🚀 Setup

```bash
pnpm install
cp .env.example .env.local   # completar NEXT_PUBLIC_FIREBASE_*
pnpm dev                     # http://localhost:3000
pnpm build && pnpm start
pnpm lint                    # eslint (next/core-web-vitals + typescript)
pnpm exec tsc --noEmit       # typecheck strict
```

**Variables (.env.local):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# opcional para admin server: FIREBASE_ADMIN_*
```
Sin `.env` el build usa fallbacks dummy (`lib/firebase/client.ts:6`) y muestra datos locales de `lib/data.ts:16`.

---

## 📁 Estructura

```
app/
  page.tsx          → / (hero + favoritos Firestore)
  layout.tsx        → root layout + CartProvider + fonts (Inter/Sora)
  carta/page.tsx    → /carta (filtros + promos + carrito)
  carrito/page.tsx  → /carrito (checkout + WhatsApp)
  reserva/page.tsx  → /reserva (1-20 pers, 11:00-23:00)
  resenas/page.tsx  → /resenas (C/R cliente)
  ofertas/page.tsx  → /ofertas (R activo)
  admin/page.tsx    → /admin (6 CRUDs + moderación)
  globals.css       → @theme Tailwind + tokens Brasa
  safelist.ts       → safelist Tailwind v4
components/
  Header.tsx, Footer.tsx, AddToCartButton.tsx
lib/
  data.ts           → PLATOS (9), DELIVERY=5, ENVIO_GRATIS_DESDE=35
  stores/cart.tsx   → CartContext (localStorage + WhatsApp)
  firebase/client.ts, admin.ts
  services/
    platos.service.ts, categorias.service.ts, ofertas.service.ts,
    pedidos.service.ts, reservas.service.ts, resenas.service.ts
public/imagenes/    → logo + fotos platos
js/, css/           → legacy vanilla (no usado en Next, ver _legacy/)
```

---

## 🧩 CRUDs (6)

Todos los servicios usan patrón **fallback local** si Firestore vacío/error → `PLATOS_LOCAL`/`CATEGORIAS_LOCAL`/`OFERTAS_LOCAL`. `subscribe*` con `onSnapshot` para realtime.

| Dominio | Colección | Permisos | Páginas |
|---|---|---|---|
| Platos | `platos` | CRUD en /admin, R en / y /carta | `platos.service.ts:7` |
| Categorías | `categorias` | CRUD en /admin | `categorias.service.ts:19` |
| Ofertas | `ofertas` | CRUD + toggle activo | `ofertas.service.ts:25` |
| Pedidos | `pedidos` | C en /carrito, R/U/D en /admin | `pedidos.service.ts:18` |
| Reservas | `reservas` | C en /reserva, R/U/D en /admin | `reservas.service.ts:9` |
| Reseñas | `resenas` | C en /resenas, R/U/D moderación | `resenas.service.ts:16` |

Firestore rules: `firestore.rules`, `storage.rules` (solo admin puede subir `platos/`).

---

## 🎨 Sistema de diseño (DESIGN.md)

Tokens inmutables en `app/globals.css:3` `@theme`:
- **brand** 50-950 (`#ea580c` primary), **ink** `#0f172a`, **accent** `#f59e0b`
- Fonts: `Inter` + `Sora` vía `next/font` (`app/layout.tsx:6`)
- Shadows: `card`, `pop`; anim `aparecer` + `prefers-reduced-motion`

---

## 🧹 Calidad (Arquitecto de Código)

- **ESLint** 0 errors (corregidos `where` no usado, `let`→`const`, `<a>`→`<Link>`, `<img>`→`<Image>`)
- **TS strict** 0 errors
- **Clean Code:** `AddToCartButton` reutilizable, nombres `busqueda`/`matchSearch`, `admin` tab-components extraíbles
- **Dead code eliminado:** `js/` legacy marcado, `adminDb` documentado
- Auditoría completa: ver conversación agente.

---

## 🔗 URLs

- Local: http://localhost:3000
- Sedes: Av. Giráldez 157 · Calle Real 919, Huancayo
- WhatsApp: 51939399946 (`lib/data.ts:120`)
