// v32: the Bot Town sky — an invented sky that turns like Earth's (real time, ?hour= to preview). Made-up stars & constellations.
(function () {
  const LAT = 37.5 * Math.PI / 180, D = Math.PI / 180;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // constellations: centre (ra deg, dec deg), scale, points [x,y,mag], lines [[i,j]...]
  const CONS = [
    { n: 'The Fox', ra: 40, dec: 38, s: 2.2, p: [[0,0,2],[2,1,3],[4,0,3],[5,-2,3.4],[3,-3,3.6],[1,-2.5,3.4],[-1,-1.5,3.5],[-2.5,-.5,3.7],[-3.5,1,3.3],[-3,2.3,3.8]], l: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[7,8],[8,9]], t: "A golden fox who ran so far looking for answers that he ran right up into the sky. His curled tail points the way home to anyone who is lost. (Some say he looks a lot like a certain cottage scholar.)" },
    { n: 'The Lantern', ra: 95, dec: 62, s: 1.6, p: [[0,3,3],[-1,2,3.5],[1,2,3.5],[-1.3,0,3],[1.3,0,3],[0,-1,1.6]], l: [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,2]], t: "Hung in the sky by the first Bot Town lamplighter so travellers could find the hill at night. Its bright flame-star never quite goes out." },
    { n: 'The Ladybug', ra: 150, dec: 30, s: 1.5, p: [[0,0,2.4],[-1.2,1,3.6],[1.2,1,3.6],[-1.5,-1,3.4],[1.5,-1,3.4],[0,-2,3.8],[0,1.8,4]], l: [[6,1],[6,2],[1,3],[2,4],[3,5],[4,5],[6,0],[0,5]], t: "Dot, Gorbo's ladybug, once flew so high chasing a firefly that the stars kept her spots as a souvenir. She brings luck to anyone who builds something." },
    { n: "The Goat's Horns", ra: 205, dec: 52, s: 1.8, p: [[0,0,2.6],[-1.5,1.5,3.2],[-2.8,1.2,3.6],[-3,-.2,3.9],[1.5,1.5,3.2],[2.8,1.2,3.6],[3,-.2,3.9]], l: [[0,1],[1,2],[2,3],[0,4],[4,5],[5,6]], t: "The Moon Charm. A gentle faun once gave her lucky horn-charm to the night so the moon would never feel alone. It curls toward the moon whenever she is near." },
    { n: 'The Handpan', ra: 255, dec: 25, s: 1.6, p: [[0,0,2.8],[2,0,3.4],[1.4,1.4,3.6],[0,2,3.4],[-1.4,1.4,3.6],[-2,0,3.4],[-1.4,-1.4,3.6],[0,-2,3.4],[1.4,-1.4,3.6]], l: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1]], t: "A round drum of stars that hums very softly on still nights. Elves say if you hum back, the whole sky gets a little warmer." },
    { n: 'The Teacup', ra: 300, dec: 48, s: 1.5, p: [[-1.5,1,3.2],[1.5,1,3.2],[1,-1,3.5],[-1,-1,3.5],[2.4,.5,3.9],[2.2,-.5,3.9],[0,2.4,4.2]], l: [[0,1],[1,2],[2,3],[3,0],[1,4],[4,5],[5,2]], t: "Always warm, always full. The sky keeps one cup of tea poured for whoever stays up latest." },
    { n: 'The Little Dragon', ra: 340, dec: 70, s: 1.9, p: [[0,0,2.5],[1.5,.8,3.2],[3,.5,3.4],[4.2,1.5,3.7],[-1.2,-.8,3.3],[-2.6,-.6,3.5],[-3.6,.4,3.8],[-4.4,1.6,4],[1,2.2,3.9],[2,2.6,4.1]], l: [[3,2],[2,1],[1,0],[0,4],[4,5],[5,6],[6,7],[1,8],[8,9]], t: "A long, furry, smiling dragon who carries wanderers on his back. Old songs say he comes to visit whenever a wizard is near. Keep watching." },
    { n: 'The Owl', ra: 120, dec: 5, s: 1.6, p: [[-1,2,3],[1,2,3],[-1.4,0,3.5],[1.4,0,3.5],[0,-2,3.3],[0,1.2,3.8]], l: [[0,5],[5,1],[0,2],[1,3],[2,4],[3,4]], t: "The night's librarian. She watches over every book left in the swap box and whispers the ending to anyone who falls asleep reading." },
    { n: 'The Willow', ra: 180, dec: -5, s: 1.9, p: [[0,-3,3],[0,-1,3.2],[0,1,3.3],[-1.5,2,3.6],[1.5,2,3.6],[-2.5,0,3.9],[2.5,0,3.9],[-2.8,-1.6,4.1],[2.8,-1.6,4.1]], l: [[0,1],[1,2],[2,3],[2,4],[3,5],[5,7],[4,6],[6,8]], t: "Its branches droop like the willow by the reading nook, and on windy nights the stars seem to sway." },
    { n: 'The Umbrella', ra: 230, dec: -15, s: 1.6, p: [[-2.4,0,3.2],[-1.2,1,3.5],[0,1.4,2.9],[1.2,1,3.5],[2.4,0,3.2],[0,-2,3.6],[.6,-2.6,3.9]], l: [[0,1],[1,2],[2,3],[3,4],[4,0],[2,5],[5,6]], t: "From a collection kept by an elf who loves umbrellas. This one opened by itself one rainy night and floated up to keep the stars dry." },
    { n: 'The Gear', ra: 15, dec: 0, s: 1.5, p: [[0,0,3],[1.8,0,3.4],[1.3,1.3,3.6],[0,1.8,3.4],[-1.3,1.3,3.6],[-1.8,0,3.4],[-1.3,-1.3,3.6],[0,-1.8,3.4],[1.3,-1.3,3.6]], l: [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1],[0,1],[0,5]], t: "A goblin tinkerer's spare cog. It keeps the whole sky turning smoothly around the Hearthstar. Gorbo swears he can hear it tick." },
    { n: 'The Hearthstar', ra: 0, dec: 90, s: 1, p: [[0,0,.9]], l: [], t: "The pole star of Bot Town. It never moves: every other star circles it, like friends around a fire. Follow it and you will always find home." }
  ];
  // build star list
  const R = rng(20261025), stars = [];
  const add = (ra, dec, mag, c, extra) => stars.push(Object.assign({ ra: ra * D, dec: dec * D, mag, c, tw: R() * 6.28, ts: .6 + R() * 1.8 }, extra));
  const COLS = ['#fff6e0', '#ffe9c2', '#dfe8ff', '#ffd9a8', '#fff', '#ffcfa0', '#e6eeff'];
  for (let i = 0; i < 330; i++) add(R() * 360, Math.asin(R() * 2 - 1) / D, 3.4 + Math.pow(R(), .6) * 2.2, COLS[(R() * COLS.length) | 0]);
  // a milky band: great circle tilted 60 deg
  const band = []; for (let i = 0; i < 90; i++) { const a = R() * 6.28, off = (R() + R() + R() - 1.5) * 8 * D; band.push([a, off]); }
  const bandRD = (a, off) => { // point on tilted circle -> ra/dec
    const x = Math.cos(a), y = Math.sin(a) * Math.cos(60 * D), z = Math.sin(a) * Math.sin(60 * D);
    const dec = Math.asin(Math.max(-1, Math.min(1, z))) + off, ra = Math.atan2(y, x); return [ra, dec]; };
  band.forEach(([a, off]) => { const [ra, dec] = bandRD(a, off); add(ra / D, dec / D, 4.6 + R() * .8, '#fff4dd'); });
  CONS.forEach((c, ci) => { c.idx = c.p.map(([x, y, m]) => { const dec = c.dec + y * c.s, ra = c.ra + x * c.s / Math.max(.2, Math.cos(Math.min(dec, 88) * D)); add(ra, Math.min(dec, 90), m, m < 2 ? '#fff1c8' : COLS[(ci + 1) % COLS.length], { con: ci }); return stars.length - 1; }); });
  const blueIdx = (add(25, 82, 2.4, '#a9d4ff', { blue: true }), stars.length - 1);

  function lst(date) { // "sidereal" angle for the Bot Town sky, radians
    const days = date.getTime() / 864e5 - 10957.5; return ((280.46 + 360.9856474 * days - 122) % 360) * D; }
  function moonPhase(date) { const p = ((date.getTime() / 864e5 - 10962.76) / 29.530589) % 1; return p < 0 ? p + 1 : p; }
  function nowDate() { const h = new URLSearchParams(location.search).get('hour'); const d = new Date(); if (h !== null && !isNaN(+h)) { d.setHours(0, 0, 0, 0); d.setTime(d.getTime() + (+h) * 3600e3); } return d; }
  function altaz(ra, dec, L) { const H = L - ra, sa = Math.sin(dec) * Math.sin(LAT) + Math.cos(dec) * Math.cos(LAT) * Math.cos(H), alt = Math.asin(sa);
    const az = Math.atan2(-Math.cos(dec) * Math.sin(H), Math.sin(dec) * Math.cos(LAT) - Math.cos(dec) * Math.sin(LAT) * Math.cos(H)); return [alt, az]; }

  let wrap, cv, ctx, info, raf, panX = 0, panY = 0, rot = 0, W, Hh, proj = [], tapped = null;
  function build() {
    wrap = document.createElement('div'); wrap.id = 'skyView'; wrap.hidden = true;
    wrap.innerHTML = '<canvas></canvas><div class="skyhead"><b>The Bot Town sky</b><button type="button" aria-label="Close sky">✕</button></div><div class="skyinfo" hidden></div><div class="skyhint">Drag to look around · tap a constellation</div>';
    document.body.appendChild(wrap); cv = wrap.querySelector('canvas'); ctx = cv.getContext('2d'); info = wrap.querySelector('.skyinfo');
    wrap.querySelector('button').onclick = close;
    let drag = null, moved = 0;
    cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, panX, panY, rot]; moved = 0; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      panX = drag[2] + dx; panY = drag[3] + dy; });
    cv.addEventListener('pointerup', e => { if (drag && moved < 8) tap(e.clientX, e.clientY); drag = null; });
  }
  function resize() { const r = devicePixelRatio || 1; W = innerWidth; Hh = innerHeight; cv.width = W * r; cv.height = Hh * r; cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; ctx.setTransform(r, 0, 0, r, 0, 0); }
  function P(alt, az) { // dome projection (zenith-centred stereographic), north up
    const Rr = Math.max(W, Hh) * .62, k = Math.tan((Math.PI / 2 - alt) / 2) / Math.tan(Math.PI / 4) * Rr;
    return [W / 2 + panX + k * Math.sin(az), Hh * .42 + panY - k * Math.cos(az), Rr]; }
  function draw(t) {
    const date = nowDate(), L = lst(date);
    const g = ctx.createRadialGradient(W / 2 + panX, Hh * .42 + panY, 10, W / 2 + panX, Hh * .42 + panY, Math.max(W, Hh));
    g.addColorStop(0, '#1d2350'); g.addColorStop(.6, '#141a3c'); g.addColorStop(1, '#2a1e3a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
    // milky band glow
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 120; i++) { const a = i / 120 * 6.28, [ra, dec] = bandRD(a, 0), [al, az] = altaz(ra, dec, L); if (al < -.05) continue; const [x, y] = P(al, az);
      const gg = ctx.createRadialGradient(x, y, 0, x, y, 60); gg.addColorStop(0, 'rgba(255,225,180,.035)'); gg.addColorStop(1, 'rgba(255,225,180,0)'); ctx.fillStyle = gg; ctx.fillRect(x - 60, y - 60, 120, 120); }
    ctx.globalCompositeOperation = 'source-over';
    proj = stars.map(s => { const [al, az] = altaz(s.ra, s.dec, L); return al > -.02 ? P(al, az) : null; });
    // constellation lines
    ctx.lineCap = 'round';
    CONS.forEach((c, ci) => { const on = tapped === ci; ctx.strokeStyle = on ? 'rgba(255,214,140,.85)' : 'rgba(255,200,130,.28)'; ctx.lineWidth = on ? 2.2 : 1.2; ctx.shadowColor = '#ffb85c'; ctx.shadowBlur = on ? 10 : 4;
      c.l.forEach(([a, b]) => { const A = proj[c.idx[a]], B = proj[c.idx[b]]; if (!A || !B) return; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); }); });
    ctx.shadowBlur = 0;
    stars.forEach((s, i) => { const p = proj[i]; if (!p) return; let r = Math.max(.6, 3.6 - s.mag * .62), a = Math.min(1, 1.25 - s.mag * .17);
      a *= .75 + .25 * Math.sin(t / 1000 * s.ts + s.tw);
      if (s.blue) { const pu = .5 + .5 * Math.sin(t / 1400); const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9 + pu * 5); gg.addColorStop(0, 'rgba(170,215,255,.55)'); gg.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, 6.3); ctx.fill(); a = .8 + .2 * pu; }
      if (s.mag < 2.6) { const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 4); gg.addColorStop(0, 'rgba(255,230,180,.35)'); gg.addColorStop(1, 'rgba(255,230,180,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p[0], p[1], r * 4, 0, 6.3); ctx.fill(); }
      ctx.globalAlpha = Math.max(.15, a); ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; });
    // moon: travels ~13 deg/day ahead of the "sun"
    const ph = moonPhase(date), sunRa = ((date.getTime() / 864e5 - 10957.5) * .9856 + 280) * D, mra = sunRa + ph * 2 * Math.PI, [mal, maz] = altaz(mra, 5 * D, L);
    if (mal > 0) { const [x, y] = P(mal, maz), mr = 16; const gg = ctx.createRadialGradient(x, y, mr, x, y, mr * 3.5); gg.addColorStop(0, 'rgba(255,240,200,.25)'); gg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, mr * 3.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#2a2d4a'; ctx.beginPath(); ctx.arc(x, y, mr, 0, 6.3); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, mr, 0, 6.3); ctx.clip(); ctx.fillStyle = '#fff1cc';
      const k = Math.cos(ph * 2 * Math.PI), wax = ph < .5; // lit half + terminator ellipse
      ctx.beginPath(); ctx.arc(x, y, mr, -Math.PI / 2, Math.PI / 2, !wax); ctx.ellipse(x, y, Math.abs(k) * mr, mr, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === wax); ctx.fill(); ctx.restore(); }
    // horizon: soft hills silhouette
    const [, , Rr] = P(0, 0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, Hh); ctx.moveTo(W / 2 + panX + Rr, Hh * .42 + panY); ctx.arc(W / 2 + panX, Hh * .42 + panY, Rr, 0, 2 * Math.PI, true); ctx.fillStyle = '#18241a'; ctx.fill('evenodd'); ctx.restore();
    ctx.strokeStyle = 'rgba(255,200,140,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W / 2 + panX, Hh * .42 + panY, Rr, 0, 6.3); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,170,.6)'; ctx.font = '13px Georgia, serif'; ctx.textAlign = 'center';
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([n, a]) => { const [x, y] = P(-4 * D, a * D); ctx.fillText(n, x, y); });
    raf = requestAnimationFrame(draw);
  }
  function tap(x, y) {
    let best = -1, bd = 26;
    stars.forEach((s, i) => { const p = proj[i]; if (!p || (s.con == null && !s.blue)) return; const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = i; } });
    if (best < 0) { CONS.forEach((c, ci) => { const pts = c.idx.map(i => proj[i]).filter(Boolean); if (!pts.length) return; const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length; const d = Math.hypot(cx - x, cy - y); if (d < 46 && d < bd + 20) { bd = d; best = c.idx[0]; } }); }
    if (best < 0) { tapped = null; info.hidden = true; return; }
    const s = stars[best];
    if (s.blue) { tapped = null; const lab = ((window.BOT_TOWN || {}).blueStar || {}).label || ''; info.innerHTML = '<div class="heart">💙</div>' + (lab ? '<p></p>' : ''); if (lab) info.querySelector('p').textContent = lab; info.hidden = false; return; }
    tapped = s.con; const c = CONS[s.con]; info.innerHTML = '<b></b><p></p>'; info.querySelector('b').textContent = c.n; info.querySelector('p').textContent = c.t; info.hidden = false;
  }
  function open() { if (!wrap) build(); wrap.hidden = false; panX = panY = 0; tapped = null; info.hidden = true; resize(); addEventListener('resize', resize); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
  function close() { wrap.hidden = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); }
  window.BotSky = { open, close, _test: { stars, CONS, altaz, lst, LAT, nowDate, moonPhase, blueIdx, proj: () => proj, moon: () => { const d = nowDate(), L = lst(d), ph = moonPhase(d), sr = ((d.getTime() / 864e5 - 10957.5) * .9856 + 280) * D; return altaz(sr + ph * 2 * Math.PI, 5 * D, L).map(v => v / D); } } };
})();
