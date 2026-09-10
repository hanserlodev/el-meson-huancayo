/* Carta real de Pollos y Parrillas El Mesón (precios referenciales de su carta pública).
   Fuente única para carta.html, index.html y carrito. */
window.Meson = window.Meson || {};
window.Meson.PLATOS = [
  { id: "cuarto", nombre: "1/4 Pollo a la Brasa", precio: 10.90, cat: "brasa",
    desc: "Jugoso a la leña con papas crocantes, ensalada dulce y cremas de la casa.",
    img: "imagenes/cuarto-brasa.png", tag: "Más pedido", rating: "★★★★★", votos: 214 },
  { id: "entero", nombre: "Pollo Entero a la Brasa", precio: 43.60, cat: "brasa",
    desc: "Para compartir: pollo entero con papas, ensaladas y cremas.",
    img: "imagenes/pollo-entero.jpg", tag: "Para compartir", rating: "★★★★★", votos: 167 },
  { id: "pollo-parrilla", nombre: "Pollo a la Parrilla", precio: 18.90, cat: "parrilla",
    desc: "Filete de pollo al carbón con papas fritas y ensalada fresca.",
    img: "imagenes/pollo-parrilla.jpg", tag: "", rating: "★★★★★", votos: 98 },
  { id: "mixto", nombre: "Mixto a la Parrilla", precio: 18.90, cat: "parrilla",
    desc: "Filete de pechuga + bistec a la parrilla con guarnición completa.",
    img: "imagenes/mixto.jpg", tag: "", rating: "★★★★☆", votos: 76 },
  { id: "brocheta", nombre: "Brocheta de Pollo", precio: 21.90, cat: "parrilla",
    desc: "Pollo, cebolla, pimentón, champiñones y piña en brocheta al carbón.",
    img: "imagenes/brocheta.jpg", tag: "", rating: "★★★★★", votos: 64 },
  { id: "anticuchos", nombre: "Anticuchos de Corazón", precio: 21.90, cat: "parrilla",
    desc: "Clásicos anticuchos al carbón con papa dorada y choclo.",
    img: "imagenes/anticuchos.jpg", tag: "Al carbón", rating: "★★★★★", votos: 121 },
  { id: "chaufa", nombre: "Chaufa Personal", precio: 9.90, cat: "extra",
    desc: "Arroz chaufa al wok, ideal para acompañar tus parrillas.",
    img: "imagenes/chaufa.jpg", tag: "", rating: "★★★★☆", votos: 58 },
  { id: "chicha", nombre: "Chicha Morada 1 L", precio: 8.90, cat: "extra",
    desc: "Refrescante chicha de maíz morado con receta de la casa.",
    img: "imagenes/chicha.jpg", tag: "", rating: "★★★★★", votos: 143 },
  { id: "gaseosa", nombre: "Inka Kola / Coca-Cola 1.5 L", precio: 9.00, cat: "extra",
    desc: "La compañera infaltable del pollo a la brasa.",
    img: "imagenes/gaseosa.jpg", tag: "", rating: "★★★★★", votos: 187 }
];
window.Meson.DELIVERY = 5;
window.Meson.ENVIO_GRATIS_DESDE = 35;
window.Meson.WHATSAPP = "51939399946";
window.Meson.DIRECCION = "Av. Giráldez 157, Huancayo";
window.Meson.MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Pollos+y+Parrillas+El+Mes%C3%B3n+Av.+Gir%C3%A1ldez+157+Huancayo";
