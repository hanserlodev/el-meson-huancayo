/* Validación de reserva — El Mesón atiende Lun–Dom 11:00–23:00.
   Requiere ids: form-reserva, nombre, personas, fecha, hora, mensaje-reserva. */
(function () {
  const form = document.getElementById("form-reserva");
  if (!form) return;
  const msg = document.getElementById("mensaje-reserva");
  const fecha = document.getElementById("fecha");
  fecha?.setAttribute("min", new Date().toISOString().split("T")[0]);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nom = document.getElementById("nombre").value.trim();
    const per = document.getElementById("personas").value;
    const fec = fecha.value;
    const hor = document.getElementById("hora").value;

    if (nom.length < 2) return window.Toast?.("⚠️ Ingresa tu nombre");
    if (!fec) return window.Toast?.("⚠️ Elige la fecha");
    if (!hor) return window.Toast?.("⚠️ Elige la hora");
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    if (new Date(fec + "T00:00:00") < hoy) return window.Toast?.("⚠️ La fecha no puede ser pasada");
    if (hor < "11:00" || hor > "23:00") return window.Toast?.("⚠️ Atendemos de 11:00 a 23:00");

    msg.textContent = `🎉 ¡Reserva confirmada para ${nom}! ${per} persona(s) · ${fec} · ${hor} en El Mesón (Giráldez 157). ¡Te esperamos!`;
    msg.classList.remove("hidden");
    form.reset();
    document.getElementById("personas").value = 2;
    window.Toast?.("✅ Reserva confirmada");
  });
})();
