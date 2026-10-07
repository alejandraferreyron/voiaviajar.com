/* Código compartido por todas las páginas: menú, pie de página y WhatsApp. */

const WHATSAPP_NUMBER = "525510946330";
const WA_MESSAGE = "Hola VOIA, me gustaría información sobre sus viajes.";
const waLink = (msg = WA_MESSAGE) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const photo = (id, w = 900, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=70`;
// Una imagen puede ser un código de Unsplash ("photo-...") o una ruta local ("media/...").
const imgSrc = (ref, w, h) => (ref.includes("/") ? ref : photo(ref, w, h));
// Foto de un destino para su recuadro en la lista. "tilePos" ajusta qué parte se ve al recortar en pantallas distintas.
const tileImg = (d) =>
  `<img src="${imgSrc(d.tile)}" alt="" loading="lazy" width="900" height="1000"${d.tilePos ? ` style="object-position:${d.tilePos}"` : ""}>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const WA_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 0 0 20.5 3.5zM12 20a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3A9 9 0 1 1 12 20zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.900 11.900 0 0 0 4.600 4c1.700.7 2.400.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.3-.2-.6-.3z"/></svg>`;

/* ------------ Menú ------------ */
document.getElementById("site-header").outerHTML = `
  <header class="nav" id="nav">
    <nav class="nav__inner" aria-label="Principal">
      <button class="nav__toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Abrir menú">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav__links" id="navLinks">
        <li class="nav__group nav__group--l">
          <a href="index.html#inicio">Inicio</a>
          <a href="index.html#quienes-somos">Quiénes somos</a>
        </li>
        <li class="nav__logo-item"><a href="index.html#inicio" class="logo logo--img" aria-label="VOIA, ir al inicio">
          <img class="logo__img logo__img--blanco" src="media/logo/voia-blanco.png?v=2" alt="" width="986" height="303">
          <img class="logo__img logo__img--azul" src="media/logo/voia-azul.png?v=2" alt="" width="973" height="299">
        </a></li>
        <li class="nav__group nav__group--r">
          <a href="index.html#destinos">Destinos</a>
          <a href="test.html" data-nav="test">¿Es para ti?</a>
          <a href="#" data-wa>Contacto</a>
        </li>
      </ul>
    </nav>
  </header>`;

/* ------------ Pie de página ------------ */
document.getElementById("site-footer").outerHTML = `
  <footer class="footer">
    <div class="container">
      <section class="faq" id="faq" aria-labelledby="faqTitle">
        <h2 id="faqTitle">Preguntas frecuentes</h2>
        ${FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
      </section>

      <div class="footer__bar">
        <a href="index.html#inicio" class="logo logo--footer" aria-label="VOIA, ir al inicio"><img src="media/logo/voia-blanco.png?v=2" alt="" width="986" height="303"></a>
        <div class="social">
          <a href="https://www.instagram.com/voia.viajar/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de VOIA (se abre en una pestaña nueva)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="#" aria-label="TikTok (próximamente)"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 2h-3.1v13.400a2.600 2.600 0 1 1-2.600-2.600c.3 0 .5 0 .8.100V9.700a5.800 5.800 0 1 0 4.900 5.700V8.900a7.300 7.300 0 0 0 4.200 1.300V7.100a4.200 4.200 0 0 1-4.200-5.100z"/></svg></a>
          <a href="#" data-wa aria-label="WhatsApp">${WA_ICON}</a>
        </div>
      </div>
      <p class="copy">© ${new Date().getFullYear()} VOIA. Todos los derechos reservados.</p>
    </div>
  </footer>

  <a class="wa-float" href="#" data-wa aria-label="Escríbenos por WhatsApp">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 0 0 20.5 3.5zM12 20a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3A9 9 0 1 1 12 20zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.900 11.900 0 0 0 4.600 4c1.700.7 2.400.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.3-.2-.6-.3z"/></svg>
  </a>`;

/* ------------ Test "¿Este viaje es para ti?": resultado guardado y reserva ------------ */
const QUIZ_LABELS = { si: "Sí", piensatela: "Piénsatela bien", no: "No es para ti (por ahora)" };
const quizStore = {
  key: (slug) => `voia_quiz_${slug}`,
  get(slug) {
    try {
      const v = JSON.parse(localStorage.getItem(this.key(slug)));
      return v && v.result ? v : null;
    } catch (e) { return null; }
  },
  set(slug, data) {
    try { localStorage.setItem(this.key(slug), JSON.stringify(data)); return true; } catch (e) { return false; }
  },
};
// A dónde lleva "Reservar": al test si aún no se hizo; con Sí o Piénsatela, a WhatsApp; con No, a su resultado.
function reserveTarget(slug, msg) {
  const r = quizStore.get(slug);
  if (!r) return { href: `test.html?viaje=${slug}`, external: false };
  if (r.result === "no") return { href: `test.html?viaje=${slug}&resultado=1`, external: false };
  return { href: waLink(`${msg} Resultado del test: ${QUIZ_LABELS[r.result]}.`), external: true };
}

/* ------------ WhatsApp ------------ */
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.msg || WA_MESSAGE);
  a.target = "_blank";
  a.rel = "noopener";
});

/* ------------ Comportamiento del menú ------------ */
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40 || document.body.hasAttribute("data-nav-solid"));
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
});

/* ------------ Aparecer al hacer scroll ------------ */
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); } }),
  { threshold: 0.12 }
);
const observeReveals = () => document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => revealObserver.observe(el));

/* ------------ Protección de fotos ------------ */
// Evita el menú "Guardar imagen" (clic derecho o mantener presionado) y arrastrar fotos.
document.addEventListener("contextmenu", (e) => { if (e.target.closest("img, .phero, .quote, .q-intro")) e.preventDefault(); });
document.addEventListener("dragstart", (e) => { if (e.target.tagName === "IMG") e.preventDefault(); });
