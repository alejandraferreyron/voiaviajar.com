/* Página de cada destino: se construye con los datos de data.js según ?d=nombre-del-destino */

const ICONS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  pin: '<path d="M12 21s7-6.100 7-11a7 7 0 0 0-14 0c0 4.900 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  plane: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18"/>',
};
const icon = (name, size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const params = new URLSearchParams(window.location.search);
const d = DESTINOS.find((x) => x.slug === params.get("d"));
const main = document.getElementById("page");

const paragraphs = (arr) => arr.map((p) => `<p>${esc(p)}</p>`).join("");
const waBtn = (label, msg, cls = "") =>
  `<a class="btn ${cls}" href="${waLink(msg)}" target="_blank" rel="noopener">${WA_ICON}${label}</a>`;
// "Reservar": si el viaje tiene test, primero se pasa por él (ver reserveTarget en site.js).
const reserveBtn = (label, msg, cls = "") =>
  `<a class="btn ${cls}" href="test.html?viaje=${d.slug}" data-reserve="${d.slug}" data-msg="${esc(msg)}">${label}</a>`;

function itineraryHTML(items) {
  return `
    <div class="itin__tools"><button type="button" class="link-btn" data-toggle-days>Expandir todo</button></div>
    <div class="itin">
      ${items
        .map(
          (it) => `
        <details class="day">
          <summary>
            <span class="day__num"><small>Día</small>${it.dia}</span>
            <span class="day__head"><strong>${esc(it.titulo)}</strong>${it.lugar ? `<em>${esc(it.lugar)}</em>` : ""}</span>
            ${it.ritmo ? `<span class="ritmo ritmo--${esc(it.ritmo.toLowerCase())}">Ritmo ${esc(it.ritmo.toLowerCase())}</span>` : ""}
          </summary>
          ${it.texto ? `<div class="day__text">${[].concat(it.texto).map((p) => `<p>${esc(p)}</p>`).join("")}</div>` : `<ul>${it.plan.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`}
        </details>`
        )
        .join("")}
    </div>`;
}

function pendingHTML(nombre, msg) {
  return `
    <div class="pending">
      <h3>Itinerario en preparación</h3>
      <p>Estamos terminando el detalle día por día de este viaje. Escríbenos y te lo compartimos en cuanto esté listo.</p>
      ${waBtn("Pedir información", msg, "btn--solid")}
    </div>`;
}

/* ---------- Pagos y políticas de cancelación (solo viajes con "pagos" en data.js) ---------- */
// En los textos: **negritas**; [texto](https://...) es un enlace de afiliado (pestaña nueva, rel="sponsored noopener noreferrer");
// y los correos se vuelven enlace mailto.
const fmtPago = (t) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="sponsored noopener noreferrer">$1</a>')
    .replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '<a href="mailto:$1">$1</a>');

