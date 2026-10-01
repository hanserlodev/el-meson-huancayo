/* Validación de reserva — El Mesón atiende Lun–Dom 11:00–23:00.
   Requiere ids: form-reserva, nombre, personas, fecha, hora, mensaje-reserva. */
(function () {
  const form = document.getElementById("form-reserva");
  if (!form) return;
  const msg = document.getElementById("mensaje-reserva");
  const fecha = document.getElementById("fecha");
  // FIX timezone: usa fecha local no UTC
  const todayLocal = (()=>{ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().split("T")[0]; })();
  fecha?.setAttribute("min", todayLocal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nom = document.getElementById("nombre").value.trim();
    const per = document.getElementById("personas").value;
    const fec = fecha.value;
    const hor = document.getElementById("hora").value;

    if (nom.length < 2) return window.Toast?.("Ingresa tu nombre");
    if (!fec || !/^\d{4}-\d{2}-\d{2}$/.test(fec)) return window.Toast?.("Fecha inválida");
    if (!hor || !/^\d{2}:\d{2}$/.test(hor)) return window.Toast?.("Hora inválida");
    const parts = fec.split("-").map(Number);
    const fecLocal = new Date(parts[0], parts[1]-1, parts[2]);
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    if (fecLocal < hoy) return window.Toast?.("La fecha no puede ser pasada");
    if (hor < "11:00" || hor > "23:00") return window.Toast?.("Atendemos de 11:00 a 23:00");

    msg.textContent = `Reserva confirmada para ${nom}: ${per} persona(s) · ${fec} · ${hor} en El Mesón (Giráldez 157). ¡Te esperamos!`;
    msg.classList.remove("hidden");
    form.reset();
    document.getElementById("personas").value = 2;
    window.Toast?.("Reserva confirmada");
  });
})();
