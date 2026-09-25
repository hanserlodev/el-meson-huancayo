"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { crearReserva, type Sede } from "@/lib/services/reservas.service";

export default function ReservaPage() {
  const [sede, setSede] = useState<Sede>("Giráldez");
  const [zona, setZona] = useState("Salón Principal");
  const [personas, setPersonas] = useState(2);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [hora, setHora] = useState("12:30");
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [ok, setOk] = useState(false);

  const horasAlmuerzo = ["12:30","13:00","13:30","14:15","15:00"];
  const horasCena = ["19:00","19:30","20:15","21:00","21:45"];
  const horas = sede==="Giráldez" ? [...horasAlmuerzo, ...horasCena] : horasAlmuerzo;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setOk(false);
    try{
      await crearReserva({ nombre, tel, personas, fecha, hora, sede, zona });
      setOk(true); setMsg("¡Reserva confirmada! Te llamamos para validar.");
      setNombre(""); setTel(""); setNota("");
    }catch(err){ setMsg(err instanceof Error? err.message:"Error"); }
  };

  const today = new Date().toISOString().slice(0,10);

  return (
    <div className="min-h-screen bg-bg-canvas">
      <Header />
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold uppercase"><span className="material-symbols-outlined text-[16px]">table_restaurant</span>Reservaciones Huancayo</span>
          <h1 className="text-3xl font-display font-bold text-ink mt-3">Reserva tu mesa <span className="text-brand-600">·</span> Te guardamos sitio</h1>
          <p className="text-slate-600 max-w-2xl mt-2">Asegura tu mesa en Giráldez 157 o Calle Real 919 en menos de 1 minuto. Tradición a la leña lista.</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8">
        <form onSubmit={submit} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-md ring-1 ring-slate-900/5 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-ink mb-3"><span className="w-7 h-7 rounded-full bg-brand-600 text-white grid place-items-center text-sm">1</span>Elige tu Sede</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["Giráldez","Real"] as Sede[]).map(s=>(
                <button key={s} type="button" onClick={()=>setSede(s)} className={`text-left p-4 rounded-xl ring-1 ${sede===s?"ring-2 ring-brand-600 bg-orange-50":"ring-slate-200 bg-slate-50"}`}>
                  <div className="flex justify-between"><span className="font-bold text-ink">Sede {s}</span><span className={`material-symbols-outlined ${sede===s?"text-brand-600":"text-slate-300"}`}>{sede===s?"check_circle":"radio_button_unchecked"}</span></div>
                  <div className="text-sm text-slate-500">{s==="Giráldez"?"Av. Giráldez 157 · Salón Histórico":"Calle Real 919 · Terraza & Salón"}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-ink mb-3"><span className="w-7 h-7 rounded-full bg-brand-600 text-white grid place-items-center text-sm">2</span>Ambiente y grupo</div>
            <div className="flex flex-col gap-4">
              <div><div className="text-sm font-semibold mb-2">Zona preferida</div><div className="grid grid-cols-3 gap-2">{["Salón Principal","Terraza","Zona Familiar"].map(z=> <button key={z} type="button" onClick={()=>setZona(z)} className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${zona===z?"bg-ink text-white":"bg-slate-100 text-slate-600"}`}>{z}</button>)}</div></div>
              <div><div className="text-sm font-semibold mb-2">Comensales (1-20)</div>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={20} value={personas} onChange={e=>setPersonas(Number(e.target.value))} className="flex-1 accent-brand-600"/>
                  <span className="w-14 h-10 grid place-items-center bg-ink text-white rounded-lg font-bold">{personas}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">{[2,4,6,8].map(n=> <button key={n} type="button" onClick={()=>setPersonas(n)} className={`py-2 rounded-lg text-sm font-semibold ${personas===n?"bg-brand-600 text-white":"bg-slate-100"}`}>{n==8?"8+":n} pers.</button>)}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-ink mb-3"><span className="w-7 h-7 rounded-full bg-brand-600 text-white grid place-items-center text-sm">3</span>Fecha y horario (11:00-23:00)</div>
            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <label className="text-sm font-semibold">Fecha<input type="date" min={today} value={fecha} onChange={e=>setFecha(e.target.value)} className="mt-1 w-full h-11 px-3 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"/></label>
              <label className="text-sm font-semibold">Hora<input type="time" min="11:00" max="23:00" value={hora} onChange={e=>setHora(e.target.value)} className="mt-1 w-full h-11 px-3 bg-slate-100 rounded-lg focus:outline-none"/></label>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{horas.map(h=> <button key={h} type="button" onClick={()=>setHora(h)} className={`py-2 rounded-lg text-sm font-semibold ${hora===h?"bg-brand-600 text-white":"bg-slate-100 hover:bg-slate-200"}`}>{h}</button>)}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-ink mb-3"><span className="w-7 h-7 rounded-full bg-brand-600 text-white grid place-items-center text-sm">4</span>Datos del titular</div>
            <div className="flex flex-col gap-3">
              <label className="text-sm">Nombre y Apellidos *<input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. Carlos Mendoza" className="mt-1 w-full h-11 px-4 bg-slate-100 rounded-lg focus:outline-none"/></label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm">WhatsApp *<div className="mt-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">+51</span><input required value={tel} onChange={e=>setTel(e.target.value)} placeholder="939 123 456" className="w-full h-11 pl-12 pr-3 bg-slate-100 rounded-lg focus:outline-none"/></div></label>
                <label className="text-sm">Nota<textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Silla bebé, aniversario..." rows={1} className="mt-1 w-full h-11 px-4 bg-slate-100 rounded-lg focus:outline-none"/></label>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">Confirmar Reserva <span className="material-symbols-outlined">check</span></button>
          {msg && <div className={`p-3 rounded-lg text-sm ${ok?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{msg}</div>}
          <p className="text-xs text-center text-slate-500">Te llega confirmación por WhatsApp · Tolerancia 15 min · <Link href="/carta" className="text-brand-600 font-semibold">Ver carta</Link></p>
        </form>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-900/5 overflow-hidden">
            <div className="h-48 relative"><img src="/imagenes/cuarto-brasa.png" alt="Sede Giráldez" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><div className="absolute bottom-4 left-4 text-white"><h3 className="font-bold text-lg">Sede {sede}</h3><p className="text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{sede==="Giráldez"?"Av. Giráldez 157":"Calle Real 919"}</p></div></div>
            <div className="p-6 flex flex-col gap-3 text-sm">
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg"><span className="material-symbols-outlined text-brand-600">schedule</span><div><b>Horarios Salón</b><div className="text-slate-600">Lun-Dom 11:00-23:00 · Feriados continuo</div></div></div>
              <div className="flex gap-3 p-3 bg-slate-50 rounded-lg"><span className="material-symbols-outlined text-brand-600">headset_mic</span><div><b>Teléfonos</b><div className="text-slate-600">939 399 946 · 932 619 097</div></div></div>
              <div className="flex flex-wrap gap-2"><span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs">WiFi Libre</span><span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs">Cochera</span><span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs">Sillas bebé</span><span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs">Yape/Plin</span></div>
              <a href="https://www.google.com/maps/search/?api=1&query=Av.+Gir%C3%A1ldez+157+Huancayo" target="_blank" className="mt-2 w-full h-11 bg-ink text-white rounded-lg grid place-items-center font-semibold">Cómo llegar con Maps</a>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-brand-600 to-orange-700 text-white"><div className="text-xs bg-amber-400 text-ink px-2 py-1 rounded-full font-bold w-fit">Servicio Ágil</div><h4 className="font-bold mt-2">¿Quieres pre-ordenar?</h4><p className="text-sm opacity-90">Al llegar con tu reserva, el pollo estará caliente en mesa.</p><Link href="/carta" className="inline-flex items-center gap-2 mt-4 font-bold hover:gap-3">Ver la carta <span className="material-symbols-outlined">arrow_forward</span></Link></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
