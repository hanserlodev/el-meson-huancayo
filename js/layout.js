/* Layout compartido: inyecta header + footer iguales en las 4 páginas.
   Datos reales del local: Av. Giráldez 157, Huancayo. */
(function () {
  const page = document.body.dataset.page || "inicio";
  const link = (href, id, label) =>
    `<a href="${href}" ${page === id ? 'aria-current="page"' : ""} class="nav-link text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors">${label}</a>`;
  const maps = window.Meson?.MAPS_URL || "#";

  document.getElementById("site-header").innerHTML = `
    <div class="bg-ink text-slate-200 text-xs text-center px-4 py-2">
      🔥 Martes de brasa: 1/4 de pollo a S/ 13.90 · Delivery: 939 399 946 · Lun–Dom 11:00–23:00
    </div>
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <a href="index.html" class="flex items-center gap-2.5">
          <img src="imagenes/logo.jpg" alt="Logo Pollos y Parrillas El Mesón" class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-900/10 shadow-card" />
          <span class="leading-tight">
            <span class="block font-display font-bold text-ink">El Mesón</span>
            <span class="block text-[11px] text-slate-500 tracking-wide">POLLOS Y PARRILLAS · DESDE 1985</span>
          </span>
        </a>
        <div class="hidden md:flex items-center gap-7">
          ${link("index.html", "inicio", "Inicio")}
          ${link("carta.html", "carta", "Carta")}
          ${link("carrito.html", "carrito", "Carrito")}
          ${link("reserva.html", "reserva", "Reserva")}
        </div>
        <div class="flex items-center gap-2">
          <a href="carrito.html" class="inline-flex items-center gap-2 bg-ink text-white pl-4 pr-3 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors" aria-label="Ver carrito">
            🛒 <span data-cart-count class="grid place-items-center min-w-[1.5rem] h-6 px-1 rounded-full bg-amber-400 text-ink text-xs font-bold">0</span>
          </a>
          <a href="reserva.html" class="hidden sm:inline-flex bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-700 shadow-card transition-colors">Reservar</a>
          <button id="menu-btn" class="md:hidden w-10 h-10 grid place-items-center rounded-lg ring-1 ring-slate-200 text-xl" aria-label="Abrir menú" aria-expanded="false">☰</button>
        </div>
      </div>
      <div id="menu-movil" class="md:hidden hidden border-t border-slate-100 px-4 py-3 flex gap-5 bg-white">
        ${link("index.html", "inicio", "Inicio")}
        ${link("carta.html", "carta", "Carta")}
        ${link("carrito.html", "carrito", "Carrito")}
        ${link("reserva.html", "reserva", "Reserva")}
      </div>
    </nav>`;

  document.getElementById("site-footer").innerHTML = `
    <footer class="mt-14 bg-ink text-slate-300">
      <div class="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div>
          <p class="flex items-center gap-2.5">
            <img src="imagenes/logo.jpg" alt="Logo Pollos y Parrillas El Mesón" class="w-10 h-10 rounded-lg object-cover ring-1 ring-white/15" />
            <span class="font-display text-lg font-bold text-white">El Mesón</span>
          </p>
          <p class="mt-2 text-slate-400">Empresa familiar huancaína desde 1985. Pollo a la brasa, parrillas al carbón y la famosa ensalada dulce.</p>
        </div>
        <nav aria-label="Explora">
          <p class="font-bold text-white mb-2 text-xs uppercase tracking-widest">Explora</p>
          <ul class="space-y-1.5">
            <li><a class="footer-link" href="index.html">Inicio</a></li>
            <li><a class="footer-link" href="carta.html">Carta</a></li>
            <li><a class="footer-link" href="carrito.html">Carrito</a></li>
            <li><a class="footer-link" href="reserva.html">Reservar mesa</a></li>
          </ul>
        </nav>
        <div>
          <p class="font-bold text-white mb-2 text-xs uppercase tracking-widest">Horario</p>
          <p>Lun – Dom · 11:00 – 23:00<br /><a class="footer-link" href="${maps}" target="_blank" rel="noopener">📍 Av. Giráldez 157, Huancayo</a></p>
        </div>
        <div>
          <p class="font-bold text-white mb-2 text-xs uppercase tracking-widest">Contacto</p>
          <p>Delivery: 939 399 946<br />932 619 097 · 972 346 842</p>
        </div>
      </div>
      <div class="border-t border-white/10">
        <p class="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-500">© 2026 Pollos y Parrillas El Mesón — Proyecto de Práctica Web · Precios referenciales, confírmalos por WhatsApp</p>
      </div>
    </footer>`;

  document.getElementById("menu-btn")?.addEventListener("click", (e) => {
    const m = document.getElementById("menu-movil");
    const open = m.classList.toggle("hidden");
    e.currentTarget.setAttribute("aria-expanded", String(!open));
  });

  window.Cart?.refreshBadges();
})();
