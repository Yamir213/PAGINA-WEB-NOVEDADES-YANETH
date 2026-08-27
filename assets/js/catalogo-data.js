/* =============================================================
   CATÁLOGO — fuente única de datos
   -------------------------------------------------------------
   Para cargar prendas reales: reemplaza `img` por la ruta de la
   foto (ej. "assets/img/catalogo/vestido-01.webp") y edita los
   textos. Las categorías válidas son las llaves de CATEGORIAS.
   ============================================================= */
window.CATEGORIAS = {
  todos:      { es: "Todos",              en: "All" },
  quinceanera:{ es: "Quinceañera",        en: "Quinceañera" },
  novia:      { es: "Novia",              en: "Bridal" },
  gala:       { es: "Gala y fiesta",      en: "Gala & party" },
  ternos:     { es: "Ternos caballeros",  en: "Men's suits" },
  ninos:      { es: "Niños y niñas",      en: "Kids" },
  accesorios: { es: "Accesorios",         en: "Accessories" }
};

window.CATALOGO = [
  { id:"q-01", cat:"quinceanera", img:"assets/img/catalogo/g1.svg", modo:"alquiler",
    es:{ n:"Vestido quinceañera Aurora", d:"Corte princesa · tul con pedrería" },
    en:{ n:"Aurora quinceañera gown",    d:"Princess cut · beaded tulle" },
    precio:"S/ 250", tallas:"S · M · L", destacado:true },

  { id:"q-02", cat:"quinceanera", img:"assets/img/catalogo/g6.svg", modo:"alquiler",
    es:{ n:"Vestido quinceañera Lila", d:"Falda en capas · corsé bordado" },
    en:{ n:"Lila quinceañera gown",    d:"Layered skirt · embroidered corset" },
    precio:"S/ 280", tallas:"XS · S · M" },

  { id:"n-01", cat:"novia", img:"assets/img/catalogo/g12.svg", modo:"alquiler",
    es:{ n:"Vestido de novia Serena", d:"Encaje francés · cola desmontable" },
    en:{ n:"Serena bridal gown",      d:"French lace · detachable train" },
    precio:"S/ 450", tallas:"S · M · L", destacado:true },

  { id:"n-02", cat:"novia", img:"assets/img/catalogo/g9.svg", modo:"venta",
    es:{ n:"Vestido civil Perla", d:"Midi satinado · manga ilusión" },
    en:{ n:"Perla civil dress",   d:"Satin midi · illusion sleeve" },
    precio:"S/ 390", tallas:"S · M" },

  { id:"g-01", cat:"gala", img:"assets/img/catalogo/g3.svg", modo:"alquiler",
    es:{ n:"Vestido de gala Rubí", d:"Sirena · abertura lateral" },
    en:{ n:"Rubí gala gown",       d:"Mermaid · side slit" },
    precio:"S/ 180", tallas:"S · M · L", destacado:true },

  { id:"g-02", cat:"gala", img:"assets/img/catalogo/g2.svg", modo:"alquiler",
    es:{ n:"Vestido de gala Océano", d:"Escote corazón · caída fluida" },
    en:{ n:"Océano gala gown",       d:"Sweetheart neckline · fluid drape" },
    precio:"S/ 170", tallas:"XS · S · M · L" },

  { id:"g-03", cat:"gala", img:"assets/img/catalogo/g11.svg", modo:"alquiler",
    es:{ n:"Vestido de gala Esmeralda", d:"Terciopelo · espalda descubierta" },
    en:{ n:"Esmeralda gala gown",       d:"Velvet · open back" },
    precio:"S/ 190", tallas:"M · L · XL" },

  { id:"t-01", cat:"ternos", img:"assets/img/catalogo/g8.svg", modo:"alquiler",
    es:{ n:"Terno slim fit Marino", d:"3 piezas · incluye camisa y corbata" },
    en:{ n:"Marino slim-fit suit",  d:"3 pieces · shirt and tie included" },
    precio:"S/ 150", tallas:"46 · 48 · 50 · 52", destacado:true },

  { id:"t-02", cat:"ternos", img:"assets/img/catalogo/g5.svg", modo:"alquiler",
    es:{ n:"Terno beige Arena", d:"Corte clásico · ideal matrimonio de día" },
    en:{ n:"Arena beige suit",  d:"Classic cut · perfect for daytime weddings" },
    precio:"S/ 160", tallas:"48 · 50 · 52" },

  { id:"t-03", cat:"ternos", img:"assets/img/catalogo/g4.svg", modo:"venta",
    es:{ n:"Terno verde Olivo", d:"Solapa satinada · a medida" },
    en:{ n:"Olivo green suit",  d:"Satin lapel · made to measure" },
    precio:"S/ 620", tallas:"A medida" },

  { id:"k-01", cat:"ninos", img:"assets/img/catalogo/g7.svg", modo:"alquiler",
    es:{ n:"Vestido de niña Rosa", d:"Tul suave · lazo de raso" },
    en:{ n:"Rosa girls dress",     d:"Soft tulle · satin bow" },
    precio:"S/ 90", tallas:"2 · 4 · 6 · 8 años" },

  { id:"k-02", cat:"ninos", img:"assets/img/catalogo/g10.svg", modo:"alquiler",
    es:{ n:"Terno de niño Granate", d:"Con moño · paje o promoción" },
    en:{ n:"Granate boys suit",     d:"With bow tie · page boy or prom" },
    precio:"S/ 85", tallas:"4 · 6 · 8 · 10 años" }
];
