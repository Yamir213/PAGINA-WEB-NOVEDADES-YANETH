#!/usr/bin/env python3
"""
Genera una versión del sitio en UN SOLO ARCHIVO HTML.

Toma index.html y catalogo.html, incrusta el CSS, el JavaScript y las
imágenes, y convierte las dos páginas en dos vistas del mismo documento.
Sirve para enseñar el sitio a un cliente por enlace o por correo, sin
servidor y sin carpetas de apoyo.

    python3 generar-demo.py [archivo-de-salida.html]

El sitio real sigue siendo index.html + catalogo.html; este archivo es
solo una copia para mostrar.
"""
import base64
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).parent
SALIDA = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else RAIZ / "demo" / "novedades-yaneth.html")


def escapar_html(texto):
    """Acentos y eñes como entidades: el archivo se ve bien aunque se abra
    desde el disco, por correo o dentro de un visor que no declare UTF-8."""
    return "".join(c if ord(c) < 128 else "&#%d;" % ord(c) for c in texto)


def escapar_js(texto):
    """Lo mismo dentro de <script>, donde las entidades HTML no valen."""
    return "".join(c if ord(c) < 128 else "\\u%04x" % ord(c) for c in texto)


def leer(ruta):
    return (RAIZ / ruta).read_text(encoding="utf-8")


def svg_data_uri(ruta):
    datos = (RAIZ / ruta).read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(datos).decode("ascii")


def cuerpo_principal(html):
    """Devuelve el contenido interno de <main>."""
    inicio = html.index('<main id="main">') + len('<main id="main">')
    return html[inicio:html.index("</main>", inicio)]


index = leer("index.html")
catalogo = leer("catalogo.html")

# --- Piezas comunes que se reutilizan de la portada -------------------------
encabezado = index[index.index("<!-- ============ PANTALLA DE CARGA"):index.index('<main id="main">')]
pie = index[index.index("<!-- ============ FOOTER"):index.index('<script>document.getElementById("year")')]

vista_inicio = cuerpo_principal(index)
vista_catalogo = cuerpo_principal(catalogo)

# La demo no navega entre archivos: los enlaces cambian de vista.
SECCIONES = ("servicios", "catalogo", "proceso", "testimonios", "tiendas", "preguntas", "contacto")


def enlazar_vistas(html):
    """Convierte los enlaces entre páginas en cambios de vista."""
    html = html.replace('href="catalogo.html"', 'href="#vista-catalogo" data-vista="catalogo"')
    html = re.sub(r'href="index\.html(#[a-z]+)?"',
                  lambda m: 'href="%s" data-vista="inicio"' % (m.group(1) or "#vista-inicio"), html)
    # Las anclas de la portada también deben devolver a la vista de inicio
    for seccion in SECCIONES:
        html = html.replace('href="#%s"' % seccion, 'href="#%s" data-vista="inicio"' % seccion)
    return html


encabezado = enlazar_vistas(encabezado)
# En la demo, "Catálogo" del menú abre el catálogo completo (en el sitio real
# es la sección de destacados de la portada, que aquí ya se ve al bajar).
encabezado = encabezado.replace('href="#catalogo" data-vista="inicio"',
                                'href="#vista-catalogo" data-vista="catalogo"')
pie = enlazar_vistas(pie)
vista_inicio = enlazar_vistas(vista_inicio)
vista_catalogo = enlazar_vistas(vista_catalogo)

# El mapa incrustado no carga dentro del visor; se sustituye por un enlace.
vista_inicio = re.sub(
    r'<div class="map-frame">.*?</div>',
    '<a class="map-frame map-link" href="https://www.google.com/maps/search/Novedades+Yaneth+Ilo" '
    'target="_blank" rel="noopener">'
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/>'
    '<circle cx="12" cy="10" r="2.5"/></svg>'
    '<span><b>Ilo, Moquegua</b><span>Abrir la ubicación en Google Maps</span></span></a>',
    vista_inicio, flags=re.S)

# --- Recursos incrustados ---------------------------------------------------
css = leer("assets/css/styles.css") + """
/* Añadidos propios de la versión de una sola página */
.map-link { display:flex; align-items:center; gap:1rem; padding:1.5rem; text-decoration:none;
  background: var(--bg-inset); transition: border-color .3s var(--ease), transform .3s var(--ease); }
.map-link:hover { border-color: var(--brand); transform: translateY(-2px); }
.map-link svg { width:30px; height:30px; color: var(--brand); flex:none; }
.map-link b { display:block; font-size:1rem; }
.map-link span span { color: var(--text-mute); font-size:.9rem; }
[hidden] { display: none !important; }
"""

