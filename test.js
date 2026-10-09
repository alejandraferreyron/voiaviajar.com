/* Test "¿Este viaje es para ti?"
   Pantallas: selector de viaje → introducción → preguntas (una por pantalla) → resultado.
   Los textos y las preguntas viven en quiz-data.js; aquí solo está la lógica. */
(() => {
  const root = document.getElementById("quiz");
  const live = document.getElementById("quizLive");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("viaje");
  const quiz = slug && QUIZZES[slug];
  const dest = slug && DESTINOS.find((d) => d.slug === slug);

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const announce = (msg) => { live.textContent = ""; setTimeout(() => (live.textContent = msg), 50); };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const focusTitle = () => {
    const el = root.querySelector("[data-focus]");
    if (el) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  };
  const setView = (html, title, running = false) => {
    document.body.classList.toggle("quiz-running", running);
    root.innerHTML = html;
    document.title = title ? `${title} | VOIA` : "¿Es para ti? | VOIA";
  };

  // Marca el enlace del menú como página actual.
  const navLink = document.querySelector('[data-nav="test"]');
  if (navLink) navLink.setAttribute("aria-current", "page");

  const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICONS = {
    si: '<path d="M32 54C12 40 8 30 8 22c0-7 5-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 7 0 12 5 12 12 0 8-4 18-24 32z"/><path class="a" d="M32 44V30m0 0c0-5 4-8 8-8 0 5-3 8-8 8zm0 4c0-4-3-6-7-6 0 4 3 6 7 6z"/>',
    piensatela: '<path d="M8 46c6-5 10-5 16 0s10 5 16 0 10-5 16 0M8 55c6-5 10-5 16 0s10 5 16 0 10-5 16 0"/><path class="a" d="M20 39a12 12 0 0 1 24 0M32 13v6M17.500 23.500l4 4M46.500 23.500l-4 4M8 39h6M50 39h6"/>',
    no: '<path d="M18 8h28M18 56h28"/><path d="M21 8c0 13 11 16 11 24S21 43 21 56M43 8c0 13-11 16-11 24s11 11 11 24"/><path class="a" d="M32 34v9M26 51c3-3 9-3 12 0"/>',
  };

  /* =====================================================
     1. SELECTOR DE VIAJE
     ===================================================== */
  function renderSelector() {
    const byslug = (s) => DESTINOS.find((d) => d.slug === s);
    const veracruz = byslug("veracruz");
    const label = (nombre, meta, extra = "") =>
      `<span class="tile__label"><span class="tile__name">${esc(nombre)}</span><span class="tile__meta">${esc(meta)}</span>${extra}</span>`;

    const active = (d, cls = "") => `
      <a class="tile ${cls}" href="test.html?viaje=${d.slug}">
        ${tileImg(d)}
        ${label(d.nombre, d.meta, '<span class="tile__cta">Hacer el test →</span>')}
      </a>`;
    const disabled = (c) => `
      <div class="tile tile--disabled" role="group" aria-disabled="true" aria-label="${esc(c.nombre)}, próximamente">
        <span class="tile__soon">Próximamente</span>
        ${tileImg(c)}
        ${label(c.nombre, c.meta)}
      </div>`;

    const bali = DESTINOS.find((d) => d.quiz);
    const intl = ["filipinas", "sumatra", "raja-ampat", "komodo"].map(byslug).map((d) => ({ nombre: d.nombre, meta: d.proximamente ? "Indonesia" : d.meta, tile: d.tile, tilePos: d.tilePos }));
    const mexico = [
      { nombre: "Baja California Sur", meta: byslug("baja-california-sur").meta, tile: byslug("baja-california-sur").tile, tilePos: byslug("baja-california-sur").tilePos },
      { nombre: "Riviera Maya", meta: byslug("riviera-maya").meta, tile: byslug("riviera-maya").tile, tilePos: byslug("riviera-maya").tilePos },
      { nombre: "Veracruz – Jalcomulco", meta: "3 días", tile: veracruz.tile, tilePos: veracruz.tilePos },
      { nombre: "Veracruz – Sótano de Popocatl", meta: "3 días", tile: veracruz.galeria[0].src },
    ];

    setView(`
      <section class="q-select">
        <header class="q-select__head container">
          <p class="eyebrow eyebrow--dark">¿Es para ti?</p>
          <h1 data-focus>¿Para qué viaje haces el test?</h1>
          <p>Elige tu expedición. Cada viaje tiene su propio test.</p>
        </header>

        ${bali ? active({ ...bali, tile: QUIZZES[bali.slug]?.foto || bali.tile, tilePos: QUIZZES[bali.slug]?.fotoPos || bali.tilePos }, "tile--featured") : ""}

        <h2 class="group-title container">Internacionales</h2>
        <div class="q-grid">${intl.map(disabled).join("")}</div>

        <h2 class="group-title container">México</h2>
        <div class="q-grid">${mexico.map(disabled).join("")}</div>
      </section>`, "¿Es para ti?");
  }

  /* =====================================================
     2. INTRODUCCIÓN DEL TEST
     ===================================================== */
  function renderIntro() {
    const prev = quizStore.get(slug);
    setView(`
      <section class="q-intro" style="background-image:url('${imgSrc(quiz.foto, 1800)}');${quiz.fotoPos ? ` background-position:${quiz.fotoPos};` : ""}">
        <div class="q-intro__inner container">
          <p class="eyebrow">${esc(quiz.etiqueta)}</p>
          <h1 data-focus>¿Este viaje es para ti?</h1>
          ${quiz.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
          <ul class="q-chips" aria-label="Sobre el test">
            <li>${quiz.preguntas.length} preguntas</li><li>2 minutos</li><li>Resultado inmediato</li>
          </ul>
          <div class="q-intro__actions">
            <button type="button" class="btn btn--light" id="qStart">Empezar el test</button>
            <a class="q-link" href="test.html">← Elegir otro viaje</a>
          </div>
          ${prev ? `<p class="q-prev"><a class="q-link" href="test.html?viaje=${slug}&resultado=1">Ver mi resultado anterior</a></p>` : ""}
          <p class="q-note">Este test es orientativo y no sustituye la declaración de salud que pedimos al reservar.</p>
        </div>
      </section>`, "¿Este viaje es para ti?");
    document.getElementById("qStart").addEventListener("click", startQuiz);
  }

  /* =====================================================
     3. PREGUNTAS
     ===================================================== */
  const state = { order: [], answers: {}, i: 0 };
  let timer = null;

  const questionText = (q) => q.q.replace("{hora}", QUIZ_HORA || "temprano");

  function startQuiz() {
    // Opciones de la mejor a la peor (verde, amarilla, roja); con QUIZ_MEZCLAR = true salen al azar. El orden se mantiene durante todo el test.
    const rango = { green: 0, yellow: 1, red: 2 };
    state.order = quiz.preguntas.map((q) => (QUIZ_MEZCLAR ? shuffle([0, 1, 2]) : [0, 1, 2].sort((x, y) => rango[q.o[x][1]] - rango[q.o[y][1]])));
    state.answers = {};
    state.i = 0;
    setView(`
      <section class="q-stage">
        <div class="q-wrap">
          <div class="q-progress" role="progressbar" aria-label="Progreso del test" aria-valuemin="0" aria-valuemax="${quiz.preguntas.length}" aria-valuenow="0"><div class="q-progress__bar"></div></div>
          <p class="q-count" id="qCount"></p>
          <div class="q-card" id="qCard"></div>
          <button type="button" class="link-btn q-back" id="qBack">← Atrás</button>
        </div>
      </section>`, "Test", true);
    document.getElementById("qBack").addEventListener("click", goBack);
    paint(0, false);
    window.scrollTo({ top: 0 });
  }

  function paint(i, animate = true) {
    state.i = i;
    const q = quiz.preguntas[i];
    const total = quiz.preguntas.length;
    const card = document.getElementById("qCard");
    const chosen = state.answers[q.id];

    document.getElementById("qCount").textContent = `Pregunta ${i + 1} de ${total}`;
    const bar = root.querySelector(".q-progress");
    bar.setAttribute("aria-valuenow", i);
    bar.firstElementChild.style.width = `${(i / total) * 100}%`;

    card.innerHTML = `
      <p class="q-tag">${esc(q.tag)}</p>
      <h2 class="q-question" id="qTitle" data-focus>${esc(questionText(q))}</h2>
      <div class="q-options" role="radiogroup" aria-labelledby="qTitle">
        ${state.order[i].map((orig) => `
          <label class="q-opt">
            <input type="radio" name="q${q.id}" value="${orig}"${chosen === orig ? " checked" : ""}>
            <span class="q-opt__body"><span class="q-opt__text">${esc(q.o[orig][0])}</span><span class="q-opt__check" aria-hidden="true">${CHECK}</span></span>
          </label>`).join("")}
      </div>`;
    card.classList.remove("is-leaving", "is-entering");
    if (animate && !reduceMotion()) { void card.offsetWidth; card.classList.add("is-entering"); }

    card.querySelectorAll("input").forEach((input) => {
      // "click" también se dispara al elegir con el teclado y al volver a tocar la opción ya elegida.
      input.addEventListener("click", () => pick(q, Number(input.value)));
    });
    if (animate) focusTitle();
  }

  function pick(q, orig) {
    state.answers[q.id] = orig;
    clearTimeout(timer);
    const last = state.i === quiz.preguntas.length - 1;
    announce(last ? "Respuesta guardada. Calculando tu resultado." : `Respuesta guardada. Pasando a la pregunta ${state.i + 2} de ${quiz.preguntas.length}.`);
    timer = setTimeout(() => {
      const card = document.getElementById("qCard");
      const go = () => (last ? finish() : paint(state.i + 1));
      if (!reduceMotion()) { card.classList.add("is-leaving"); setTimeout(go, 200); } else go();
    }, 400);
  }

  function goBack() {
    clearTimeout(timer);
    if (state.i === 0) { renderIntro(); focusTitle(); return; }
    paint(state.i - 1);
  }

  /* =====================================================
     4. RESULTADO
     ===================================================== */
  function evaluate(answers) {
    const reds = [], yellows = [], alerts = [];
    quiz.preguntas.forEach((q) => {
      const [, score, flag] = q.o[answers[q.id]];
      if (score === "red") reds.push(q);
      if (score === "yellow") { yellows.push(q); if (flag === "alerta") alerts.push(q); }
    });
    const criticalReds = reds.filter((q) => q.critical).length;
    let result = "si";
    if (criticalReds >= 1 || reds.length >= 3) result = "no";
    else if (reds.length >= 1 || alerts.length >= 1 || yellows.length >= 4) result = "piensatela";

    // Las razones siempre corresponden a lo que la persona eligió.
    const first = (list) => list.slice().sort((a, b) => Number(b.critical) - Number(a.critical)); // primero las críticas
    let reasons = [];
    if (result === "no") {
      reasons = first(reds).map((q) => q.reason);
    } else if (result === "piensatela") {
      const elegidas = [...first(reds), ...alerts];
      reasons = elegidas.length ? elegidas.map((q) => q.reason) : yellows.filter((q) => q.enMedia).map((q) => q.reason);
    }
    return { result, reasons };
  }

  function finish() {
    const { result } = evaluate(state.answers);
    quizStore.set(slug, { result, answers: state.answers, at: Date.now() });
    renderResult(result, state.answers);
  }

  function renderResult(result, answers) {
    const { reasons } = evaluate(answers);
    const reserve = waLink(`${quiz.mensajeReserva} Resultado del test: ${QUIZ_LABELS[result]}.`);
    const list = reasons.length ? `<ul class="q-reasons">${reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : "";
    const itinerary = `destino.html?d=${slug}#itinerario`;
    const wa = (msg) => waLink(msg);

    const V = {
      si: {
        title: quiz.tituloSi || "¡Eres alma VOIA!",
        body: `<p>Tienes todo para vivir este viaje al máximo. Nos vemos en la aventura.</p>`,
        actions: `<a class="btn btn--light" href="${reserve}" target="_blank" rel="noopener">Reservar mi lugar</a>
                  <a class="btn btn--ghost-light" href="${itinerary}">Ver itinerario</a>`,
      },
      piensatela: {
        title: "La aventura te llama",
        subtitle: "Pero queremos que llegues sabiendo lo que te espera.",
        // primera frase, razones (cambian según las respuestas) y cierre; sin razones concretas la frase termina en punto
        body: `<p>${esc(quiz.introPiensatela)}${reasons.length ? ":" : "."}</p>${list}<p>${esc(quiz.cierrePiensatela)}</p>`,
        actions: `<a class="btn btn--light" href="${wa(quiz.mensajeHablar)}" target="_blank" rel="noopener">Hablar con VOIA</a>
                  <a class="btn btn--ghost-light" href="${reserve}" target="_blank" rel="noopener">Reservar de todos modos</a>`,
      },
      no: {
        title: "Creemos que tal vez este viaje no sea para ti, aquí te va el porque:",
        body: `<p>¡Todos los viajeros somos diferentes y está bien! Pero:</p>${list}<p>A pesar de esto, creemos que salir de tu zona de confort puede llevarte a grandes experiencias. Habla con una de nuestras representantes para terminar de definir si este viaje es para ti.</p>`,
        actions: `<a class="btn btn--light" href="${wa(quiz.mensajeNo)}" target="_blank" rel="noopener">Escríbenos</a>
                  <a class="btn btn--ghost-light" href="index.html#destinos">Ver otros viajes</a>`,
      },
    }[result];

    setView(`
      <section class="q-stage q-stage--result">
        <div class="q-wrap q-result">
          <svg class="q-result__icon" viewBox="0 0 64 64" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[result]}</svg>
          <h1 data-focus>${V.title}</h1>
          ${V.subtitle ? `<p class="q-result__sub">${V.subtitle}</p>` : ""}
          ${V.body}
          <div class="q-result__actions">${V.actions}</div>
          <button type="button" class="link-btn q-again" id="qAgain">Repetir el test</button>
        </div>
      </section>`, V.title);
    document.getElementById("qAgain").addEventListener("click", startQuiz);
    announce(`Resultado: ${V.title}`);
    focusTitle();
  }

  /* =====================================================
     ARRANQUE
     ===================================================== */
  if (!quiz || !dest) {
    renderSelector();
  } else if (params.get("resultado")) {
    const saved = quizStore.get(slug);
    const complete = saved && saved.answers && quiz.preguntas.every((q) => saved.answers[q.id] !== undefined);
    if (complete) renderResult(evaluate(saved.answers).result, saved.answers);
    else renderIntro();
  } else {
    renderIntro();
  }
})();