function tablaPagoHTML(t) {
  const apilable = t.cab.length >= 4 ? " pay__table--cal" : ""; // en celular, las de 4 columnas se apilan en tarjetas
  return `
    <div class="pay__scroll" role="region" tabindex="0" aria-label="${esc(t.etiqueta || "Tabla")}">
      <table class="pay__table${apilable}">
        <thead><tr>${t.cab.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${t.filas
          .map((f) => `<tr${f[0] === "**Total**" ? ' class="is-total"' : ""}>${f.map((c, i) => `<td data-label="${esc(t.cab[i])}">${fmtPago(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody>
      </table>
    </div>`;
}

function calendarioPagoHTML(cal) {
  const [plan0, mon0] = [cal.planes[0].id, cal.monedas[0].id];
  const grupo = (clave, etiqueta, items) =>
    `<div class="pay__seg" role="group" aria-label="${esc(etiqueta)}">${items
      .map((it, i) => `<button type="button" data-${clave}="${esc(it.id)}" aria-pressed="${i === 0}">${esc(it.nombre)}</button>`)
      .join("")}</div>`;
  return `
    <div class="pay__cal">
      <div class="pay__controls">${grupo("plan", "Tipo de precio", cal.planes)}${grupo("mon", "Moneda", cal.monedas)}</div>
      ${cal.tablas
        .map((t) => `<div class="pay__tabla" data-plan="${esc(t.plan)}" data-mon="${esc(t.moneda)}"${t.plan === plan0 && t.moneda === mon0 ? "" : " hidden"}><h3>${esc(t.titulo)}</h3>${tablaPagoHTML(t.tabla)}</div>`)
        .join("")}
    </div>`;
}

function bloquePagoHTML(b) {
  if (b.h) return `<h3>${fmtPago(b.h)}</h3>`;
  if (b.p) return `<p>${fmtPago(b.p)}</p>`;
  if (b.ul) return `<ul>${b.ul.map((x) => `<li>${fmtPago(x)}</li>`).join("")}</ul>`;
  if (b.aviso) return `<aside class="pay__aviso">${fmtPago(b.aviso)}</aside>`;
  if (b.tabla) return tablaPagoHTML(b.tabla);
  if (b.calendario) return calendarioPagoHTML(b.calendario);
  return "";
}

// Cada bloque es un <details> con el mismo diseño del itinerario (.day).
function pagosHTML(p) {
  return `
    <section class="section pagos" id="pagos" aria-labelledby="pagosTitle">
      <div class="container">
        <h2 class="h-caps" id="pagosTitle">Pagos y políticas de cancelación</h2>
        <p class="pay__sub">${fmtPago(p.subtitulo)}</p>
        <div class="itin">
          ${p.bloques
            .map((b) => `
          <details class="day"${b.abierto ? " open" : ""}>
            <summary><span class="day__head"><strong>${esc(b.titulo)}</strong></span></summary>
            <div class="pay__body">${b.contenido.map(bloquePagoHTML).join("")}</div>
          </details>`)
            .join("")}
        </div>
      </div>
    </section>`;
}

function render() {
  // Los destinos "próximamente" no tienen página propia: volvemos a la lista de destinos.
  if (d && d.proximamente) {
    window.location.replace("index.html#destinos");
    return;
  }
  if (!d) {
    document.title = "Destino no encontrado | VOIA";
    main.innerHTML = `
      <section class="section notfound"><div class="container">
        <h1>No encontramos ese destino</h1>
        <p>Puede que el enlace haya cambiado. Mira todos nuestros viajes desde el inicio.</p>
        <a class="btn btn--solid" href="index.html#destinos">Ver destinos</a>
      </div></section>`;
    return;
  }

  document.title = `${d.nombre} | VOIA`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `${d.nombre}: ${d.tagline}. ${d.descripcion[0]}`;

  const msg = `Hola VOIA, me interesa el viaje a ${d.nombre}.`;
  const sections = []; // { id, label, html }

  /* ---- Datos rápidos ---- */
  const facts = [
    ["Duración", d.duracion, "clock"],
    ["Temporada", d.temporada, "calendar"],
    ["Lugar", d.ubicacion, "pin"],
    ["Tipo de viaje", d.grupo === "nacionales" ? "Nacional" : "Internacional", "flag"],
    ["Fechas", d.fechas, "plane"],
  ].filter((f) => f[1]);
  const factsHTML = `
    <div class="facts"><div class="container"><ul>
      ${facts.map(([k, v, i]) => `<li>${icon(i, 26)}<span><small>${k}</small><strong>${esc(v)}</strong></span></li>`).join("")}
    </ul></div></div>`;

  /* ---- Descripción ---- */
  sections.push({
    id: "descripcion",
    label: "Descripción",
    html: `
    <section class="section desc" id="descripcion">
      <div class="container desc__wrap">
        <h2 class="h-caps">Descripción</h2>
        <div class="desc__text">${paragraphs(d.descripcion)}</div>
        ${
          d.destacados
            ? `<h3 class="h-sub">Lo más destacado</h3>
               <ul class="checks">${d.destacados.map((x) => `<li>${icon("check", 20)}<span>${esc(x)}</span></li>`).join("")}</ul>`
            : ""
        }
        ${d.nota ? `<p class="callout"><strong>Importante:</strong> ${esc(d.nota)}</p>` : ""}
        ${waBtn("Consultar por WhatsApp", msg, "btn--solid")}
      </div>
    </section>`,
  });

  /* ---- Cita ---- */
  // Cada foto de la galería es un código de Unsplash (texto) o una foto propia { src, w, h, alt }.
  // "marcaAgua" (en data.js) es la marca de agua propia: aparece al pasar el cursor (solo escritorio) sobre las fotos propias del viaje.
  // Las fotos de Unsplash no la llevan.
  const galeria = d.galeria.map((g) => (typeof g === "string" ? { src: photo(g, 640, 480), w: 427, h: 320, uniform: true } : { marca: d.marcaAgua, ...g }));
  const bigOf = (g) => (typeof g === "string" ? g : g.src); // código de Unsplash o ruta: se pide en tamaño grande con imgSrc
  const quoteImg = d.citaFoto || bigOf(d.galeria[Math.min(2, d.galeria.length - 1)]);
  const quoteHTML = `
    <section class="quote" style="background-image:url('${imgSrc(quoteImg, 1800)}')" aria-label="Frase del destino">
      <div class="quote__shade"></div>
      <blockquote class="container"><p>${esc(d.cita)}</p></blockquote>
    </section>`;

  /* ---- Itinerario / Rutas ---- */
  if (d.rutas) {
    sections.push({
      id: "rutas",
      label: "Rutas",
      html: `
      <section class="section routes" id="rutas">
        <div class="container">
          <h2 class="h-caps">Rutas</h2>
          <div class="routes__grid">
            ${d.rutas
              .map(
                (r) => `
              <article class="route-card">
                <span class="chip">${esc(r.duracion)}</span>
                <h3>${esc(r.nombre)}</h3>
                ${paragraphs(r.descripcion)}
                ${r.itinerario ? itineraryHTML(r.itinerario) : pendingHTML(d.nombre, `Hola VOIA, me interesa la ${r.nombre}.`)}
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>`,
    });
  } else {
    sections.push({
      id: "itinerario",
      label: "Itinerario",
      html: `
      <section class="section itinerary" id="itinerario">
        <div class="container">
          <h2 class="h-caps">Itinerario</h2>
          ${d.itinerario ? itineraryHTML(d.itinerario) : pendingHTML(d.nombre, msg)}
        </div>
      </section>`,
    });
  }

  /* ---- Incluye / No incluye (solo si hay datos) ---- */
  if (d.incluye || d.noIncluye) {
    sections.push({
      id: "incluye",
      label: "Incluye",
      html: `
      <section class="section included" id="incluye">
        <div class="container included__grid">
          ${d.incluye ? `<div><h2 class="h-caps">Incluye</h2><ul class="checks">${d.incluye.map((x) => `<li>${icon("check", 20)}<span>${esc(x)}</span></li>`).join("")}</ul></div>` : ""}
          ${d.noIncluye ? `<div><h2 class="h-caps">No incluye</h2><ul class="checks checks--no">${d.noIncluye.map((x) => `<li>${icon("cross", 20)}<span>${esc(x)}</span></li>`).join("")}</ul></div>` : ""}
        </div>
      </section>`,
    });
  }

  /* ---- Galería en movimiento ---- */
  // Las fotos propias se muestran completas (sin recortar) con la misma altura; las de Unsplash, en cuadros uniformes.
  // Si la foto trae "credito" (por ejemplo, no es propia), se envuelve para mostrar el texto pequeño en la esquina.
  const imgTag = (g, i, copia) => {
    const alt = copia ? "" : esc(g.alt || `${d.nombre}, imagen ${i + 1}`);
    const cls = g.uniform ? "" : "nat";
    const style = `aspect-ratio:${g.w}/${g.h};--ar:${(g.w / g.h).toFixed(3)}`;
    const img = `<img src="${g.src}" alt="${alt}" loading="lazy" decoding="async" width="${g.w}" height="${g.h}">`;
    // "credito": crédito fijo de otra persona (siempre visible). "marca": marca de agua propia, solo al pasar el cursor (ver .ph__marca en styles.css).
    // Los dos van también en las copias del carrusel, que se ven al dar la vuelta (esas ya están ocultas para lectores de pantalla).
    const credito = g.credito ? `<small class="ph__credit">${esc(g.credito)}</small>` : "";
    const marca = g.marca ? `<span class="ph__marca" aria-hidden="true">${esc(g.marca)}</span>` : "";
    if (!credito && !marca) return `<img class="${cls}" src="${g.src}" alt="${alt}"${copia ? ' aria-hidden="true"' : ""} loading="lazy" decoding="async" width="${g.w}" height="${g.h}" style="${style}">`;
    return `<span class="ph ${cls}${marca ? " ph--marca" : ""}"${copia ? ' aria-hidden="true"' : ""} style="${style}">${img}${credito}${marca}</span>`;
  };
  const imgs = galeria.map((g, i) => imgTag(g, i, false)).join("");
  const imgsCopy = galeria.map((g, i) => imgTag(g, i, true)).join("");
  // Velocidad constante (unos 60 px por segundo) sin importar cuántas fotos haya ni su forma.
  const anchoTotal = galeria.reduce((t, g) => t + (g.uniform ? 427 : (g.w / g.h) * 320) + 12, 0);
  const duracion = Math.max(30, Math.round(anchoTotal / 60));
  sections.push({
    id: "galeria",
    label: "Galería",
    html: `
    <section class="gallery" id="galeria" aria-label="Galería de ${esc(d.nombre)}">
      <div class="container gallery__head">
        <h2 class="h-caps">Galería</h2>
        <button type="button" class="link-btn" id="galleryToggle" aria-expanded="false" aria-controls="galleryStrip">Ver galería completa</button>
      </div>
      <div class="marquee" id="galleryStrip">
        <div class="marquee__track" style="--dur:${duracion}s">${imgs}${imgsCopy}</div>
      </div>
    </section>`,
  });

  /* ---- Pagos y políticas de cancelación (después de la galería) ---- */
  if (d.pagos) sections.push({ id: "pagos", label: "Pagos", html: pagosHTML(d.pagos) });

  /* ---- Preguntas (enlaza al pie de página) ---- */
  const pills = [...sections.map((s) => [`#${s.id}`, s.label]), ["#faq", "Preguntas"]];

  /* ---- Otros destinos ---- */
  const pool = DESTINOS.filter((o) => !o.proximamente);
  const idx = pool.indexOf(d);
  const others = [1, 2, 3].map((n) => pool[(idx + n) % pool.length]);
  const othersHTML = `
    <section class="section others" aria-labelledby="othersTitle">
      <div class="container"><h2 id="othersTitle" class="h-caps">Otros destinos</h2></div>
      <div class="grid grid--3">
        ${others.map((o) => `
          <a class="tile reveal" href="destino.html?d=${o.slug}" aria-label="Ver ${esc(o.nombre)}">
            ${tileImg(o)}
            <span class="tile__label"><span class="tile__name">${esc(o.nombre)}</span><span class="tile__meta">${esc(o.meta)}</span></span>
          </a>`).join("")}
      </div>
    </section>`;

  /* ---- Llamada final ---- */
  const ctaHTML = `
    <section class="contact section">
      <div class="container contact__inner">
        <h2>Vive ${esc(d.nombre)} con nosotros</h2>
        <p>Cuéntanos qué fechas te interesan y te enviamos toda la información.</p>
        ${waBtn("Escríbenos por WhatsApp", msg, "btn--light")}
      </div>
    </section>`;

  /* ---- Armado de la página ---- */
  const secHTML = (id) => sections.find((s) => s.id === id)?.html || "";
  const [first, ...rest] = sections;
  main.innerHTML = `
    <section class="phero" style="background-image:url('${imgSrc(d.hero || bigOf(d.galeria[0]), 1800)}')${d.heroPos ? `;background-position:${d.heroPos}` : ""}">
      <div class="phero__shade"></div>
      <div class="phero__content container">
        <nav class="crumbs" aria-label="Ruta de navegación">
          <a href="index.html#inicio">Inicio</a><span aria-hidden="true">›</span>
          <a href="index.html#destinos">Destinos</a><span aria-hidden="true">›</span>
          <span aria-current="page">${esc(d.nombre)}</span>
        </nav>
        <h1>${esc(d.nombre)}</h1>
        <p>${esc(d.tagline)}</p>
        ${d.quiz ? reserveBtn("Reserva tu lugar", `Hola VOIA, quiero reservar mi lugar en el viaje a ${d.nombre}.`, "btn--solid") : waBtn("Reserva tu lugar", msg, "btn--solid")}
      </div>
    </section>
    ${factsHTML}
    ${first.html}
    ${quoteHTML}
    ${rest.map((s) => s.html).join("")}
    ${othersHTML}
    ${ctaHTML}`;

  /* Barra de secciones (píldora) */
  const pill = document.createElement("nav");
  pill.className = "pill";
  pill.setAttribute("aria-label", "Secciones de la página");
  pill.innerHTML = pills.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
  document.body.appendChild(pill);
  document.body.classList.add("has-pill");

  const spyTargets = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          pill.querySelectorAll("a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
        }
      }),
    { rootMargin: "-40% 0px -50% 0px" }
  );
  spyTargets.forEach((t) => spy.observe(t));

  /* Calendario de pagos: elegir Early Bird / Precio regular y MXN / EUR */
  document.querySelectorAll(".pay__cal").forEach((cal) => {
    const estado = { plan: cal.querySelector("button[data-plan]").dataset.plan, mon: cal.querySelector("button[data-mon]").dataset.mon };
    const pintar = () => {
      cal.querySelectorAll("button[data-plan]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.plan === estado.plan));
      cal.querySelectorAll("button[data-mon]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mon === estado.mon));
      cal.querySelectorAll(".pay__tabla").forEach((t) => (t.hidden = !(t.dataset.plan === estado.plan && t.dataset.mon === estado.mon)));
    };
    cal.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !cal.contains(b)) return;
      if (b.dataset.plan) estado.plan = b.dataset.plan;
      if (b.dataset.mon) estado.mon = b.dataset.mon;
      pintar();
    });
  });

  /* Expandir / contraer itinerarios */
  document.querySelectorAll("[data-toggle-days]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".itin__tools").nextElementSibling;
      const days = wrap.querySelectorAll("details");
      const open = ![...days].every((x) => x.open);
      days.forEach((x) => (x.open = open));
      btn.textContent = open ? "Contraer todo" : "Expandir todo";
    })
  );

  /* Ver galería completa: frena el carrusel y abre todas las fotos hacia abajo (el mismo botón las vuelve a cerrar) */
  const marquee = document.getElementById("galleryStrip");
  const galleryBtn = document.getElementById("galleryToggle");
  let galleryEnd;
  const animateHeight = (from, to, after) => {
    clearTimeout(galleryEnd);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(galleryEnd);
      marquee.removeEventListener("transitionend", onEnd);
      marquee.style.height = "";
      after();
    };
    const onEnd = (e) => { if (e.target === marquee && e.propertyName === "height") finish(); };
    marquee.addEventListener("transitionend", onEnd);
    galleryEnd = setTimeout(finish, 900); // por si el navegador no avisa que terminó la animación
    marquee.style.height = from + "px";
    marquee.offsetHeight; // fija la altura de partida antes de animar
    marquee.style.height = to + "px";
    if (from === to) finish();
  };
  galleryBtn.addEventListener("click", () => {
    const abrir = !marquee.classList.contains("is-open");
    const from = marquee.offsetHeight;
    galleryBtn.setAttribute("aria-expanded", abrir);
    galleryBtn.textContent = abrir ? "Ver menos" : "Ver galería completa";
    if (abrir) {
      marquee.classList.add("is-open");
      marquee.style.height = "";
      animateHeight(from, marquee.offsetHeight, () => {});
    } else {
      marquee.classList.remove("is-open"); // se mide la altura de la tira y se vuelve a la vista completa mientras se cierra
      const to = marquee.offsetHeight;
      marquee.classList.add("is-open");
      const head = galleryBtn.closest(".gallery__head");
      if (head.getBoundingClientRect().top < 0) document.getElementById("galeria").scrollIntoView({ behavior: "smooth", block: "start" });
      animateHeight(from, to, () => marquee.classList.remove("is-open"));
    }
  });

  /* Botones "Reservar" de viajes con test: al test, a WhatsApp o al resultado, según lo que la persona ya hizo */
  document.querySelectorAll("[data-reserve]").forEach((a) => {
    const apply = () => {
      const t = reserveTarget(a.dataset.reserve, a.dataset.msg);
      a.href = t.href;
      if (t.external) { a.target = "_blank"; a.rel = "noopener"; }
      else { a.removeAttribute("target"); a.removeAttribute("rel"); }
    };
    apply();
    a.addEventListener("click", apply);
  });

  observeReveals();
}

render();
