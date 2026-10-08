/* Sección "VOIA Viajar para aprender / VOIA Aprender para cuidar".
   La animación avanza y retrocede con el scroll (no corre sola) y no usa librerías.

   Línea de tiempo (p = avance del scroll dentro de la sección, de 0 a 1):
     0.00 – 0.12  aparece el mensaje central
     0.12 – 0.86  se dibuja la trayectoria en sentido horario desde las 12; cada meta aparece al llegar a su posición
     0.86 – 1.00  la composición completa se queda quieta y después la sección se suelta

   Esa animación es solo de pantallas anchas (rueda). En móvil NO hay animación fija ni scroll controlado: el título, el
   párrafo y los cinco valores van en el flujo normal de la página, uno debajo de otro, y cada tarjeta entra con un
   fade-in suave la primera vez que aparece (la misma clase .reveal de "Nuestros destinos"). */
(() => {
  const section = document.getElementById("diferencial");
  if (!section) return;

  const sticky = section.querySelector(".values__sticky");
  const stage = section.querySelector(".values__stage");
  const center = section.querySelector(".values__center");
  const wheel = section.querySelector(".values__wheel");
  const goals = [...section.querySelectorAll(".goal")];
  const ringSvg = section.querySelector(".values__ring");
  const ringTrack = ringSvg.querySelector(".ring__track");
  const ringDraw = ringSvg.querySelector(".ring__draw");
  const markDraw = section.querySelector(".values__markring .ring__draw");
  const headSvg = section.querySelector(".values__head");
  const head = headSvg.querySelector("circle");

  const WIDE = "(min-width: 900px) and (min-height: 640px)"; // rueda; si no, tarjetas escalonadas
  const REDUCED = "(prefers-reduced-motion: reduce)";
  const INTRO_END = 0.12;
  const RING_START = 0.12;
  const RING_LEN = 0.74;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const setVar = (el, name, value) => el.style.setProperty(name, value);

  let wide = false;
  let scrolly = false;
  let geo = null;

  /* ---------- Avance del scroll (0 a 1) ---------- */
  function progress() {
    const total = section.offsetHeight - sticky.offsetHeight;
    if (total <= 0) return 1;
    return clamp(-section.getBoundingClientRect().top / total, 0, 1);
  }

  /* ---------- Pinta el estado que corresponde a un avance p ---------- */
  function apply(p) {
    setVar(stage, "--ci", ease(clamp(p / INTRO_END, 0, 1)).toFixed(4));

    const r = clamp((p - RING_START) / RING_LEN, 0, 1);
    const offset = (1 - r).toFixed(4);
    ringDraw.style.strokeDashoffset = offset;
    markDraw.style.strokeDashoffset = offset;

    if (wide && geo) {
      const a = 2 * Math.PI * r;
      head.setAttribute("cx", (geo.cx + geo.rx * Math.sin(a)).toFixed(1));
      head.setAttribute("cy", (geo.cy - geo.ry * Math.cos(a)).toFixed(1));
      head.style.opacity = r > 0.002 && r < 0.998 ? 1 : 0;
    }

    goals.forEach((g, i) => {
      const v = ease(clamp((r - i * 0.2) / 0.14, 0, 1));
      setVar(g, "--g", v.toFixed(4));
      const pending = v < 0.02;
      g.classList.toggle("is-pending", pending);
      if (pending && g.classList.contains("is-active") && !g.matches(":focus-within")) closeGoal(g, true);
    });
  }

  /* ---------- Geometría de la rueda ---------- */
  function layoutWheel() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const s = clamp(Math.min(H / 700, W / 1100), 0.78, 1);
    setVar(stage, "--s", s.toFixed(3));

    const gw = 216 * s;
    const h1 = goals[0].offsetHeight; // meta de arriba
    const hb = Math.max(goals[2].offsetHeight, goals[3].offsetHeight); // metas de abajo
    // Alto de la tarjeta abierta de las metas de abajo: también debe caber dentro de la pantalla.
    const pb = Math.max(...[2, 3].map((k) => goals[k].querySelector(".goal__panel").offsetHeight));
    const ry = Math.min(H / 2 - h1 / 2 - 16, (H / 2 - hb / 2 - 16) / 0.809, (H / 2 - pb / 2 - 8) / 0.809, 360);
    const rx = Math.min(ry * 1.4, (W / 2 - 145 - 16) / 0.951, 540);
    const cx = W / 2;
    const cy = H / 2;
    setVar(stage, "--rx", rx.toFixed(1) + "px");
    setVar(stage, "--ry", ry.toFixed(1) + "px");
    setVar(stage, "--cw", clamp(2 * (0.951 * rx - gw / 2 - 24), 260, 520).toFixed(0) + "px");

    // El mensaje central va centrado entre la meta de arriba y las de abajo.
    const topLimit = -ry + h1 / 2 + 14;
    const bottomLimit = 0.809 * ry - hb / 2 - 14;
    setVar(stage, "--dy", ((topLimit + bottomLimit) / 2).toFixed(1) + "px");

    const box = `0 0 ${W} ${H}`;
    const d = `M${cx},${cy - ry} A${rx},${ry} 0 1 1 ${cx},${cy + ry} A${rx},${ry} 0 1 1 ${cx},${cy - ry}`;
    ringSvg.setAttribute("viewBox", box);
    headSvg.setAttribute("viewBox", box);
    ringTrack.setAttribute("d", d);
    ringDraw.setAttribute("d", d);
    geo = { cx, cy, rx, ry };

    fitCenter(bottomLimit - topLimit);
  }

  // Si el mensaje central no cabe: se reduce, luego se oculta el brote y, como último recurso,
  // el párrafo (que sigue disponible para lectores de pantalla).
  function fitCenter(avail) {
    section.classList.remove("is-tight", "is-tighter");
    const fits = () => center.offsetHeight <= avail;
    for (const cs of [1, 0.93, 0.86]) {
      setVar(stage, "--cs", cs);
      if (fits()) return;
    }
    section.classList.add("is-tight");
    for (const cs of [0.86, 0.8, 0.74]) {
      setVar(stage, "--cs", cs);
      if (fits()) return;
    }
    section.classList.add("is-tighter");
  }

  /* ---------- Elige el modo según el tamaño de pantalla y "reducir movimiento" ---------- */
  function setup() {
    wide = window.matchMedia(WIDE).matches;
    const reduced = window.matchMedia(REDUCED).matches;
    section.classList.toggle("is-wheel", wide);
    section.classList.toggle("is-stack", !wide);
    section.classList.remove("is-compact", "is-tight", "is-tighter");
    setVar(section, "--sl", wide ? 320 : 260);

    // La sección solo se fija y se anima con el scroll en pantallas anchas. En móvil todo va en el flujo normal de la página.
    scrolly = wide && !reduced;
    section.classList.toggle("is-scrolly", scrolly);

    if (wide) layoutWheel();

    // Móvil: cada tarjeta entra una sola vez con un fade-in suave y después se queda donde está (igual que "Nuestros destinos").
    goals.forEach((g) => g.querySelector(".goal__face").classList.toggle("reveal", !wide));
    if (!wide && typeof observeReveals === "function") observeReveals();

    apply(scrolly ? progress() : 1);
  }

  /* ---------- Descripciones: cursor, foco de teclado y toque ---------- */
  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function sync(g) {
    const on = ["is-hover", "is-kbd", "is-open"].some((c) => g.classList.contains(c));
    g.classList.toggle("is-active", on);
    g.querySelector(".goal__toggle").setAttribute("aria-expanded", on);
  }
  function closeGoal(g, all) {
    g.classList.remove("is-open");
    if (all) g.classList.remove("is-hover", "is-kbd");
    sync(g);
  }
  function closeAll(except) {
    goals.forEach((g) => { if (g !== except) closeGoal(g); });
  }

  // Con teclado: al llegar a una meta que aún no aparece, se avanza el scroll lo justo para mostrarla.
  function revealGoal(i) {
    if (!scrolly) return;
    const need = Math.min(1, RING_START + RING_LEN * (i * 0.2 + 0.14) + 0.01);
    if (progress() >= need) return;
    const total = section.offsetHeight - sticky.offsetHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + need * total, behavior: "smooth" });
  }

  goals.forEach((g, i) => {
    const btn = g.querySelector(".goal__toggle");

    g.addEventListener("mouseenter", () => {
      if (!canHover() || g.classList.contains("is-pending")) return;
      g.classList.add("is-hover");
      sync(g);
    });
    g.addEventListener("mouseleave", () => {
      g.classList.remove("is-hover");
      sync(g);
    });
    btn.addEventListener("focus", () => {
      if (btn.matches(":focus-visible")) { g.classList.add("is-kbd"); sync(g); }
      revealGoal(i);
    });
    btn.addEventListener("blur", () => {
      g.classList.remove("is-kbd");
      sync(g);
    });
    btn.addEventListener("click", (e) => {
      if (canHover() && e.detail > 0) return; // con ratón basta el hover; teclado y lectores de pantalla (detail = 0) sí alternan
      const open = !g.classList.contains("is-open");
      closeAll(g);
      g.classList.toggle("is-open", open);
      sync(g);
    });
    g.querySelector(".goal__panel").addEventListener("click", () => closeGoal(g));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".goal")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") goals.forEach((g) => closeGoal(g, true));
  });

  /* ---------- Eventos ---------- */
  let ticking = false;
  const onScroll = () => {
    if (!scrolly || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      apply(progress());
    });
  };
  let resizing = false;
  const onResize = () => {
    if (resizing) return;
    resizing = true;
    requestAnimationFrame(() => {
      resizing = false;
      setup();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.matchMedia(WIDE).addEventListener("change", onResize);
  window.matchMedia(REDUCED).addEventListener("change", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  setup();
})();
