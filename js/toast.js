/* Toast compartido. Requiere <div id="toast"> en cada página. */
window.Toast = (function () {
  let timer;
  return function (msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 2200);
  };
})();
