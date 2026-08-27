/* =============================================================
   Novedades Yaneth — lógica del sitio
   ============================================================= */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     CONFIGURACIÓN — edita aquí los datos del negocio
     ---------------------------------------------------------- */
  var CONFIG = {
    whatsapp: "51933462410",              // número que recibe las consultas
    phones: ["933 462 410", "974 726 054", "962 335 240"],
    // Endpoint opcional (Formspree, Getform, etc.). Si lo completas,
    // el formulario se envía por HTTP y usa WhatsApp solo como respaldo.
    formEndpoint: ""
  };
  window.NY_CONFIG = CONFIG;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1) IDIOMA
     ========================================================== */
  /* El sitio arranca en español; el visitante puede cambiarlo con el selector. */
  var lang = localStorage.getItem("ny-lang") === "en" ? "en" : "es";

  function t(key) {
    var dict = window.I18N[lang] || window.I18N.es;
    return dict[key] != null ? dict[key] : (window.I18N.es[key] != null ? window.I18N.es[key] : key);
  }
  window.nyT = t;
  window.nyLang = function () { return lang; };

  function applyLang() {
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var bits = pair.split(":");
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim()));
      });
    });

    var title = $("[data-i18n-title]");
    if (title) document.title = t(title.getAttribute("data-i18n-title"));
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.desc"));

    $$("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === lang));
    });

    document.dispatchEvent(new CustomEvent("ny:lang", { detail: { lang: lang } }));
  }

  $$("[data-lang-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lang = btn.getAttribute("data-lang-btn");
      localStorage.setItem("ny-lang", lang);
      applyLang();
    });
  });

  /* ==========================================================
     2) TEMA CLARO / OSCURO
     ========================================================== */
  $$("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ny-theme", next);
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#100a0f" : "#fbf7f9");
    });
  });

  /* ==========================================================
     3) PANTALLA DE CARGA
     ========================================================== */
  var loader = $("#loader");
  if (loader) {
    var start = Date.now();
    var hide = function () {
      var wait = Math.max(0, 550 - (Date.now() - start));
      setTimeout(function () {
        loader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        setTimeout(function () { loader.remove(); }, 700);
      }, reduced ? 0 : wait);
    };
    /* Se oculta en cuanto el DOM está listo: no esperamos a recursos externos
       (fuentes, mapa) para no retrasar la primera vista. */
    if (document.readyState !== "loading") hide();
    else document.addEventListener("DOMContentLoaded", hide);
    setTimeout(hide, 3000); // salvaguarda si algo se cuelga
  }

  /* ==========================================================
     4) NAVEGACIÓN
     ========================================================== */
  var nav = $("#nav");
  var menu = $("#mobileMenu");
  var burger = $("#burger");
  var toTop = $("#toTop");
  var bar = $("#progress");

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a, button", menu).forEach(function (el) {
      if (!el.hasAttribute("data-lang-btn")) el.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { closeMenu(); burger.focus(); }
    });
  }

  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 500);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    }
    lastY = y;
    spyNav(y);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* Nav activa según la sección visible (solo en la portada) */
  var spyLinks = $$('.nav__link[href^="#"]');
  var spyTargets = spyLinks.map(function (a) { return $(a.getAttribute("href")); });
  function spyNav(y) {
    if (!spyLinks.length) return;
    var offset = y + (window.innerHeight * 0.32);
    var current = -1;
    spyTargets.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= offset) current = i;
    });
    spyLinks.forEach(function (a, i) {
      if (i === current) a.setAttribute("aria-current", "page");
      else if (a.getAttribute("aria-current") === "page") a.removeAttribute("aria-current");
    });
  }

  /* Scroll suave con desplazamiento por la barra fija */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#" || id === "#!") return;
    var target = $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    var top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });

  /* ==========================================================
     5) TRANSICIÓN ENTRE PÁGINAS
     ========================================================== */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || reduced) return;
    var href = a.getAttribute("href");
    if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
    if (href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/i.test(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(function () { window.location.href = href; }, 300);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.body.classList.remove("is-leaving");
  });

  /* ==========================================================
     6) ANIMACIONES AL HACER SCROLL
     ========================================================== */
  function observeReveals(scope) {
    var items = $$("[data-reveal]", scope || document).filter(function (el) { return !el.classList.contains("is-in"); });
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }
  /* Escalona los hijos de cada grupo marcado con data-stagger */
  $$("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    $$("[data-reveal]", group).forEach(function (el, i) {
      el.style.setProperty("--d", (i * step) + "ms");
    });
  });
  observeReveals();
  window.nyObserveReveals = observeReveals;

  /* Contadores del hero */
  $$("[data-count]").forEach(function (el) {
    var raw = el.getAttribute("data-count");
    var target = parseInt(raw.replace(/\D/g, ""), 10);
    if (!target || reduced) return;
    var prefix = /^\+/.test(raw) ? "+" : "";
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || done) return;
      done = true;
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ==========================================================
     7) CATÁLOGO
     ========================================================== */
  var waLink = function (text) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
  };
  window.nyWaLink = waLink;

  function pieceHTML(item) {
    var i = item[lang] || item.es;
    var isRent = item.modo === "alquiler";
    var msg = lang === "en"
      ? "Hi! I'm interested in \"" + i.n + "\" (ref. " + item.id + "). Is it available?"
      : "¡Hola! Me interesa \"" + i.n + "\" (ref. " + item.id + "). ¿Está disponible?";
    return '' +
      '<article class="piece" data-cat="' + item.cat + '" data-reveal="zoom">' +
        '<div class="piece__media">' +
          '<span class="piece__tag ' + (isRent ? "piece__tag--rent" : "piece__tag--sale") + '">' +
            t(isRent ? "cat.rent" : "cat.sale") + '</span>' +
          '<img src="' + item.img + '" alt="' + i.n + '" loading="lazy" decoding="async" width="600" height="800">' +
          '<a class="btn btn--block piece__cta" href="' + waLink(msg) + '" target="_blank" rel="noopener">' +
            t("cat.ask") + '</a>' +
        '</div>' +
        '<div class="piece__body">' +
          '<h3>' + i.n + '</h3>' +
          '<p class="piece__meta">' + i.d + '</p>' +
          '<p class="piece__meta">' + t("cat.sizes") + ": " + item.tallas + '</p>' +
          '<p class="piece__price">' + (isRent ? '<small>' + t("cat.from") + '</small> ' : "") + item.precio + '</p>' +
        '</div>' +
      '</article>';
  }

  function renderCatalog() {
    var grid = $("#catalogGrid");
    if (!grid || !window.CATALOGO) return;
    var onlyFeatured = grid.hasAttribute("data-featured");
    var items = window.CATALOGO.filter(function (x) { return onlyFeatured ? x.destacado : true; });
    grid.innerHTML = items.map(pieceHTML).join("");
    var count = $("#catalogCount");
    if (count) count.textContent = items.length + " " + t("cat.count");
    filterCatalog(currentFilter);
    observeReveals(grid);
  }

  var currentFilter = "todos";
  function filterCatalog(cat) {
    currentFilter = cat;
    var grid = $("#catalogGrid");
    if (!grid) return;
    var visible = 0;
    $$(".piece", grid).forEach(function (el) {
      var show = cat === "todos" || el.getAttribute("data-cat") === cat;
      el.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    var empty = $("#catalogEmpty");
    if (empty) empty.classList.toggle("is-visible", visible === 0);
    var count = $("#catalogCount");
    if (count) count.textContent = visible + " " + t("cat.count");
  }

  function buildFilters() {
    var wrap = $("#catalogFilters");
    if (!wrap || !window.CATEGORIAS) return;
    wrap.innerHTML = Object.keys(window.CATEGORIAS).map(function (key) {
      var name = window.CATEGORIAS[key][lang] || window.CATEGORIAS[key].es;
      return '<button type="button" class="chip" data-filter="' + key + '" aria-pressed="' +
        (key === currentFilter) + '">' + name + '</button>';
    }).join("");
    $$("button", wrap).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", wrap).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        filterCatalog(b.getAttribute("data-filter"));
      });
    });
  }

  buildFilters();
  renderCatalog();

  /* ==========================================================
     8) FORMULARIO DE CONTACTO
     ========================================================== */
  var form = $("#contactForm");
  if (form) {
    var alertBox = $("#formAlert");

    var rules = {
      nombre:  function (v) { return v.trim().length >= 3 ? "" : "err.name"; },
      telefono:function (v) { return /^[0-9+()\s-]{9,15}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 9 ? "" : "err.phone"; },
      email:   function (v) { return v.trim() === "" || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? "" : "err.email"; },
      tipo:    function (v) { return v ? "" : "err.type"; },
      fecha:   function (v) {
        if (!v) return "";
        var today = new Date(); today.setHours(0, 0, 0, 0);
        return new Date(v + "T00:00:00") >= today ? "" : "err.date";
      },
      mensaje: function (v) { return v.trim().length >= 10 ? "" : "err.msg"; }
    };

    function fieldOf(input) { return input.closest(".field"); }

    function validateField(input, showShake) {
      var rule = rules[input.name];
      if (!rule) return true;
      var key = rule(input.value);
      var field = fieldOf(input);
      var msg = $(".error-msg", field);
      if (key) {
        field.classList.add("has-error");
        field.classList.remove("is-valid");
        if (msg) { msg.textContent = t(key); msg.setAttribute("data-i18n", key); }
        input.setAttribute("aria-invalid", "true");
        if (showShake) {
          field.classList.add("shake");
          setTimeout(function () { field.classList.remove("shake"); }, 500);
        }
        return false;
      }
      field.classList.remove("has-error");
      field.classList.toggle("is-valid", input.value.trim() !== "");
      input.removeAttribute("aria-invalid");
      if (msg) { msg.textContent = ""; msg.removeAttribute("data-i18n"); }
      return true;
    }

    $$(".control", form).forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input, false); });
      input.addEventListener("input", function () {
        if (fieldOf(input).classList.contains("has-error")) validateField(input, false);
      });
    });

    function showAlert(kind, key) {
      if (!alertBox) return;
      alertBox.className = "form-alert form-alert--" + kind + " is-visible";
      alertBox.textContent = t(key);
      alertBox.setAttribute("data-i18n", key);
      alertBox.setAttribute("role", kind === "err" ? "alert" : "status");
      alertBox.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }

    function buildMessage(data) {
      var typeLabel = "";
      var sel = form.elements.tipo;
      if (sel && sel.selectedIndex > 0) typeLabel = sel.options[sel.selectedIndex].textContent;
      var L = lang === "en";
      return (L ? "Hello Novedades Yaneth! I'd like more information.\n\n" : "¡Hola Novedades Yaneth! Quisiera más información.\n\n") +
        (L ? "Name: " : "Nombre: ") + data.nombre + "\n" +
        (L ? "Phone: " : "Teléfono: ") + data.telefono + "\n" +
        (data.email ? (L ? "Email: " : "Correo: ") + data.email + "\n" : "") +
        (typeLabel ? (L ? "Enquiry: " : "Consulta: ") + typeLabel + "\n" : "") +
        (data.fecha ? (L ? "Event date: " : "Fecha del evento: ") + data.fecha + "\n" : "") +
        "\n" + data.mensaje;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = $$(".control", form);
      var ok = true;
      inputs.forEach(function (input) { if (!validateField(input, true)) ok = false; });
      if (!ok) {
        showAlert("err", "err.form");
        var firstBad = $(".field.has-error .control", form);
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {};
      inputs.forEach(function (i) { data[i.name] = i.value.trim(); });

      var btn = $("#submitBtn");
      var label = $("#submitLabel");
      btn.disabled = true;
      if (label) { label.textContent = t("form.sending"); label.setAttribute("data-i18n", "form.sending"); }

      var finish = function () {
        window.open(waLink(buildMessage(data)), "_blank", "noopener");
        showAlert("ok", "ok.form");
        form.reset();
        $$(".field", form).forEach(function (f) { f.classList.remove("is-valid", "has-error"); });
        btn.disabled = false;
        if (label) { label.textContent = t("form.send"); label.setAttribute("data-i18n", "form.send"); }
      };

      if (CONFIG.formEndpoint) {
        fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).then(finish).catch(finish);
      } else {
        setTimeout(finish, 500);
      }
    });

    /* La fecha del evento nunca puede ser pasada */
    var dateInput = form.elements.fecha;
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
  }

  /* ==========================================================
     9) REACCIONAR AL CAMBIO DE IDIOMA
     ========================================================== */
  document.addEventListener("ny:lang", function () {
    buildFilters();
    renderCatalog();
  });

  applyLang();
  onScroll();
})();
