/* Página de inicio: cuadrícula de destinos y video. */

function tileHTML(d) {
  const inner = `
      ${tileImg(d)}
      <span class="tile__label"><span class="tile__name">${esc(d.nombre)}</span><span class="tile__meta">${esc(d.meta)}</span></span>`;
  // Los destinos "próximamente" se muestran igual, pero sin enlace a una página propia.
  if (d.proximamente) return `<div class="tile tile--soon reveal">${inner}</div>`;
  return `<a class="tile reveal" href="destino.html?d=${d.slug}" aria-label="Ver ${esc(d.nombre)}">${inner}</a>`;
}

["nacionales", "internacionales"].forEach((grupo) => {
  const items = DESTINOS.filter((d) => d.grupo === grupo);
  const el = document.getElementById(grupo === "nacionales" ? "gridNacionales" : "gridInternacionales");
  el.classList.add(`grid--${items.length}`);
  el.innerHTML = items.map(tileHTML).join("");
});
observeReveals();

/* Video de portada.
   - Se muestra solo cuando de verdad está corriendo; mientras tanto se ve la imagen de portada (fondo de la sección).
   - Corre solo mientras se ve: al bajar por la página se pausa y regresa al subir, así no gasta procesador en las demás secciones.
   - Si la persona prefiere menos movimiento, no arranca solo.
   - Algunos navegadores no dejan arrancar un video solo (Safari con el modo de bajo consumo de macOS/iPhone, o con
     "Reproducción automática: nunca"): se queda la imagen de portada, y cualquier toque o tecla de la persona lo arranca. */
const heroVideo = document.querySelector(".hero__video");
const hero = document.getElementById("inicio");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (heroVideo && hero) {
  let wantsPlay = !reduceMotion;
  let pausedByView = false;   // la pausa fue porque el video salió de pantalla

  if (reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }

  // Safari avisa "playing" un instante antes de pausar un video bloqueado, así que solo se muestra cuando ya avanzó
  heroVideo.addEventListener("timeupdate", () => { if (!heroVideo.paused && heroVideo.currentTime > 0.1) hero.classList.add("is-video-on"); });
  heroVideo.addEventListener("pause", () => { if (!pausedByView) hero.classList.remove("is-video-on"); });

  // Un toque, clic o tecla de la persona sí cuenta como permiso para reproducir (en el iPhone, un toque para desplazarse no cuenta)
  ["click", "touchend", "keydown"].forEach((t) =>
    document.addEventListener(t, () => { if (heroVideo.paused && !pausedByView && wantsPlay) heroVideo.play().catch(() => {}); }, { capture: true, passive: true })
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        pausedByView = false;
        if (wantsPlay) heroVideo.play().catch(() => {});
      } else {
        pausedByView = true;
        heroVideo.pause();
      }
    }, { threshold: 0.05 }).observe(heroVideo);
  }
}
