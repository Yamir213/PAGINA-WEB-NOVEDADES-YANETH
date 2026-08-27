# Novedades Yaneth — sitio web

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni compilación) para la
boutique de **alquiler y venta de vestidos y ternos** en Ilo, Moquegua.

## Estructura

```
index.html              Portada: hero, servicios, destacados, proceso,
                        testimonios, tiendas, preguntas y contacto
catalogo.html           Catálogo completo con filtros por categoría
assets/css/styles.css   Sistema de diseño (tokens, modo claro/oscuro, animaciones)
assets/js/main.js       Lógica: tema, idioma, menú, scroll, catálogo, formulario
assets/js/i18n.js       Textos en español e inglés
assets/js/catalogo-data.js  Datos de las prendas (aquí se carga el catálogo real)
assets/img/             Logo, favicon e imágenes de referencia del catálogo
```

## Ver el sitio

No necesita instalación. Basta abrir `index.html`, o levantar un servidor local:

```bash
python3 -m http.server 8000    # luego abre http://localhost:8000
```

Se publica tal cual en GitHub Pages, Netlify o cualquier hosting estático.

## Cómo cargar las prendas reales

1. Guarda las fotos en `assets/img/catalogo/` (recomendado: formato `.webp`,
   vertical 3:4, máximo ~1200 px de alto, menos de 200 KB cada una).
2. Edita `assets/js/catalogo-data.js` y reemplaza cada entrada:

```js
{ id:"q-01", cat:"quinceanera", img:"assets/img/catalogo/vestido-aurora.webp",
  modo:"alquiler",                       // "alquiler" o "venta"
  es:{ n:"Nombre en español", d:"Descripción corta" },
  en:{ n:"Name in English",   d:"Short description" },
  precio:"S/ 250", tallas:"S · M · L",
  destacado:true }                       // true = aparece en la portada
```

Las categorías disponibles están arriba del mismo archivo, en `CATEGORIAS`;
puedes agregar o quitar las que necesites y los filtros se regeneran solos.

Las imágenes actuales son **marcadores de posición** generados en SVG: sirven para
ver el diseño terminado y se reemplazan por las fotos reales sin tocar el código.
Lo mismo aplica a las dos fotos de la sección «Nuestras tiendas» en `index.html`.

## Datos del negocio

Teléfonos, WhatsApp y el endpoint opcional del formulario están al inicio de
`assets/js/main.js`, en el objeto `CONFIG`. Los teléfonos que se muestran en
pantalla también aparecen en `index.html` (sección Contacto y pie de página).

## Formulario de contacto

Valida los campos en el navegador (nombre, teléfono, correo, tipo de consulta,
fecha y mensaje) y al enviar abre WhatsApp con el mensaje ya redactado.

Si prefieres recibir las consultas por correo, crea un formulario en
[Formspree](https://formspree.io) (u otro servicio similar) y pega la URL en
`CONFIG.formEndpoint`. Con ese valor completo, el envío se hace por HTTP y
WhatsApp queda como respaldo.

## Qué incluye

- Pantalla de carga y transiciones suaves entre páginas
- Animaciones de entrada al hacer scroll y microinteracciones en botones
- Diseño responsive con menú de navegación móvil
- Modo claro / oscuro con preferencia guardada
- Selector de idioma español / inglés
- Catálogo filtrable por categoría con consulta directa por WhatsApp
- Testimonios, preguntas frecuentes, mapa y botón de volver arriba
- Favicon propio, datos estructurados (schema.org) y etiquetas Open Graph
- Respeta `prefers-reduced-motion` para quienes desactivan animaciones
