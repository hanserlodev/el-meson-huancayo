"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/stores/cart";
import { crearPedido } from "@/lib/services/pedidos.service";
import { DELIVERY, ENVIO_GRATIS_DESDE } from "@/lib/data";

export default function CarritoPage() {
  const { items, total, soles, cambiar, eliminar, vaciar, pedirPorWhatsApp } = useCart();
  const [modo, setModo] = useState<"delivery"|"pickup">("delivery");
  const [nombre, setNombre] = useState("Rodrigo Vilchez");
  const [tel, setTel] = useState("964 123 456");
  const [dir, setDir] = useState("Jr. Puno 450, Int 2B");
  const [pago, setPago] = useState("Yape / Plin");
  const [notas, setNotas] = useState("");
  const [cupon, setCupon] = useState("");
  const [msg, setMsg] = useState<string|null>(null);

  const subtotal = total;
  const deliveryFee = modo==="pickup" || subtotal>=ENVIO_GRATIS_DESDE ? 0 : DELIVERY;
  const totalPagar = subtotal + deliveryFee;
  const falta = Math.max(0, ENVIO_GRATIS_DESDE - subtotal);

  const confirmar = async () => {
    if(!items.length) return setMsg("Carrito vacío");
    if(!nombre.trim()|| !tel.trim()) return setMsg("Completa nombre y teléfono");
    if(modo==="delivery" && !dir.trim()) return setMsg("Ingresa dirección");
    try{
      await crearPedido(items, totalPagar, { nombre, tel, direccion: dir });
      setMsg("¡Pedido enviado a comandas! Te contactaremos.");
      vaciar();
    }catch(e){ setMsg(e instanceof Error? e.message:"Error al crear pedido"); }
  };

  const preview = items.length ? `🍗 *PEDIDO EL MESÓN*\n${items.map(i=>`${i.cant}x ${i.nombre} — S/ ${soles(i.precio*i.cant)}`).join("\n")}\nSubtotal S/ ${soles(subtotal)}\nDelivery ${deliveryFee===0?"GRATIS":`S/ ${soles(deliveryFee)}`}\nTOTAL S/ ${soles(totalPagar)}\nCliente: ${nombre}\nTel: ${tel}\n${modo==="delivery"?`Dir: ${dir}\n`:"Recojo: Giráldez 157\n"}Pago: ${pago}${notas?`\nNotas: ${notas}`:""}` : "Carrito vacío";

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <Link href="/carta" className="inline-flex items-center gap-1 text-brand-600 font-semibold text-sm hover:underline"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Seguir explorando la carta</Link>
            <h1 className="text-3xl font-display font-bold text-ink mt-2">Tu pedido <span className="text-slate-400 font-normal text-xl">/ Carrito</span></h1>
            <p className="text-sm text-slate-500 mt-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span> Horno de leña y carbón activo · Giráldez 157</p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-orange-50 grid place-items-center text-brand-600"><span className="material-symbols-outlined">timer</span></div>
            <div><div className="text-xs text-slate-500">Tiempo estimado</div><div className="font-semibold">30 - 45 min en Huancayo</div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="font-bold text-ink">Platos en comanda</span><span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-brand-700 text-xs font-bold">{items.length} ítems</span></div>
              <button onClick={vaciar} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">delete_sweep</span>Vaciar todo</button>
            </div>

            <div className="flex flex-col gap-4">
              {!items.length ? (
                <div className="bg-white rounded-xl p-12 text-center flex flex-col items-center gap-3 ring-1 ring-slate-200">
                  <span className="material-symbols-outlined text-5xl text-slate-300">remove_shopping_cart</span>
                  <p className="font-bold text-ink">Tu carrito está vacío</p>
                  <p className="text-sm text-slate-500">¿Listo para saborear nuestro pollo a la leña?</p>
                  <Link href="/carta" className="mt-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold">Explorar la carta</Link>
                </div>
              ) : items.map((it,i)=>(
                <article key={i} className="bg-white rounded-xl p-5 shadow-sm flex gap-4 ring-1 ring-slate-900/5">
                  <div className="w-28 h-28 rounded-lg bg-slate-100 shrink-0 grid place-items-center text-slate-400"><span className="material-symbols-outlined">restaurant</span></div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-ink">{it.nombre}</h3>
                      <button onClick={()=>eliminar(i)} className="text-slate-400 hover:text-red-600"><span className="material-symbols-outlined text-[20px]">close</span></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                          <button onClick={()=>cambiar(i,-1)} className="w-8 h-8 grid place-items-center bg-white rounded shadow-sm">−</button>
                          <span className="w-10 text-center font-semibold">{it.cant}</span>
                          <button onClick={()=>cambiar(i,1)} className="w-8 h-8 grid place-items-center bg-white rounded shadow-sm">+</button>
                        </div>
                        <span className="text-sm text-slate-500">Unit. S/ {soles(it.precio)}</span>
                      </div>
                      <span className="font-bold text-ink">S/ {soles(it.precio*it.cant)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-brand-600">edit_note</span><span className="font-bold text-sm">Instrucciones para cocina</span></div>
                <textarea value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej: pollo bien tostado, ají sin cebolla..." rows={2} className="w-full bg-slate-100 p-3 rounded-lg text-sm focus:outline-none focus:bg-white ring-1 ring-transparent focus:ring-brand-600"></textarea>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-amber-600">sell</span><span className="font-bold text-sm">Cupón</span></div>
                <div className="flex gap-2"><input value={cupon} onChange={e=>setCupon(e.target.value.toUpperCase())} placeholder="MESON10" className="flex-1 bg-slate-100 px-3 py-2.5 rounded-lg text-sm uppercase focus:outline-none"/><button onClick={()=>setMsg(cupon==="MESON10"?"Cupón 10% aplicado (demo)":"Cupón no válido")} className="px-4 py-2.5 rounded-lg bg-ink text-white text-sm font-semibold">Aplicar</button></div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl p-6 shadow-md ring-1 ring-slate-900/5 flex flex-col gap-5">
              <div className="flex items-center justify-between"><h2 className="font-bold text-ink">Resumen de cuenta</h2><span className="text-xs font-bold tracking-wider text-brand-600 uppercase">En directo</span></div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600">Modalidad</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button onClick={()=>setModo("delivery")} className={`py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 ${modo==="delivery"?"bg-brand-600 text-white shadow":"text-slate-500"}`}><span className="material-symbols-outlined text-[18px]">moped</span>Delivery</button>
                  <button onClick={()=>setModo("pickup")} className={`py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-1.5 ${modo==="pickup"?"bg-brand-600 text-white shadow":"text-slate-500"}`}><span className="material-symbols-outlined text-[18px]">storefront</span>Recojo</button>
                </div>
                {modo==="pickup" && <div className="p-2.5 rounded-lg bg-amber-50 text-sm flex gap-2"><span className="material-symbols-outlined text-brand-600 text-[18px]">location_on</span>Recojo en <b>Av. Giráldez 157</b> (caja express)</div>}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold">Nombre y Apellido<input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="¿A nombre de quién?" className="mt-1 w-full h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none focus:bg-white ring-1 focus:ring-brand-600"/></label>
                <label className="text-xs font-semibold">Teléfono / WhatsApp<div className="mt-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+51</span><input value={tel} onChange={e=>setTel(e.target.value)} className="w-full h-11 pl-12 pr-3 bg-slate-100 rounded-lg text-sm focus:outline-none"/></div></label>
                {modo==="delivery" && <label className="text-xs font-semibold">Dirección y referencia<input value={dir} onChange={e=>setDir(e.target.value)} placeholder="Calle, número..." className="mt-1 w-full h-11 px-3 bg-slate-100 rounded-lg text-sm focus:outline-none"/></label>}
                <label className="text-xs font-semibold">Método de pago<select value={pago} onChange={e=>setPago(e.target.value)} className="mt-1 w-full h-11 px-3 bg-slate-100 rounded-lg text-sm"><option>Yape / Plin</option><option>Efectivo</option><option>Tarjeta POS</option></select></label>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-semibold">S/ {soles(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery</span><span className={`font-bold ${deliveryFee===0?"text-emerald-600":"text-ink"}`}>{deliveryFee===0?"S/ 0.00":`S/ ${soles(deliveryFee)}`}</span></div>
                {modo==="delivery" && falta>0 && subtotal>0 && <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">Te falta S/ {soles(falta)} para delivery gratis</div>}
                {(deliveryFee===0 && subtotal>0) && <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg flex gap-2 text-xs font-semibold"><span className="material-symbols-outlined text-[18px]">check_circle</span>{modo==="pickup"?"Recojo sin costo":"¡Delivery Gratis por superar S/ 35!"}</div>}
                <div className="flex justify-between items-baseline pt-2"><span className="font-bold">Total a pagar</span><span className="text-xl font-bold text-brand-600">S/ {soles(totalPagar)}</span></div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={pedirPorWhatsApp} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>Pedir por WhatsApp</button>
                <button onClick={confirmar} className="w-full h-11 rounded-xl bg-ink text-white font-semibold flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[18px]">verified</span>Confirmar pedido en línea</button>
                {msg && <div className="text-sm p-3 rounded-lg bg-amber-50 text-amber-800">{msg}</div>}
              </div>

              <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold uppercase text-slate-500">Vista previa WhatsApp</span><span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span></div>
                <pre className="bg-slate-50 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{preview}</pre>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
