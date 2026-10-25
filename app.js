(() => {
  const CFG = window.BOT_TOWN, C = CFG.characters, $ = s => document.querySelector(s);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem('bt-' + k)) ?? d; } catch (e) { return d; } }, set: (k, v) => localStorage.setItem('bt-' + k, JSON.stringify(v)) };
  const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="#6b3f1f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    back: sv('<path d="M15 5l-7 7 7 7"/>'), music: sv('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
    cam: sv('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><circle cx="12" cy="12" r="2.5"/>'),
    tasks: sv('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/><path d="M10 2.5h4v3h-4z"/>'),
    chat: sv('<path d="M4 6a3 3 0 013-3h10a3 3 0 013 3v7a3 3 0 01-3 3h-6l-5 4v-4a3 3 0 01-2-3z"/>'),
    work: sv('<path d="M14.5 5.5a4 4 0 015 5l-9.5 9.5a2 2 0 01-3-3z"/><path d="M14 9l1 1"/>'),
    relax: sv('<path d="M5 10h11v4a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 010 5H16"/><path d="M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4"/>'),
    visit: sv('<path d="M3 12v5h18v-5a2 2 0 00-4 0v2H7v-2a2 2 0 00-4 0z"/><path d="M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2M5 17v2M19 17v2"/>'),
    ladder: sv('<path d="M7 2v20M17 2v20M7 6h10M7 10h10M7 14h10M7 18h10"/>'),
    down: sv('<path d="M7 2v13M17 2v13M7 6h10M7 10h10"/><path d="M12 14v8M8.5 18.5L12 22l3.5-3.5"/>'),
    up: sv('<path d="M7 9v13M17 9v13M7 14h10M7 18h10"/><path d="M12 10V2M8.5 5.5L12 2l3.5 3.5"/>')
  };
  $('#back').innerHTML = IC.back; $('#musicBtn').innerHTML = IC.music; $('#mapMusic').innerHTML = IC.music; $('#camBtn').innerHTML = IC.cam;
  $('#tbTasks i').innerHTML = IC.tasks; $('#tbChat i').innerHTML = IC.chat; $('#tbVisit i').innerHTML = IC.visit;
  Object.keys(localStorage).filter(k => k.startsWith('bt-decor-')).forEach(k => localStorage.removeItem(k)); // clean up old decorate-mode saves
  const sprAspect = {}; // width/height of each sprite, filled by preloader

  // ---------- map ----------
  for (const [id, c] of Object.entries(C)) {
    const h = document.createElement('div'), s = c.hotspot;
    h.className = 'hot'; h.dataset.id = id; h.setAttribute('role', 'button'); h.setAttribute('aria-label', 'Visit ' + c.name);
    Object.assign(h.style, { left: s.left + '%', top: s.top + '%', width: s.width + '%', height: s.height + '%' });
    if (c.mapMarker === 'lantern') h.classList.add('mini');
    h.innerHTML = (c.mapMarker === 'lantern' ? '<i class="lantern"></i>' : '') + `<span class="label">${c.name}</span>`;
    h.addEventListener('click', () => { h.classList.remove('tap'); void h.offsetWidth; h.classList.add('tap'); setTimeout(() => enter(id), 380); });
    $('#hotspots').appendChild(h);
  }

  // ---------- house state ----------
  let cur = null, curId = null, actors = {}, visiting = false;
  const stage = $('#stage'), vp = $('#viewport');
  let W = 0, H = 0, cam = { x: 0, y: 0, s: 1 };
  const tasksDone = id => store.get('tasks-' + id, []);
  const isBusy = id => { const o = store.get('busy-' + id, null); return o !== null ? o : C[id].tasks.some((_, i) => !tasksDone(id)[i]); };

  function enter(id) {
    curId = id; cur = C[id]; visiting = false;
    $('#house').style.background = cur.room.backdrop;
    $('#roomImg').src = cur.room.image;
    $('#houseName').textContent = cur.house; $('#houseRole').textContent = `${cur.name} · ${cur.role}`;
    $('#chat').hidden = true; $('#log').innerHTML = ''; hideBubble();
    $('#tbVisit').disabled = id === CFG.player || !cur.room.visitor;
    $('#tasks').classList.add('collapsed');
    $('#map').classList.remove('active'); $('#house').classList.add('active');
    layout(); buildActors(); resetCam(false); buildLinks(); renderTasks(); updateMode(true);
    history.pushState({ id }, '', '#' + id);
  }
  function toMap(fromPop) {
    $('#house').classList.remove('active'); $('#map').classList.add('active'); $('#music').hidden = true;
    if (!fromPop && location.hash) history.back();
  }
  $('#back').onclick = () => toMap(false);
  window.addEventListener('popstate', () => { if ($('#house').classList.contains('active')) toMap(true); });

  // ---------- camera: pan + pinch + wheel ----------
  function layout() { W = innerWidth; H = W * (cur.room.aspect || .75); stage.style.width = W + 'px'; stage.style.height = H + 'px'; }
  function applyCam() {
    cam.s = Math.min(3.5, Math.max(.7, cam.s));
    const vw = innerWidth, vh = innerHeight;
    cam.x = Math.min(vw * .6, Math.max(vw * .4 - W * cam.s, cam.x)); cam.y = Math.min(vh * .6, Math.max(vh * .4 - H * cam.s, cam.y));
    stage.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`;
  }
  function resetCam(anim = true) {
    const vw = innerWidth, vh = innerHeight; cam.s = cur.room.zoom || (innerWidth < 600 ? 1.32 : 1.12);
    const fx = cur.room.zoom && actors.main ? actors.main._pos.x / 100 : .5; cam.x = vw / 2 - fx * W * cam.s; cam.y = (120 + (vh - 96)) / 2 - H * cam.s / 2 + 10;
    if (anim) { stage.classList.add('anim'); setTimeout(() => stage.classList.remove('anim'), 500); }
    applyCam(); hideBubble();
  }
  $('#camBtn').onclick = () => resetCam(true);
  addEventListener('resize', () => { if (curId) { layout(); resetCam(false); } });
  const ptrs = new Map(); let gest = null, moved = false;
  const startGesture = () => {
    const p = [...ptrs.values()];
    if (p.length === 1) gest = { type: 'pan', sx: p[0].x, sy: p[0].y, cx: cam.x, cy: cam.y };
    else if (p.length >= 2) { const mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; gest = { type: 'pinch', d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: cam.s, wx: (mx - cam.x) / cam.s, wy: (my - cam.y) / cam.s }; }
    else gest = null;
  };
  vp.addEventListener('pointerdown', e => { if (ptrs.size === 0) moved = false; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); startGesture(); });
  addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId) || !gest) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); const p = [...ptrs.values()];
    if (gest.type === 'pan') { const dx = p[0].x - gest.sx, dy = p[0].y - gest.sy; if (Math.hypot(dx, dy) > 7) moved = true; if (moved) { cam.x = gest.cx + dx; cam.y = gest.cy + dy; applyCam(); hideBubble(); } }
    else if (p.length >= 2) { moved = true; const mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; cam.s = gest.s * Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) / gest.d; cam.s = Math.min(3.5, Math.max(.7, cam.s)); cam.x = mx - gest.wx * cam.s; cam.y = my - gest.wy * cam.s; applyCam(); hideBubble(); }
  });
  const endPtr = e => { if (ptrs.delete(e.pointerId)) startGesture(); };
  addEventListener('pointerup', endPtr); addEventListener('pointercancel', endPtr);
  vp.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  vp.addEventListener('wheel', e => { e.preventDefault(); const k = Math.exp(-e.deltaY * .0015), wx = (e.clientX - cam.x) / cam.s, wy = (e.clientY - cam.y) / cam.s; cam.s = Math.min(3.5, Math.max(.7, cam.s * k)); cam.x = e.clientX - wx * cam.s; cam.y = e.clientY - wy * cam.s; applyCam(); }, { passive: false });
  const toStage = (cx, cy) => ({ x: (cx - cam.x) / cam.s / W * 100, y: (cy - cam.y) / cam.s / H * 100 });

  // ---------- actors & pets ----------
  function makeActor(id, spot) {
    const c = C[id], el = document.createElement('div'); el.className = 'actor'; el.dataset.id = id;
    el.style.height = c.spriteHeight + '%'; el.style.width = (c.spriteHeight * (sprAspect[id] || .6) * (cur.room.aspect || .75)) + '%';
    el.innerHTML = `<div class="face"><img src="${c.sprite}" alt="${c.name}" draggable="false"></div>`;
    place(el, spot);
    (c.pets || []).filter(p => p.kind === 'attach').forEach(p => { const h = document.createElement('div'); h.className = 'pet attach'; Object.assign(h.style, { left: p.box.left + '%', top: p.box.top + '%', width: p.box.width + '%', height: p.box.height + '%' }); h.onclick = ev => { ev.stopPropagation(); petTalk(h, p); }; el.appendChild(h); });
    el.addEventListener('click', () => { if (id === curId) openChat(); else poke(el); });
    $('#actors').appendChild(el); return el;
  }
  function place(el, p) { el.style.left = p.x + '%'; el.style.top = p.y + '%'; el.style.zIndex = Math.round(p.y * 10); el._pos = { ...p }; }
  function poke(el) { el.classList.remove('poke'); void el.offsetWidth; el.classList.add('poke'); }
  function buildActors() {
    $('#actors').innerHTML = ''; actors = {};
    actors.main = makeActor(curId, isBusy(curId) ? cur.room.work : cur.room.hangout);
    (cur.pets || []).forEach(p => {
      if (p.kind === 'attach') return;
      const el = document.createElement('div');
      if (p.kind === 'sprite') { el.className = 'pet dot'; Object.assign(el.style, { left: p.x + '%', top: p.y + '%', width: p.size + '%' }); el.innerHTML = `<img src="${p.sprite}" alt="${p.name}" draggable="false">`; }
      else { el.className = 'pet'; Object.assign(el.style, { left: p.left + '%', top: p.top + '%', width: p.width + '%', height: p.height + '%' }); }
      el.style.zIndex = 2000; el.onclick = ev => { ev.stopPropagation(); petTalk(el, p); };
      $('#actors').appendChild(el);
    });
  }
  function walk(el, target) {
    const from = el._pos, door = cur.room.door, legs = [];
    if (door && (from.x - door.x) * (target.x - door.x) < 0) legs.push(door);
    legs.push(target); clearTimeout(el._t);
    const go = () => {
      const t = legs.shift(); if (!t) { el.classList.remove('walking'); return; }
      const d = Math.hypot(t.x - el._pos.x, (t.y - el._pos.y) * .75); if (d < .5) return go();
      el.classList.toggle('flip', t.x < el._pos.x); el.classList.add('walking');
      const dur = Math.max(.6, d * .09); el.style.transitionDuration = dur + 's';
      place(el, t); el._t = setTimeout(go, dur * 1000);
    };
    go();
  }
  function updateMode(initial) {
    const busy = isBusy(curId) && !visiting, target = busy ? cur.room.work : cur.room.hangout;
    if (!initial) walk(actors.main, target);
    const done = tasksDone(curId), next = cur.tasks.find((_, i) => !done[i]);
    $('#statusChip').innerHTML = busy ? `<b>Working on</b>${next || 'Tidying up'}` : visiting ? `<b>Hanging out</b>Chatting with ${C[CFG.player].name}` : `<b>Relaxing</b>${next ? 'Taking a cozy break' : 'All tasks done! Tea time'}`;
    const tb = $('#tbBusy'); tb.querySelector('i').innerHTML = isBusy(curId) ? IC.work : IC.relax; tb.querySelector('span').textContent = isBusy(curId) ? 'Working' : 'Relaxing'; tb.classList.toggle('on', isBusy(curId));
    $('#tbVisit').classList.toggle('on', visiting); $('#tbVisit span').textContent = visiting ? 'Leave seat' : 'Sit with';
  }
  $('#tbBusy').onclick = () => { store.set('busy-' + curId, !isBusy(curId)); if (visiting) toggleVisit(); else updateMode(); };
  function toggleVisit() {
    if (curId === CFG.player || !cur.room.visitor) return;
    visiting = !visiting;
    if (visiting) { const v = cur.room.visitor; actors.visitor = makeActor(CFG.player, { x: v.x + (v.x > 50 ? 12 : -12), y: v.y + 6 }); requestAnimationFrame(() => requestAnimationFrame(() => walk(actors.visitor, v))); }
    else if (actors.visitor) { actors.visitor.remove(); actors.visitor = null; }
    updateMode();
  }
  $('#tbVisit').onclick = toggleVisit;

  // ---------- links between houses (e.g. Loria's ↔ Scout's burrow) ----------
  function buildLinks() {
    const links = cur.room.links || [], btn = $('#linkBtn'); btn.hidden = !links.length;
    links.forEach((l, i) => {
      if (i === 0) { btn.innerHTML = (IC[l.icon] || '') + `<span>${l.label}</span>`; btn.onclick = () => go(l.to); }
      const el = document.createElement('div');
      if (l.zone) { el.className = 'link zone glow'; Object.assign(el.style, { left: l.zone.left + '%', top: l.zone.top + '%', width: l.zone.width + '%', height: l.zone.height + '%' }); }
      else if (l.badge) { el.className = 'link badge'; Object.assign(el.style, { left: l.badge.x + '%', top: l.badge.y + '%' }); el.innerHTML = IC.ladder; }
      else return;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', l.label);
      el.onclick = ev => { ev.stopPropagation(); go(l.to); };
      $('#actors').appendChild(el);
    });
  }
  function go(to) { $('#house').style.opacity = 0; setTimeout(() => { history.replaceState(null, '', location.pathname + location.search); enter(to); history.replaceState({ id: to }, '', '#' + to); $('#house').style.opacity = ''; }, 250); }

  // ---------- bubbles ----------
  let bubbleT;
  function showBubble(el, name, text) {
    const r = el.getBoundingClientRect(), b = $('#bubble');
    b.innerHTML = `<b>${name}</b>${text}`; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    b.style.left = Math.min(innerWidth - 110, Math.max(110, r.left + r.width / 2)) + 'px'; b.style.top = Math.max(150, r.top - 6) + 'px';
    clearTimeout(bubbleT); bubbleT = setTimeout(hideBubble, 3000);
  }
  function hideBubble() { $('#bubble').hidden = true; }
  function petTalk(el, p) { showBubble(el, p.name, pick(p.lines)); el.animate([{ transform: el.style.transform || '' }, { scale: '1.15' }, { scale: '1' }], { duration: 350 }); }

  // ---------- tasks ----------
  function renderTasks() {
    const done = tasksDone(curId), ul = $('#taskList'); ul.innerHTML = '';
    cur.tasks.forEach((t, i) => { const li = document.createElement('li'); li.innerHTML = `<label><input type="checkbox" ${done[i] ? 'checked' : ''}><span>${t}</span></label>`; li.querySelector('input').onchange = e => { const d = tasksDone(curId); d[i] = e.target.checked; store.set('tasks-' + curId, d); store.set('busy-' + curId, null); countTasks(); updateMode(); }; ul.appendChild(li); });
    countTasks();
  }
  function countTasks() { const d = tasksDone(curId); $('#taskCount').textContent = `${cur.tasks.filter((_, i) => d[i]).length}/${cur.tasks.length}`; }
  const toggleTasks = () => { $('#tasks').classList.toggle('collapsed'); $('#tbTasks').classList.toggle('on', !$('#tasks').classList.contains('collapsed')); };
  $('#tasksHead').onclick = toggleTasks; $('#tbTasks').onclick = toggleTasks;

  // ---------- chat ----------
  function say(who, text) { const m = document.createElement('div'); m.className = 'msg ' + who; m.textContent = text; $('#log').appendChild(m); $('#log').scrollTop = 1e6; }
  function openChat() {
    poke(actors.main); $('#chathead').textContent = cur.name;
    if ($('#chat').hidden) { $('#chat').hidden = false; if (!$('#log').children.length) say('them', pick(cur.dialog)); } else say('them', pick(cur.dialog));
  }
  $('#tbChat').onclick = openChat;
  $('#close').onclick = () => { $('#chat').hidden = true; };
  $('#replies').onclick = e => {
    const r = e.target.dataset.r; if (!r) return; say('me', r);
    const d = tasksDone(curId), next = cur.tasks.find((_, i) => !d[i]);
    const ans = r.startsWith('What') ? (next ? `Right now: ${next}!` : `Everything's done — tea time! ☕`) : pick(cur.dialog);
    setTimeout(() => say('them', ans), 500);
  };

  // ---------- music ----------
  const mus = $('#music'); document.body.appendChild(mus); mus.style.zIndex = 70;
  function renderTracks() {
    const t = $('#tracks'); t.innerHTML = '';
    [['', 'Off'], ...Object.entries(BotMusic.TRACKS).map(([k, v]) => [k, v.name])].forEach(([k, n]) => { const b = document.createElement('button'); b.textContent = n; b.classList.toggle('on', (BotMusic.current || '') === k); b.onclick = () => { BotMusic.play(k); store.set('music', k); renderTracks(); }; t.appendChild(b); });
    $('#musicBtn').classList.toggle('on', !!BotMusic.current); $('#mapMusic').classList.toggle('on', !!BotMusic.current);
  }
  function toggleMusic(btn) { if (!mus.hidden) { mus.hidden = true; return; } renderTracks(); mus.hidden = false; const r = btn.getBoundingClientRect(); mus.style.right = (innerWidth - r.right) + 'px'; if (r.top > innerHeight / 2) { mus.style.top = 'auto'; mus.style.bottom = (innerHeight - r.top + 8) + 'px'; } else { mus.style.bottom = 'auto'; mus.style.top = (r.bottom + 8) + 'px'; } }
  $('#musicBtn').onclick = () => toggleMusic($('#musicBtn')); $('#mapMusic').onclick = () => toggleMusic($('#mapMusic'));
  document.addEventListener('pointerdown', e => { if (!mus.hidden && !mus.contains(e.target) && !e.target.closest('#musicBtn,#mapMusic')) mus.hidden = true; });

  // ---------- loader ----------
  (function () {
    const tips = CFG.loadingTips || [], urls = ['assets/map.jpg', ...Object.values(C).flatMap(c => [c.sprite, c.room.image, ...(c.pets || []).filter(p => p.sprite).map(p => p.sprite)])];
    let done = 0, ti = 0; const t0 = Date.now(), slow = +(new URLSearchParams(location.search).get('loaddelay') || 0);
    const tipEl = $('#tip'); if (tips.length) tipEl.textContent = tips[0];
    const tipTimer = setInterval(() => { tipEl.style.opacity = 0; setTimeout(() => { ti = (ti + 1) % tips.length; tipEl.textContent = tips[ti]; tipEl.style.opacity = 1; }, 300); }, 1800);
    const step = () => { done++; const p = Math.round(done / urls.length * 100); $('#fill').style.width = p + '%'; $('#pct').textContent = p + '%';
      if (done === urls.length) setTimeout(() => { clearInterval(tipTimer); $('#loader').classList.add('done'); }, Math.max(700, 1400 - (Date.now() - t0)) + slow); };
    urls.forEach((u, i) => setTimeout(() => { const im = new Image(); im.onload = () => { for (const [id, c] of Object.entries(C)) if (c.sprite === u) sprAspect[id] = im.naturalWidth / im.naturalHeight; step(); }; im.onerror = step; im.src = u; }, i * slow / urls.length));
  })();

  // ---------- day/night tint ----------
  function tint() {
    const q = new URLSearchParams(location.search).get('hour'), h = q !== null ? +q : new Date().getHours() + new Date().getMinutes() / 60; let bg = 'transparent';
    if (h < 5 || h >= 21) bg = 'rgba(60,70,150,.45)'; else if (h < 7) bg = 'rgba(255,170,150,.25)'; else if (h >= 19.5) bg = 'rgba(120,90,170,.35)'; else if (h >= 18) bg = 'rgba(255,140,80,.22)';
    $('#tint').style.background = bg;
  }
  tint(); setInterval(tint, 60000);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  window.__bt = { enter, go, cam, applyCam }; // handy for testing
})();
