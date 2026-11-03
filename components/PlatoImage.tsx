"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Imagen de plato con estado de carga: muestra un indicador mientras llega la
 * foto y un ícono neutro si el archivo no existe, en vez de un recuadro vacío.
 */
export default function PlatoImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className = "",
}: Props) {
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">(src ? "cargando" : "error");

  // Si la imagen ya estaba en caché, el evento load no se repite: lo revisamos al montar.
  const medir = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setEstado(img.naturalWidth > 0 ? "ok" : "error");
  }, []);

  return (
    <>
      {estado !== "ok" && (
        <div className="absolute inset-0 grid place-items-center bg-slate-100" aria-hidden>
          {estado === "cargando" ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
          ) : (
            <span className="material-symbols-outlined text-4xl text-slate-300">restaurant</span>
          )}
        </div>
      )}
      {estado !== "error" && (
        <Image
          ref={medir}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setEstado("ok")}
          onError={() => setEstado("error")}
          className={`object-cover transition-opacity duration-300 ${
            estado === "ok" ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </>
  );
}
