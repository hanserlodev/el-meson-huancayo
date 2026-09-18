export type Categoria = "brasa" | "parrilla" | "extra";

export interface Plato {
  id: string;
  nombre: string;
  precio: number;
  cat: Categoria;
  desc: string;
  img: string;
  tag: string;
  rating: string;
  votos: number;
  activo?: boolean;
}

export const PLATOS: Plato[] = [
  {
    id: "cuarto",
    nombre: "1/4 Pollo a la Brasa",
    precio: 10.9,
    cat: "brasa",
    desc: "Jugoso a la leña con papas crocantes, ensalada dulce y cremas de la casa.",
    img: "/imagenes/cuarto-brasa.png",
    tag: "Más pedido",
    rating: "★★★★★",
    votos: 214,
  },
  {
    id: "entero",
    nombre: "Pollo Entero a la Brasa",
    precio: 43.6,
    cat: "brasa",
    desc: "Para compartir: pollo entero con papas, ensaladas y cremas.",
    img: "/imagenes/pollo-entero.jpg",
    tag: "Para compartir",
    rating: "★★★★★",
    votos: 167,
  },
  {
    id: "pollo-parrilla",
    nombre: "Pollo a la Parrilla",
    precio: 18.9,
    cat: "parrilla",
    desc: "Filete de pollo al carbón con papas fritas y ensalada fresca.",
    img: "/imagenes/pollo-parrilla.jpg",
    tag: "",
    rating: "★★★★★",
    votos: 98,
  },
  {
    id: "mixto",
    nombre: "Mixto a la Parrilla",
    precio: 18.9,
    cat: "parrilla",
    desc: "Filete de pechuga + bistec a la parrilla con guarnición completa.",
    img: "/imagenes/mixto.jpg",
    tag: "",
    rating: "★★★★☆",
    votos: 76,
  },
  {
    id: "brocheta",
    nombre: "Brocheta de Pollo",
    precio: 21.9,
    cat: "parrilla",
    desc: "Pollo, cebolla, pimentón, champiñones y piña en brocheta al carbón.",
    img: "/imagenes/brocheta.jpg",
    tag: "",
    rating: "★★★★★",
    votos: 64,
  },
  {
    id: "anticuchos",
    nombre: "Anticuchos de Corazón",
    precio: 21.9,
    cat: "parrilla",
    desc: "Clásicos anticuchos al carbón con papa dorada y choclo.",
    img: "/imagenes/anticuchos.jpg",
    tag: "Al carbón",
    rating: "★★★★★",
    votos: 121,
  },
  {
    id: "chaufa",
    nombre: "Chaufa Personal",
    precio: 9.9,
    cat: "extra",
    desc: "Arroz chaufa al wok, ideal para acompañar tus parrillas.",
    img: "/imagenes/chaufa.jpg",
    tag: "",
    rating: "★★★★☆",
    votos: 58,
  },
  {
    id: "chicha",
    nombre: "Chicha Morada 1 L",
    precio: 8.9,
    cat: "extra",
    desc: "Refrescante chicha de maíz morado con receta de la casa.",
    img: "/imagenes/chicha.jpg",
    tag: "",
    rating: "★★★★★",
    votos: 143,
  },
  {
    id: "gaseosa",
    nombre: "Inka Kola / Coca-Cola 1.5 L",
    precio: 9.0,
    cat: "extra",
    desc: "La compañera infaltable del pollo a la brasa.",
    img: "/imagenes/gaseosa.jpg",
    tag: "",
    rating: "★★★★★",
    votos: 187,
  },
];

export const DELIVERY = 5;
export const ENVIO_GRATIS_DESDE = 35;
export const WHATSAPP = "51939399946";
export const DIRECCION = "Av. Giráldez 157, Huancayo";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Pollos+y+Parrillas+El+Mes%C3%B3n+Av.+Gir%C3%A1ldez+157+Huancayo";