js = "\n".join(leer("assets/js/" + f) for f in ("i18n.js", "catalogo-data.js", "main.js"))

# Las imágenes viajan dentro del propio archivo
for nombre in sorted(p.name for p in (RAIZ / "assets/img/catalogo").glob("*.svg")):
    ruta = "assets/img/catalogo/" + nombre
    uri = svg_data_uri(ruta)
    js = js.replace('"' + ruta + '"', '"' + uri + '"')
    vista_inicio = vista_inicio.replace(ruta, uri)
    vista_catalogo = vista_catalogo.replace(ruta, uri)

logo = svg_data_uri("assets/img/logo-mark.svg")
encabezado = encabezado.replace("assets/img/logo-mark.svg", logo)
pie = pie.replace("assets/img/logo-mark.svg", logo)

router = """
/* Enrutador de la demo: las dos páginas del sitio conviven aquí como vistas. */
window.NY_ROUTER = true;
(function () {
  var vistas = { inicio: document.getElementById("vista-inicio"),
                 catalogo: document.getElementById("vista-catalogo") };
  var enCurso = false;

  function mostrar(nombre, hash) {
    if (enCurso) return;
    var destino = vistas[nombre];
    if (!destino || (!destino.hidden && !hash)) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    /* Al cambiar de vista el salto es instantáneo: animar 4000 px de scroll
       después del fundido se vería como un tirón. */
    enCurso = true;
    document.body.classList.add("is-leaving");
    setTimeout(function () {
      Object.keys(vistas).forEach(function (k) { vistas[k].hidden = k !== nombre; });
      document.body.classList.remove("is-leaving");
      var ancla = hash && document.querySelector(hash);
      window.scrollTo({ top: ancla ? ancla.getBoundingClientRect().top + window.scrollY - 72 : 0, behavior: "instant" });
      document.querySelectorAll(".nav__link[data-vista]").forEach(function (a) {
        if (a.getAttribute("data-vista") === "catalogo" && nombre === "catalogo") a.setAttribute("aria-current", "page");
        else if (a.hasAttribute("data-vista")) a.removeAttribute("aria-current");
      });
      if (window.nyObserveReveals) window.nyObserveReveals(destino);
      enCurso = false;
    }, 300);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-vista]");
    if (!a) return;
    var nombre = a.getAttribute("data-vista");
    var href = a.getAttribute("href");
    var hash = href.indexOf("#vista-") === 0 ? "" : href;
    var destino = vistas[nombre];
    /* Si el ancla está en la vista que ya se ve, el scroll suave habitual basta. */
    if (destino && !destino.hidden && hash) return;
    e.preventDefault();
    var menu = document.getElementById("mobileMenu");
    if (menu && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      document.getElementById("burger").setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    mostrar(nombre, hash);
  }, true);
})();
"""

aviso = """
<!-- ============================================================
     Versión de demostración en un solo archivo.
     Generada con generar-demo.py a partir de index.html y
     catalogo.html. No la edites a mano: edita el sitio y
     vuelve a generarla.
     ============================================================ -->
"""

encabezado = escapar_html(encabezado)
pie = escapar_html(pie)
vista_inicio = escapar_html(vista_inicio)
vista_catalogo = escapar_html(vista_catalogo)
js = escapar_js(js)

pagina = f"""<meta charset="utf-8">
<title>Novedades Yaneth</title>
<meta name="description" content="Boutique en Ilo: alquiler y venta de vestidos de quinceañera, novia y gala, ternos para caballeros y trajes para niños.">
<meta name="theme-color" content="#fbf7f9">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Great+Vibes&family=Jost:wght@300;400;500;600&display=swap">
<style>
{css}
</style>
<script>
  (function () {{
    try {{
      var s = localStorage.getItem("ny-theme");
      var d = s || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", d);
    }} catch (e) {{}}
  }})();
</script>
{aviso}
{encabezado}
<main id="main">
  <div id="vista-inicio">{vista_inicio}</div>
  <div id="vista-catalogo" hidden>{vista_catalogo}</div>
</main>

{pie}
<script>document.getElementById("year").textContent = new Date().getFullYear();</script>
<script>
{js}
</script>
<script>
{router}
</script>
"""

SALIDA.parent.mkdir(parents=True, exist_ok=True)
SALIDA.write_text(pagina, encoding="utf-8")
print("Generado %s (%.0f KB)" % (SALIDA, SALIDA.stat().st_size / 1024))
