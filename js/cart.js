/* Módulo carrito: estado + persistencia + render. Sin onclick inline. */
window.Cart = (function () {
  const KEY = "carrito-meson";
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; }

  const soles = (n) => n.toFixed(2);
  const guardar = () => localStorage.setItem(KEY, JSON.stringify(items));
  const total = () => items.reduce((a, i) => a + i.precio * i.cant, 0);
  const unidades = () => items.reduce((a, i) => a + i.cant, 0);

  function refreshBadges() {
    document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent = unidades(); });
    document.querySelectorAll("[data-cart-total]").forEach(el => { el.textContent = soles(total()); });
  }

  function agregar(nombre, precio) {
    const it = items.find(i => i.nombre === nombre);
    if (it) it.cant++;
    else items.push({ nombre, precio: Number(precio), cant: 1 });
    guardar(); refreshBadges(); renderActual();
    window.Toast?.(`${nombre} agregado al carrito`);
  }
  function cambiar(pos, n) {
    if (!items[pos]) return;
    items[pos].cant += n;
    if (items[pos].cant <= 0) items.splice(pos, 1);
    guardar(); refreshBadges(); renderActual();
  }
  function eliminar(pos) {
    const [q] = items.splice(pos, 1);
    guardar(); refreshBadges(); renderActual();
    if (q) window.Toast?.(`${q.nombre} eliminado`);
  }
  function vaciar() {
    if (!items.length) return window.Toast?.("El carrito ya está vacío");
    items = []; guardar(); refreshBadges(); renderActual();
    window.Toast?.("Carrito vaciado");
  }
  function finalizar() {
    if (!items.length) return window.Toast?.("El carrito está vacío");
    const t = soles(total()), n = unidades();
    window.Toast?.(`Pedido registrado: ${n} plato(s) por S/ ${t}`);
    alert(`¡Pedido realizado en Pollos y Parrillas El Mesón!\n${n} plato(s) · Total: S/ ${t}`);
    items = []; guardar(); refreshBadges(); renderActual();
  }

  // Arma el mensaje para pedir por el WhatsApp real del local.
  function pedirPorWhatsApp() {
    if (!items.length) return window.Toast?.("El carrito está vacío");
    const lineas = items.map(i => `• ${i.cant}x ${i.nombre} — S/ ${soles(i.precio * i.cant)}`);
    const msg = `Hola El Mesón, quiero pedir:\n${lineas.join("\n")}\nTotal: S/ ${soles(total())}`;
    window.open(`https://wa.me/${window.Meson.WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function fila(item, i) {
    const sub = item.precio * item.cant;
    return `
      <div class="flex flex-wrap justify-between items-center gap-2 bg-white p-3 rounded-xl ring-1 ring-slate-900/5 shadow-sm">
        <span class="font-medium text-sm md:text-[15px]"><b>${item.nombre}</b> <span class="text-slate-400">· S/ ${soles(item.precio)}</span></span>
        <div class="flex items-center gap-2">
          <button data-action="dec" data-pos="${i}" aria-label="Quitar uno" class="w-8 h-8 grid place-items-center bg-slate-100 rounded-lg font-bold hover:bg-ink hover:text-white active:scale-95 transition">−</button>
          <b class="w-6 text-center">${item.cant}</b>
          <button data-action="inc" data-pos="${i}" aria-label="Agregar uno" class="w-8 h-8 grid place-items-center bg-slate-100 rounded-lg font-bold hover:bg-ink hover:text-white active:scale-95 transition">+</button>
          <span class="text-brand-700 font-bold w-20 text-right text-sm">S/ ${soles(sub)}</span>
          <button data-action="del" data-pos="${i}" aria-label="Eliminar" class="bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold hover:bg-red-600 active:scale-95 transition">✕</button>
        </div>
      </div>`;
  }

  function vacioHTML() {
    const enCarta = document.body.dataset.page === "carta";
    return `
      <div class="text-center py-8">
        <p class="text-slate-500 italic font-medium">Carrito vacío… ¡la brasa te espera!</p>
        ${enCarta
          ? `<p class="mt-3 text-sm font-bold text-brand-700">Agrega algo rico de la carta</p>`
          : `<a href="carta.html" class="inline-block mt-3 text-sm font-bold text-brand-700 hover:underline">Ver carta →</a>`}
      </div>`;
  }

  // Renderiza en #lista-carrito si existe (página carrito).
  function renderActual() {
    const cont = document.getElementById("lista-carrito");
    if (!cont) return;
    cont.innerHTML = items.length ? items.map(fila).join("") : vacioHTML();
    if (document.body.dataset.page === "carrito" && window.Resumen) window.Resumen();
  }

  // Delegación global: [data-add] y [data-action].
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) return agregar(add.dataset.nombre, add.dataset.precio);
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const pos = Number(b.dataset.pos);
    if (b.dataset.action === "inc") cambiar(pos, 1);
    if (b.dataset.action === "dec") cambiar(pos, -1);
    if (b.dataset.action === "del") eliminar(pos);
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderActual(); refreshBadges();
    document.getElementById("btn-pagar")?.addEventListener("click", finalizar);
    document.getElementById("btn-whatsapp")?.addEventListener("click", pedirPorWhatsApp);
    document.getElementById("btn-vaciar")?.addEventListener("click", vaciar);
  });

  return { agregar, cambiar, eliminar, vaciar, finalizar, pedirPorWhatsApp, renderActual, refreshBadges, total, unidades, soles, get: () => items };
})();
