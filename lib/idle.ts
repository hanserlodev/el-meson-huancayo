/**
 * Ejecuta una tarea cuando el navegador está libre (después del primer pintado),
 * para no competir con la carga de imágenes ni con el LCP.
 */
export function scheduleIdle(cb: () => void, delay = 1200): () => void {
  if (typeof window === "undefined") return () => {};

  let cancelIdle: (() => void) | undefined;

  const timer = window.setTimeout(() => {
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(cb, { timeout: 2500 });
      cancelIdle = () => window.cancelIdleCallback(handle);
    } else {
      cb();
    }
  }, delay);

  return () => {
    window.clearTimeout(timer);
    cancelIdle?.();
  };
}
