(async () => {
  const w = (ms) => new Promise(r => setTimeout(r, ms));
  const sec = document.querySelector('.values'); const intro = document.querySelector('.values__intro');
  const centro = intro.closest('.values__center') || intro.parentElement;
  const out = { texto: intro.innerText, vw: innerWidth, modo: sec.className.match(/is-(wheel|stack)( is-scrolly)?/)?.[0] };
  const top0 = sec.getBoundingClientRect().top + scrollY, h = sec.offsetHeight;
  for (let y = top0 - 100; y < top0 + h; y += 220) { scrollTo(0, y); await w(100); }
  await w(600);
  const goals = [...document.querySelectorAll('.goal')]; const ir = intro.getBoundingClientRect();
  out.introCaja = [Math.round(ir.left), Math.round(ir.top), Math.round(ir.width), Math.round(ir.height)];
  // ¿el texto central se superpone con alguna meta (cara) en pantalla?
  out.superposiciones = goals.filter(g => { const f = g.querySelector('.goal__face').getBoundingClientRect(); return f.width > 0 && !(f.right < ir.left || f.left > ir.right || f.bottom < ir.top || f.top > ir.bottom); }).length;
  out.hscroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  return JSON.stringify(out);
})()
