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
    up: sv('<path d="M7 9v13M17 9v13M7 14h10M7 18h10"/><path d="M12 10V2M8.5 5.5L12 2l3.5 3.5"/>'),
    mail: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    board: sv('<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M7 21l2-4M17 21l-2-4M7 8h6M7 11h9M7 14h4"/>')
  };
  $('#back').innerHTML = IC.back; $('#musicBtn').innerHTML = IC.music; $('#mapMusic').innerHTML = IC.music; $('#camBtn').innerHTML = IC.cam; $('#mailBtn').innerHTML = IC.mail; $('#boardBtn').innerHTML = IC.board;
  const motionMQ = matchMedia('(prefers-reduced-motion: reduce)');
  let motionOK = !motionMQ.matches;
  const buzz = ms => { try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {} };
  document.addEventListener('pointerdown', e => { if (e.target.closest('button, .hot, .link')) buzz(8); }, { passive: true });
  document.addEventListener('gesturestart', e => e.preventDefault());
  $('#tbTasks i').innerHTML = IC.tasks; $('#tbChat i').innerHTML = IC.chat; $('#tbVisit i').innerHTML = IC.visit;
  Object.keys(localStorage).filter(k => k.startsWith('bt-decor-')).forEach(k => localStorage.removeItem(k)); // clean up old decorate-mode saves
  const sprAspect = {}; // width/height of each sprite, filled by preloader

  // ---------- map ----------
  const mapEl = $('#map');
  mapEl.scrollTop = 0;
  let mapPress = null;
  mapEl.addEventListener('pointerdown', e => { mapPress = { x: e.clientX, y: e.clientY, top: mapEl.scrollTop, moved: false }; }, { capture: true, passive: true });
  mapEl.addEventListener('pointermove', e => {
    if (!mapPress || mapPress.moved) return;
    if (Math.hypot(e.clientX - mapPress.x, e.clientY - mapPress.y) > 10) mapPress.moved = true;
  }, { capture: true, passive: true });
  const mapDragged = () => !!(mapPress && (mapPress.moved || Math.abs(mapEl.scrollTop - mapPress.top) > 4));
  for (const [id, c] of Object.entries(C)) {
    if (!c.hotspot) continue;
    const h = document.createElement('div'), s = c.hotspot;
    h.className = 'hot' + (c.mapImage ? ' building' : ''); h.dataset.id = id; h.setAttribute('role', 'button'); h.setAttribute('aria-label', 'Visit ' + c.name);
    Object.assign(h.style, { left: s.left + '%', top: s.top + '%', width: s.width + '%', height: s.height + '%' });
    if (c.mapMarker === 'lantern') h.classList.add('mini');
    if (c.mapImage || c.mapMarker === 'lantern') h.innerHTML = (c.mapImage ? `<img src="${c.mapImage}" alt="" draggable="false">` : '') + (c.mapMarker === 'lantern' ? '<i class="lantern"></i>' : '');
    h.addEventListener('click', () => {
      if (mapDragged()) return;
      h.classList.remove('tap'); void h.offsetWidth; h.classList.add('tap');
      const wrap = $('#mapwrap');
      if (motionOK) {
        const hr = h.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        wrap.style.transformOrigin = ((hr.left + hr.width / 2 - wr.left) / wr.width * 100) + '% ' + ((hr.top + hr.height / 2 - wr.top) / wr.height * 100) + '%';
        mapEl.classList.add('zooming');
      }
      setTimeout(() => { mapEl.classList.remove('zooming'); wrap.style.transformOrigin = ''; enter(id, { arrive: true }); }, motionOK ? 460 : 160);
    });
    $('#hotspots').appendChild(h);
  }

  // ---------- house state ----------
  let cur = null, curId = null, actors = {}, visiting = false, pose = 'idle';
  // ---------- where each bot is: status.json when fresh, else the default schedule ----------
  const BOTS = CFG.bots || [];
  const isBot = id => BOTS.includes(id);
  const ownerOf = id => (C[id] && C[id].returnTo) || id;
  const hourParam = new URLSearchParams(location.search).get('hour');
  const hourNow = () => hourParam !== null ? +hourParam : new Date().getHours() + new Date().getMinutes() / 60;
  let liveAll = {}; // bot -> { place, pose, note } from a fresh status.json
  let statusFresh = false;
  // ----- v26: each bot's day, generated from CFG.routines and seeded by the date (?day=2026-10-24 to preview a day) -----
  const ROUT = CFG.routines || {};
  const dayParam = new URLSearchParams(location.search).get('day');
  const hashS = str => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngOf = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const dayKey = off => { const d = dayParam ? new Date(dayParam + 'T12:00:00') : new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const planCache = {};
  // rows: [fromHour, scene, pose] from waking up to bedtime (hours past midnight of that day; bedtime may be 24+)
  function dayPlan(bot, key) {
    const ck = bot + '|' + key; if (planCache[ck]) return planCache[ck];
    const R = ROUT[bot] || { sleep: [22, 7], work: .5, outings: [] }, r = rngOf(hashS(ck)), q = v => Math.round(v * 4) / 4;
    const wake = q(R.sleep[1] + (r() - .5) * .75), bed = q(R.sleep[0] + (r() - .5) * .75);
    const rows = [[wake, bot + '-bed', 'awake']]; let t = q(wake + .5 + r() * .5), last = bot + '-bed';
    while (t < bed - 1) {
      const x = r(), hr = t % 24; let place = bot, pose = 'idle', dur = .75 + r();
      if (x < R.work) { pose = 'working'; dur = 1.25 + r() * 1.75; }
      else if (x < R.work + .3) {
        const ok = (R.outings || []).filter(o => o !== last && C[o] && (o !== 'playground' || (hr >= 8 && hr < 19)) && (!(C[o].room && C[o].room.poses) || (hr >= 10 && hr < 21)));
        if (ok.length) { place = ok[Math.floor(r() * ok.length)]; pose = place === 'starfall' ? 'sitting' : 'idle'; } else pose = 'sitting';
      } else pose = r() < .5 ? 'sitting' : 'idle';
      if (place + pose === last) pose = pose === 'idle' ? 'sitting' : 'idle';
      rows.push([t, place, pose]); last = place + (place === bot ? pose : '');
      t = q(Math.min(t + dur, bed - .5));
    }
    rows.push([Math.max(t, bed - .75), bot + '-bed', 'awake']);
    return (planCache[ck] = { wake, bed, rows });
  }
  function scheduled(bot) {
    const h = hourNow(); let P = dayPlan(bot, dayKey(0)), t = h;
    if (h < P.wake) { P = dayPlan(bot, dayKey(-1)); t = h + 24; }
    if (t >= P.bed || t < P.wake) return { place: bot + '-bed', pose: 'sleeping', note: '', live: false };
    let e = P.rows[0]; P.rows.forEach(rw => { if (t >= rw[0]) e = rw; });
    return { place: e[1], pose: e[2], note: '', live: false };
  }
  // ----- v26: THE one place every scene asks "where is this character, doing what?" -----
  // Returns { scene, place (= scene), pose, note, live }. Bots: status.json when fresh, else their day plan.
  // Olithia: wherever she was last sent (localStorage bt-olithia-at), home and idle by default.
  const isChar = id => isBot(id) || id === CFG.player;
  function locate(id) {
    if (id === CFG.player) {
      const o = store.get('olithia-at', null), ok = o && C[o.scene];
      const scene = ok ? o.scene : id, pose = ok ? (o.pose || 'idle') : 'idle';
      return { scene, place: scene, pose, note: '', live: false, spot: ok ? o.spot : undefined };
    }
    const ask = store.get('ask-' + id, null); // v28: "Olithia asked" override, 60 min
    const w = ask && ask.until > Date.now() && C[ask.place] ? { place: ask.place, pose: ask.pose, note: 'Olithia asked', live: false, spot: ask.spot } : (liveAll[id] || scheduled(id)); let scene = w.place, pose = w.pose;
    if (pose === 'sleeping' || scene === 'bed' || scene === id + '-bed') { scene = id + '-bed'; pose = pose === 'sleeping' || w.place === 'bed' ? 'sleeping' : 'awake'; }
    else if (pose === 'awake') pose = 'idle';
    if (!C[scene]) scene = id;
    return { ...w, scene, place: scene, pose };
  }
  const where = locate;
  const sceneOf = id => locate(id).scene;
  const hostHome = () => !isChar(curId) || locate(curId).scene === curId;
  function setOli(scene, pose) { store.set('olithia-at', { scene, pose }); applyLive(); }
  const stage = $('#stage'), vp = $('#viewport');
  let W = 0, H = 0, cam = { x: 0, y: 0, s: 1 };
  const tasksDone = id => store.get('tasks-' + id, []);
  const isBusy = id => { const o = store.get('busy-' + id, null); return o !== null ? o : (C[id].tasks || []).some((_, i) => !tasksDone(id)[i]); };

  function inHours([from, to]) {
    const h = hourNow() % 24;
    return from > to ? (h >= from || h < to) : (h >= from && h < to);
  }
  // ?night=1 / ?night=0 forces the night look for testing; bedrooms use CFG.bedNight, the park its own nightHours
  const nightParam = new URLSearchParams(location.search).get('night');
  const isNight = () => nightParam !== null ? nightParam === '1' : inHours(cur.room.nightHours || (cur.room.awake ? (CFG.bedNight || [20, 7]) : [19, 6]));
  // v26: which painting to show, from locate() only
  function roomURL() {
    const R = cur.room;
    if (R.poses) { // a painted house: its owner in a pose, the visit painting, or empty
      if (!hostHome()) return R.empty || R.poses.idle;
      if (visiting && R.visit) return R.visit;
      return R.poses[pose] || R.poses.idle;
    }
    if (R.awake || R.sleeping) { // a bedroom: asleep, awake, or empty, day or night
      const L = locate(cur.returnTo || curId), here = L.scene === curId, n = isNight();
      if (here && L.pose === 'sleeping') return n || !R.sleepingDay ? R.sleeping : R.sleepingDay;
      if (here) return n ? (R.awakeNight || R.awake) : R.awake;
      return n ? (R.night || R.image) : R.image;
    }
    if (R.night && isNight()) return R.night;
    return R.image;
  }
  function applyBackdrop() {
    const url = roomURL();
    const night = [cur.room.sleeping, cur.room.night, cur.room.awakeNight].filter(Boolean).includes(url);
    $('#house').style.background = night
      ? 'radial-gradient(circle at 50% 45%, #141a2e, #0b0f1c)'
      : (cur.room.backdrop || '');
    return url;
  }
  let fadeGen = 0, frontPose = 0;
  function showRoom(url, fade) {
    const imgs = [$('#roomImg'), $('#roomFade')];
    const token = ++fadeGen;
    const show = imgs[frontPose], hide = imgs[1 - frontPose];
    let painted = false;
    const paint = () => {
      if (painted || token !== fadeGen) return;
      painted = true;
      hide.style.zIndex = '1'; show.style.zIndex = '0';
      hide.style.opacity = '1'; show.style.opacity = '0';
      frontPose = 1 - frontPose;
    };
    if (!fade || !show.getAttribute('src')) {
      show.src = url; show.style.opacity = '1'; show.style.zIndex = '1';
      hide.style.opacity = '0'; hide.style.zIndex = '0';
      return;
    }
    const abs = new URL(url, location.href).href;
    if (show.src === abs) return;
    hide.onload = paint;
    hide.src = url;
    if (hide.complete && hide.naturalWidth && hide.src === abs) paint();
  }
  function enter(id, opts = {}) {
    curId = id; cur = C[id];
    visiting = id !== CFG.player && locate(CFG.player).scene === id;
    pose = cur.room.poses && isChar(id) && hostHome() ? locate(id).pose : 'idle';
    $('#house').style.opacity = '';
    showRoom(applyBackdrop(), false);
    $('#roomImg').alt = cur.house; $('#roomFade').alt = '';
    $('#houseName').textContent = cur.house; $('#houseRole').textContent = `${cur.name} · ${cur.role}`;
    $('#chat').hidden = true; $('#log').innerHTML = ''; hideBubble();
    const painted = !!cur.room.poses, gallery = !!cur.gallery;
    $('#house').classList.toggle('has-poses', painted);
    $('#house').classList.toggle('gallery', gallery);
    $('#house').classList.toggle('play', !!cur.play);
    $('#motto').hidden = !cur.room.motto; $('#motto').textContent = cur.room.motto || '';
    $('#tbBusy').hidden = painted || gallery;
    $('#tbVisit').hidden = painted || gallery;
    $('#tbVisit').disabled = id === CFG.player || !cur.room.visitor;
    $('#tasks').hidden = gallery || !cur.tasks;
    $('#statusChip').hidden = gallery;
    $('#tasks').classList.add('collapsed');
    $('#back').setAttribute('aria-label', cur.returnTo ? ('Back to ' + C[cur.returnTo].house) : 'Back to map');
    $('#map').classList.remove('active'); $('#house').classList.add('active');
    layout(); buildActors(); buildGuests(); resetCam(false); buildLinks(); buildPlay();
    $('#tasks').hidden = gallery || !(cur.tasks || isBot(id));
    if (cur.tasks || isBot(id)) renderTasks();
    updateMode(true);
    if (motionOK && opts.arrive) { $('#house').classList.add('arriving'); setTimeout(() => $('#house').classList.remove('arriving'), 720); }
    if (motionOK && opts.door) { vp.classList.remove('door-shut'); vp.classList.add('door-open'); setTimeout(() => vp.classList.remove('door-open'), 680); }
    maybeTiltPrompt();
    if (!opts.skipPush) history.pushState({ id }, '', '#' + id);
  }
  function toMap(fromPop) {
    $('#house').classList.remove('active'); $('#map').classList.add('active'); $('#music').hidden = true;
    $('#house').style.opacity = '';
    cur = null; curId = null;
    if (!fromPop && location.hash) history.back();
  }
  let doorReturn = false;
  $('#back').onclick = () => {
    if (cur && cur.returnTo) {
      if (motionOK) vp.classList.add('door-shut');
      $('#house').style.opacity = '0';
      doorReturn = true;
      setTimeout(() => history.back(), motionOK ? 320 : 0);
    } else toMap(false);
  };
  window.addEventListener('popstate', () => {
    const id = history.state && history.state.id;
    if (id && C[id]) { const door = doorReturn; doorReturn = false; enter(id, { skipPush: true, door }); }
    else if ($('#house').classList.contains('active')) toMap(true);
  });

  // ---------- camera: pan + pinch + wheel ----------
  function layout() { W = innerWidth; H = W * (cur.room.aspect || .75); stage.style.width = W + 'px'; stage.style.height = H + 'px'; }
  function applyCam() {
    if (cur && cur.room.scroll) { // scroll-only scene: full width, vertical pan, no zoom
      cam.s = 1; cam.x = 0; cam.y = Math.min(0, Math.max(innerHeight - H, cam.y));
      stage.style.transform = `translate(0px,${cam.y}px) scale(1)`; return;
    }
    cam.s = Math.min(3.5, Math.max(.7, cam.s));
    const vw = innerWidth, vh = innerHeight;
    cam.x = Math.min(vw * .6, Math.max(vw * .4 - W * cam.s, cam.x)); cam.y = Math.min(vh * .6, Math.max(vh * .4 - H * cam.s, cam.y));
    stage.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`;
  }
  function resetCam(anim = true) {
    if (cur.room.scroll) { cam.s = 1; cam.x = 0; cam.y = 0; applyCam(); hideBubble(); return; }
    const vw = innerWidth, vh = innerHeight; cam.s = cur.room.zoom || (innerWidth < 600 ? 1.32 : 1.12);
    const fx = cur.room.zoom && actors.main ? actors.main._pos.x / 100 : .5; cam.x = vw / 2 - fx * W * cam.s; cam.y = (galleryPad() + (vh - 96)) / 2 - H * cam.s / 2 + 10;
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
    if (gest.type === 'pan') { const dx = p[0].x - gest.sx, dy = p[0].y - gest.sy; if (Math.hypot(dx, dy) > 7) moved = true; if (moved) { cam.x = gest.cx + dx; cam.y = gest.cy + dy; applyCam(); hideBubble(); if (motionOK && !tiltFresh()) { lookT.x = clamp((p[0].x / innerWidth - .5) * 22, -11, 11); lookT.y = clamp((p[0].y / innerHeight - .5) * 16, -8, 8); } } }
    else if (p.length >= 2) { moved = true; const mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; cam.s = gest.s * Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) / gest.d; cam.s = Math.min(3.5, Math.max(.7, cam.s)); cam.x = mx - gest.wx * cam.s; cam.y = my - gest.wy * cam.s; applyCam(); hideBubble(); }
  });
  const endPtr = e => { if (ptrs.delete(e.pointerId)) { startGesture(); if (!ptrs.size && !tiltFresh()) { lookT.x = 0; lookT.y = 0; } } };
  addEventListener('pointerup', endPtr); addEventListener('pointercancel', endPtr);
  vp.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  vp.addEventListener('wheel', e => { e.preventDefault(); if (cur && cur.room.scroll) { cam.y -= e.deltaY; applyCam(); hideBubble(); return; } const k = Math.exp(-e.deltaY * .0015), wx = (e.clientX - cam.x) / cam.s, wy = (e.clientY - cam.y) / cam.s; cam.s = Math.min(3.5, Math.max(.7, cam.s * k)); cam.x = e.clientX - wx * cam.s; cam.y = e.clientY - wy * cam.s; applyCam(); }, { passive: false });
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
    if (cur.room.poses || cur.gallery || !cur.sprite) return;
    if (!cur.bot || where(cur.bot).place === curId) actors.main = makeActor(curId, isBusy(curId) ? cur.room.work : cur.room.hangout);
    if (cur.room.visitor && curId !== CFG.player && locate(CFG.player).scene === curId) actors.visitor = makeActor(CFG.player, cur.room.visitor);
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
    if (cur.gallery) return;
    if (cur.room.poses && !hostHome()) {
      const w = locate(curId);
      $('#statusChip').innerHTML = `<b>Out</b>${esc(awayLine(w))}${curId === CFG.player ? ' · tap the desk or sofa to come home' : ''}`;
      return;
    }
    if (cur.room.poses && isBot(curId)) {
      const w = where(curId), label = { working: 'Working on', sitting: 'Sitting', idle: 'Relaxing' }[pose] || 'Here';
      let line = w.note || (pose === 'working' ? 'Busy working' : pose === 'sitting' ? 'Taking a cozy break' : 'A quiet idle moment');
      $('#statusChip').innerHTML = visiting && cur.room.visit ? `<b>Sitting together</b>Tea with ${esc(C[CFG.player].name)}` : `<b>${label}</b>${esc(line)}`;
      return;
    }
    if (cur.room.poses) {
      const done = tasksDone(curId), next = (cur.tasks || []).find((_, i) => !done[i]);
      const line = pose === 'working'
        ? ['Working on', next || 'Tidying up']
        : pose === 'sitting'
          ? ['Sitting', next ? 'Taking a cozy break' : 'All tasks done! Tea time']
          : ['Relaxing', next ? 'A quiet idle moment' : 'All tasks done! Tea time'];
      $('#statusChip').innerHTML = `<b>${line[0]}</b>${line[1]}`;
      return;
    }
    const busy = isBusy(curId) && !visiting, target = busy ? cur.room.work : cur.room.hangout;
    if (!initial && actors.main) walk(actors.main, target);
    const done = tasksDone(curId), next = (cur.tasks || []).find((_, i) => !done[i]);
    $('#statusChip').innerHTML = busy ? `<b>Working on</b>${next || 'Tidying up'}` : visiting ? `<b>Hanging out</b>Chatting with ${C[CFG.player].name}` : `<b>Relaxing</b>${next ? 'Taking a cozy break' : 'All tasks done! Tea time'}`;
    const tb = $('#tbBusy'); tb.querySelector('i').innerHTML = isBusy(curId) ? IC.work : IC.relax; tb.querySelector('span').textContent = isBusy(curId) ? 'Working' : 'Relaxing'; tb.classList.toggle('on', isBusy(curId));
    $('#tbVisit').classList.toggle('on', visiting); $('#tbVisit span').textContent = visiting ? 'Leave seat' : 'Sit with';
  }
  function galleryPad() { return cur && cur.gallery ? 80 : 120; }
  $('#tbBusy').onclick = () => { store.set('busy-' + curId, !isBusy(curId)); if (visiting) toggleVisit(); else updateMode(); };
  // v26: "Sit with" moves Olithia here (so her cottage shows empty); again sends her home
  function toggleVisit() {
    if (curId === CFG.player || !cur.room.visitor) return;
    if (visiting) setOli(CFG.player, 'idle'); else setOli(curId, 'visit');
  }
  $('#tbVisit').onclick = toggleVisit;

  // ---------- links between houses (e.g. Loria's ↔ Scout's burrow) ----------
  // v29: painted doors are the tap zones: a warm glow on touch/hover, a brief bloom, then the walk-through
  function hintOnce(el, k) { const key = 'hint-' + k + '-' + curId; if (!store.get(key, false)) { store.set(key, true); el.classList.add('hint'); } }
  function doorZone(zone, label, go) {
    const el = addZone(zone, label, () => { el.classList.add('open'); setTimeout(go, 260); });
    el.className = 'link zone door'; hintOnce(el, 'door'); return el;
  }
  function addZone(zone, label, fn, tag) {
    const el = document.createElement('div');
    el.className = 'link zone glow';
    Object.assign(el.style, { left: zone.left + '%', top: zone.top + '%', width: zone.width + '%', height: zone.height + '%' });
    if (tag) el.innerHTML = `<span class="tag">${tag}</span>`;
    el.setAttribute('role', 'button'); el.setAttribute('aria-label', label);
    el.onclick = ev => { ev.stopPropagation(); fn(); };
    $('#actors').appendChild(el);
    return el;
  }
  function buildDoors() {
    // v26: Olithia's cottage and bedroom: tap an object to move her there (tap it again or the floor for idle)
    (cur.room.objects || []).forEach(o => { const el = addZone(o.zone, o.label, () => tapObject(o)); el.classList.remove('glow'); el.classList.add('obj'); el.style.zIndex = o.floor ? 500 : 600; });
    if ((cur.room.objects || []).length && !store.get('hinted-' + curId, false)) { store.set('hinted-' + curId, true); $('#actors').querySelectorAll('.obj:not([aria-label=Floor])').forEach(e => e.classList.add('hint')); }
    const bed = cur.room.bedroom;
    if (bed) doorZone(bed.door, bed.label, () => travel(bed.to, { door: true }));
    if (cur.returnTo && cur.room.door) doorZone(cur.room.door, 'Back to the house', () => travel(cur.returnTo, { door: true })); // v29: bedroom door -> house
    (cur.room.spots || []).forEach((s, si) => { const el = addZone(s.zone, s.label, () => {
      if (s.poems) openPoems();
      if (s.seats && curId === 'starfall') sitInPark(si, el); // v29: any spot is a seat for Olithia (if one is free)
      else if (!s.poems) showBubble(el, s.label, s.caption);
    }); el.classList.remove('glow'); }); // invisible until tapped
    if (cur.room.visit && cur.room.seat && curId !== CFG.player && (hostHome() || visiting || isBot(curId))) { const el = addZone(cur.room.seat, visiting ? 'Leave the seat' : `Sit with ${cur.name}`, toggleSeat); el.className = 'link zone door seatz'; hintOnce(el, 'seat'); }
  }
  // Painted houses: Olithia sits with the host (the -visit image); tap again to send her home.
  function toggleSeat() { if (isBot(curId) && !visiting) askBot(curId, curId, 'sitting'); if (visiting) setOli(CFG.player, 'idle'); else setOli(curId, 'visit'); }
  function askBot(bot, place, p) { store.set('ask-' + bot, { place, pose: p, until: Date.now() + 3600e3 }); applyLive(); }
  function tapObject(o) {
    const owner = cur.returnTo || curId;
    if (isBot(owner)) return askBot(owner, curId, o.pose === 'awake' || o.pose === 'sleeping' ? o.pose : o.pose);
    const L = locate(CFG.player), idle = cur.returnTo ? 'awake' : 'idle';
    let p = o.pose; if (!o.floor && L.scene === curId && L.pose === p) p = idle;
    setOli(curId, p);
  }
  function buildLinks() {
    buildDoors();
    const links = cur.room.links || [], btn = $('#linkBtn'); btn.hidden = !links.length;
    links.forEach((l, i) => {
      if (i === 0) { btn.innerHTML = (IC[l.icon] || '') + `<span>${l.label}</span>`; btn.onclick = () => travel(l.to, { replace: true, door: true }); }
      const el = document.createElement('div');
      if (l.zone) { el.className = 'link zone door'; hintOnce(el, 'link' + i); Object.assign(el.style, { left: l.zone.left + '%', top: l.zone.top + '%', width: l.zone.width + '%', height: l.zone.height + '%' }); }
      else if (l.badge) { el.className = 'link badge'; Object.assign(el.style, { left: l.badge.x + '%', top: l.badge.y + '%' }); el.innerHTML = IC.ladder; }
      else return;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', l.label);
      el.onclick = ev => { ev.stopPropagation(); el.classList.add('open'); setTimeout(() => travel(l.to, { replace: true, door: true }), 260); };
      $('#actors').appendChild(el);
    });
  }
  function travel(to, opts = {}) {
    const door = !!opts.door;
    if (door && motionOK) vp.classList.add('door-shut');
    $('#house').style.opacity = '0';
    setTimeout(() => {
      enter(to, { skipPush: !!opts.replace, door });
      if (opts.replace) history.replaceState({ id: to }, '', '#' + to);
      $('#house').style.opacity = '';
    }, door && motionOK ? 380 : 240);
  }
  function go(to) { travel(to, { replace: true }); }

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
    if (isBot(curId)) return renderBotTasks();
    $('#tasksHead b').textContent = 'To-do';
    const done = tasksDone(curId), ul = $('#taskList'); ul.innerHTML = '';
    cur.tasks.forEach((t, i) => { const li = document.createElement('li'); li.innerHTML = `<label><input type="checkbox" ${done[i] ? 'checked' : ''}><span>${t}</span></label>`; li.querySelector('input').onchange = e => { const d = tasksDone(curId); d[i] = e.target.checked; store.set('tasks-' + curId, d); store.set('busy-' + curId, null); countTasks(); updateMode(); }; ul.appendChild(li); });
    countTasks();
  }
  // Bots' houses list the questions and tasks Olithia gave that bot (tasks.json), with an Ask button.
  function renderBotTasks() {
    const ul = $('#taskList'); ul.innerHTML = '';
    const mine = boardItems().filter(t => t.for === curId);
    $('#tasksHead b').textContent = 'For ' + C[curId].name;
    $('#taskCount').textContent = mine.filter(t => t.status !== 'done').length || '';
    if (!mine.length) { const li = document.createElement('li'); li.className = 'none'; li.textContent = 'Nothing asked yet.'; ul.appendChild(li); }
    mine.forEach(t => { const li = document.createElement('li'); li.className = 'bt-' + (t.status || 'open'); li.innerHTML = `<span class="st">${esc(statusLabel(t.status))}</span> <span>${esc(t.text)}</span>`; ul.appendChild(li); });
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.className = 'pill main ask'; b.textContent = 'Ask ' + C[curId].name;
    b.onclick = ev => { ev.stopPropagation(); openBoard(curId); }; li.appendChild(b); ul.appendChild(li);
  }
  function countTasks() {
    if (isBot(curId)) return; const d = tasksDone(curId); $('#taskCount').textContent = `${cur.tasks.filter((_, i) => d[i]).length}/${cur.tasks.length}`; }
  const toggleTasks = () => { $('#tasks').classList.toggle('collapsed'); $('#tbTasks').classList.toggle('on', !$('#tasks').classList.contains('collapsed')); };
  $('#tasksHead').onclick = toggleTasks; $('#tbTasks').onclick = toggleTasks;

  // ---------- chat ----------
  function say(who, text) { const m = document.createElement('div'); m.className = 'msg ' + who; m.textContent = text; $('#log').appendChild(m); $('#log').scrollTop = 1e6; }
  function openChat() {
    if (actors.main) poke(actors.main); $('#chathead').textContent = cur.name;
    if ($('#chat').hidden) { $('#chat').hidden = false; if (!$('#log').children.length) say('them', pick(cur.dialog)); } else say('them', pick(cur.dialog));
  }
  $('#tbChat').onclick = openChat;
  $('#close').onclick = () => { $('#chat').hidden = true; };
  $('#replies').onclick = e => {
    const r = e.target.dataset.r; if (!r) return; say('me', r);
    const d = tasksDone(curId), next = (cur.tasks || []).find((_, i) => !d[i]);
    const bw = isBot(ownerOf(curId)) ? where(ownerOf(curId)) : null;
    const ans = r.startsWith('What') ? (bw && bw.note ? `Right now: ${bw.note}!` : next ? `Right now: ${next}!` : `Everything's done — tea time! ☕`) : pick(cur.dialog);
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
    const tips = CFG.loadingTips || [];
    const urls = ['assets/map-v3.webp', ...Object.values(CFG.sprites || {}).map(s => s.src), ...Object.values(C).flatMap(c => [c.sprite, c.mapImage, c.room && c.room.image, c.room && c.room.sleeping, c.room && c.room.night, c.room && c.room.awake, c.room && c.room.awakeNight, c.room && c.room.sleepingDay, c.room && c.room.visit, c.room && c.room.empty, c.room && c.room.swing && c.room.swing.src, ...Object.values(c.room.cameos || {}).flatMap(k => [k.day, k.night]), ...Object.values(c.room.poses || {}), ...(c.pets || []).filter(p => p.sprite).map(p => p.sprite)])].filter(Boolean);
    let done = 0, ti = 0; const t0 = Date.now(), slow = +(new URLSearchParams(location.search).get('loaddelay') || 0);
    const tipEl = $('#tip'); if (tips.length) tipEl.textContent = tips[0];
    const tipTimer = setInterval(() => { tipEl.style.opacity = 0; setTimeout(() => { ti = (ti + 1) % tips.length; tipEl.textContent = tips[ti]; tipEl.style.opacity = 1; }, 300); }, 1800);
    const step = () => { done++; const p = Math.round(done / urls.length * 100); $('#fill').style.width = p + '%'; $('#pct').textContent = p + '%';
      if (done === urls.length) setTimeout(() => { clearInterval(tipTimer); $('#loader').classList.add('done'); }, Math.max(700, 1400 - (Date.now() - t0)) + slow); };
    urls.forEach((u, i) => setTimeout(() => { const im = new Image(); im.onload = () => { for (const [id, c] of Object.entries(C)) if (c.sprite === u) sprAspect[id] = im.naturalWidth / im.naturalHeight; step(); }; im.onerror = step; im.src = u; }, i * slow / urls.length));
  })();

  // ---------- depth, motes, room tone, install ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sway = $('#sway');
  const look = { x: 0, y: 0 }, lookT = { x: 0, y: 0 };
  let tiltAt = 0, baseG = null, baseB = null, orientOn = false, raf = 0;
  function tiltFresh() { return performance.now() - tiltAt < 800; }
  function onOrient(e) {
    if (!motionOK || e.gamma == null || e.beta == null) return;
    if (baseG == null) { baseG = e.gamma; baseB = e.beta; }
    lookT.x = clamp((e.gamma - baseG) * .4, -12, 12);
    lookT.y = clamp((e.beta - baseB) * .28, -9, 9);
    tiltAt = performance.now();
  }
  function listenOrient() {
    if (orientOn) return; orientOn = true;
    addEventListener('deviceorientation', onOrient);
  }
  async function maybeTiltPrompt() {
    if (!motionOK || orientOn || !$('#house').classList.contains('active')) return;
    const need = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    if (!need) { listenOrient(); return; }
    if (store.get('tilt') === 'no') return;
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') { listenOrient(); $('#tiltAsk').hidden = true; return; }
    } catch (e) { /* iOS needs the tap below */ }
    if (store.get('tilt') === 'no' || orientOn) return;
    $('#tiltYes').textContent = 'Allow tilt';
    $('#tiltAsk').hidden = false;
  }
  $('#tiltYes').onclick = async () => {
    $('#tiltAsk').hidden = true;
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') { store.set('tilt', 'yes'); baseG = null; listenOrient(); }
      else store.set('tilt', 'no');
    } catch (e) { store.set('tilt', 'no'); }
  };
  $('#tiltNo').onclick = () => { $('#tiltAsk').hidden = true; store.set('tilt', 'no'); };

  function specks(n, bugs) {
    return Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: (bugs ? 1.8 : .7) + Math.random() * (bugs ? 1.2 : 1.1), s: (bugs ? .45 : .18) + Math.random() * .28, p: Math.random() * 6.28, bug: !!bugs, a: bugs ? .55 : .34 }));
  }
  const houseDust = specks(24, false).concat(specks(6, true));
  const parkDust = specks(8, false).concat(specks(18, true));
  const mapDust = specks(14, true);
  let glowSprite = null;
  function glowImg() {
    if (glowSprite) return glowSprite;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), rad = g.createRadialGradient(64, 64, 2, 64, 64, 64);
    rad.addColorStop(0, 'rgba(255,220,160,.7)'); rad.addColorStop(.4, 'rgba(255,176,90,.18)'); rad.addColorStop(1, 'rgba(255,160,60,0)');
    g.fillStyle = rad; g.fillRect(0, 0, 128, 128); glowSprite = c; return c;
  }
  const houseGlows = [{ x: .18, y: .28, s: 160 }, { x: .8, y: .34, s: 140 }, { x: .5, y: .6, s: 120 }, { x: .64, y: .2, s: 96 }];
  function fitCanvas(cv) {
    const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }
  function drawDust(cv, list, t, glows) {
    fitCanvas(cv); const g = cv.getContext('2d'), w = cv.width, h = cv.height; if (w < 8 || h < 8) return;
    g.clearRect(0, 0, w, h);
    if (glows) {
      const img = glowImg(); g.globalCompositeOperation = 'lighter';
      glows.forEach((gl, i) => {
        const flick = .72 + .28 * Math.sin(t * .0022 + i * 1.8);
        const s = gl.s * (.94 + .06 * Math.sin(t * .0011 + i));
        g.globalAlpha = .5 * flick; g.drawImage(img, gl.x * w - s / 2, gl.y * h - s / 2, s, s);
      });
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    list.forEach(p => {
      p.y -= p.s / h; p.x += Math.sin(t * .001 + p.p) * (p.bug ? .0008 : .00025);
      if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
      g.globalAlpha = p.a * (.62 + .38 * Math.sin(t * .003 + p.p));
      g.fillStyle = p.bug ? '#ffe7a8' : '#fff8ea';
      g.beginPath(); g.arc(p.x * w, p.y * h, p.r, 0, 6.3); g.fill();
    });
    g.globalAlpha = 1;
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!motionOK) return;
    if (Math.abs(lookT.x - look.x) > .03 || Math.abs(lookT.y - look.y) > .03) {
      look.x += (lookT.x - look.x) * .08; look.y += (lookT.y - look.y) * .08;
      sway.style.transform = `translate(${look.x.toFixed(2)}px,${look.y.toFixed(2)}px)`;
    }
    if ($('#house').classList.contains('active')) {
      const park = curId === 'starfall' || curId === 'playground';
      const glows = (cur && cur.room && cur.room.glows) || houseGlows;
      drawDust($('#motes'), park ? parkDust : houseDust, t, glows);
    }
    if ($('#map').classList.contains('active')) drawDust($('#mapMotes'), mapDust, t);
  }
  addEventListener('resize', () => { fitCanvas($('#motes')); fitCanvas($('#mapMotes')); });
  motionMQ.addEventListener('change', () => {
    motionOK = !motionMQ.matches;
    if (!motionOK) { look.x = look.y = lookT.x = lookT.y = 0; sway.style.transform = ''; }
  });
  if (motionOK) raf = requestAnimationFrame(frame);
  if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') listenOrient();

  let deferredPrompt = null;
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt = e;
    if (!store.get('install-no') && !matchMedia('(display-mode: standalone)').matches) $('#install').hidden = false;
  });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone && !store.get('install-no') && !matchMedia('(display-mode: standalone)').matches) {
    $('#installText').textContent = 'In Safari, tap Share, then Add to Home Screen.';
    $('#installYes').hidden = true; $('#install').hidden = false;
  }
  $('#installNo').onclick = () => { $('#install').hidden = true; store.set('install-no', true); };
  $('#installYes').onclick = async () => {
    $('#install').hidden = true;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null;
  };

  // ---------- live status (all bots), map pins, guests, playground, the town post and the town board ----------
  const LIVE_PLACES = ['gorbo', 'olithia', 'loria', 'scout', 'starfall', 'playground', 'burrow'];
  const LIVE_POSES = ['working', 'idle', 'sitting', 'sleeping', 'awake']; // v26: "awake" (or place "<bot>-bed") = up in its own bedroom
  const LIVE_MAX = 6 * 60 * 60 * 1000;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const botName = id => (C[id] && C[id].name) || String(id || '');
  const placeName = p => String(p).endsWith('-bed') ? 'the bedroom' : p === 'olithia' ? "Olithia's cottage" : (C[p] && C[p].house) || p;
  const awayLine = w => w.pose === 'sleeping' ? 'Asleep in the bedroom' : String(w.scene).endsWith('-bed') ? 'Up in the bedroom' : 'At ' + placeName(w.scene);
  function fillText(el, text) {
    el.replaceChildren();
    String(text || '').split(/\n{2,}/).forEach(para => {
      const p = document.createElement('p');
      para.split('\n').forEach((line, i) => {
        if (i) p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(line));
      });
      el.appendChild(p);
    });
  }
  // v27: Copy is primary (share sheets on some phones only offer "Save to Drive"); Share is secondary.
  function copyFallback(t) {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'; document.body.appendChild(ta);
    ta.focus(); ta.select(); try { ta.setSelectionRange(0, t.length); } catch (e) {}
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok;
  }
  async function copyText(t) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) {}
    return copyFallback(t);
  }
  let toastT;
  function toast(msg) { const el = $('#copyToast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 3500); }
  function showManual(payload, out) {
    out.replaceChildren(); const p = document.createElement('span'); p.textContent = 'Press and hold to copy, then paste it in your chat:';
    const ta = document.createElement('textarea'); ta.className = 'manualcopy'; ta.readOnly = true; ta.value = payload; ta.rows = Math.min(8, payload.split('\n').length + 1);
    ta.onfocus = () => ta.select(); out.append(p, ta);
  }
  async function passOn(payload, who, out, mode) {
    out.hidden = false;
    if (mode === 'share' && navigator.share) {
      try { await navigator.share({ text: payload }); out.textContent = `✓ Sent to the share sheet. Paste it into your ${who} chat if needed.`; return true; }
      catch (e) { if (e && e.name === 'AbortError') { out.hidden = true; return false; } }
    }
    if (await copyText(payload)) { toast(`Copied! Paste it in your chat with ${who}`); out.textContent = `✓ Sent — copied. Paste it in your chat with ${who}.`; return true; }
    showManual(payload, out); return true;
  }

  // ----- v29: Starfall Hill seat allocator. Spots are shared; one character per seat. -----
  // Preferred spot: Olithia's tap (bt-olithia-at.spot), status.json "spot" (label or index), else a per-hour pick. Taken -> next free spot.
  function parkSeats() {
    const P = C.starfall && C.starfall.room, spots = (P && P.spots) || [], out = {}, used = new Set();
    const idx = v => { if (v == null) return -1; const n = typeof v === 'number' ? v : spots.findIndex(s => s.label.toLowerCase() === String(v).toLowerCase()); return n >= 0 && n < spots.length ? n : -1; };
    const who = [CFG.player, ...BOTS].filter(b => locate(b).scene === 'starfall');
    who.forEach(b => {
      const L = locate(b); let pref = idx(L.spot);
      if (pref < 0) { const h = Math.floor(Date.now() / 3600e3); pref = [...(b + h)].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7) % spots.length; }
      for (let k = 0; k < spots.length; k++) {
        const si = (pref + k) % spots.length, seats = spots[si].seats || [];
        const free = seats.findIndex((_, j) => !used.has(si + ':' + j));
        if (free >= 0) { used.add(si + ':' + free); out[b] = { spot: si, seat: seats[free] }; break; }
      }
    });
    return out;
  }
  const seatFree = si => { const s = C.starfall.room.spots[si], taken = Object.values(parkSeats()).filter(o => o.spot === si && o !== parkSeats()[CFG.player]).length; return taken < (s.seats || []).length; };
  function sitInPark(si, el) {
    const s = C.starfall.room.spots[si], mine = parkSeats()[CFG.player];
    if (mine && mine.spot === si) return showBubble(el, s.label, s.caption);
    const others = Object.entries(parkSeats()).filter(([b, o]) => b !== CFG.player && o.spot === si).map(([b]) => botName(b));
    if (others.length >= (s.seats || []).length) return showBubble(el, s.label, `Taken: ${others.join(' & ')} ${others.length > 1 ? 'are' : 'is'} here. Try another spot!`);
    store.set('olithia-at', { scene: 'starfall', pose: 'sitting', spot: si }); applyLive();
    showBubble(el, C[CFG.player].name, others.length ? `Sitting beside ${others.join(' & ')} 💛` : s.caption);
  }
  // ----- guests: a bot standing in a scene it isn't painted into, or its painted park pose -----
  function buildGuests() {
    $('#actors').querySelectorAll('.guest,.cameo').forEach(e => e.remove());
    if (!cur) return;
    [...BOTS, CFG.player].forEach(b => {
      if (b === curId || b === cur.returnTo) return; // painted into its own house / bedroom
      const w = locate(b); if (w.scene !== curId) return; // one instance: only the scene locate() names
      const cam = cur.room.cameos && cur.room.cameos[b], spr = (CFG.sprites || {})[b];
      let spot = cur.room.guests && cur.room.guests[b];
      if (b === CFG.player) {
        if (cur.room.visitor) return; // sprite rooms (the burrow): she is an actor there
        if (cur.room.poses && cur.room.seat) { if (hostHome() && cur.room.visit) return; // painted into the -visit image
          const st = cur.room.seat; spot = { x: st.left + st.width / 2, y: st.top + st.height * .85 }; }
      }
      let el;
      const seat = cur.room.parkPoses && parkSeats()[b];
      if (seat) {
        const k = seat.seat.kind || 'sit';
        el = document.createElement('img'); el.className = 'guest park-pose' + (isNight() ? ' night' : ''); el.alt = botName(b); el.draggable = false;
        el.src = cur.room.parkPoses[k] + b + '.webp';
        const hPct = (cur.room.parkH[k] || .17) * 100 / cur.room.aspect;
        Object.assign(el.style, { left: seat.seat.x + '%', top: seat.seat.y + '%', height: hPct + '%', zIndex: Math.round(seat.seat.y * 10) });
        const an = k === 'scope' && cur.room.scopeAnchor && cur.room.scopeAnchor[b];
        if (an) Object.assign(el.style, { height: cur.room.scopeFeet / (1 - an[1]) + '%', transform: `translate(${-an[0] * 100}%, ${-an[1] * 100}%)`, zIndex: Math.round((seat.seat.y + cur.room.scopeFeet) * 10) });
      } else if (cam) {
        el = document.createElement('img'); el.className = 'cameo'; el.alt = botName(b); el.draggable = false;
        el.src = (cur.room.night && roomURL() === cur.room.night) ? cam.night : cam.day;
        Object.assign(el.style, { left: cam.box.left + '%', top: cam.box.top + '%', width: cam.box.width + '%', height: cam.box.height + '%' });
      } else if (spot && spr) {
        el = document.createElement('img'); el.className = 'guest'; el.alt = botName(b); el.draggable = false; el.src = spr.src;
        const hPct = spr.h * (cur.room.guestScale || 1) * 100 / (cur.room.aspect || .75);
        Object.assign(el.style, { left: spot.x + '%', top: spot.y + '%', height: hPct + '%', zIndex: Math.round(spot.y * 10) });
      } else return;
      el.dataset.id = b;
      el.onclick = ev => { ev.stopPropagation(); showBubble(el, botName(b), w.note || pick(C[b].dialog || ['Hi!'])); };
      $('#actors').appendChild(el);
    });
  }
  function refreshScene() {
    if (!cur) return;
    visiting = curId !== CFG.player && locate(CFG.player).scene === curId;
    pose = cur.room.poses && isChar(curId) && hostHome() ? locate(curId).pose : 'idle';
    showRoom(applyBackdrop(), true);
    $('#actors').querySelectorAll('.link:not(.pboard)').forEach(e => e.remove()); buildLinks();
    const wantMain = !cur.bot || locate(cur.bot).scene === curId, wantVis = !!(cur.room.visitor && visiting);
    if (cur.sprite && !cur.room.poses && !cur.gallery && (!!actors.main !== wantMain || !!actors.visitor !== wantVis)) buildActors();
    buildGuests(); updateMode(true); if (cur.play) playTools();
    if (!$('#tasks').hidden && (cur.tasks || isBot(curId))) renderTasks();
  }

  // ----- map: one pin per bot, and a status chip per bot -----
  const pinSpot = bot => { const s = sceneOf(bot); const id = s.endsWith('-bed') ? s.slice(0, -4) : s === 'burrow' ? 'loria' : s; return C[id] && C[id].hotspot; };
  function applyLive() {
    const pins = $('#botPins'); pins.innerHTML = '';
    const byPlace = {};
    [...BOTS, CFG.player].forEach(b => { const h = pinSpot(b); if (!h) return; const k = h.left + ',' + h.top; (byPlace[k] = byPlace[k] || []).push(b); });
    Object.values(byPlace).forEach(list => list.forEach((b, i) => {
      const h = pinSpot(b), w = where(b), spr = (CFG.sprites || {})[b];
      const p = document.createElement('div'); p.className = 'bot-pin' + (w.pose === 'sleeping' ? ' asleep' : '') + (b === CFG.player ? ' me' : '');
      p.style.left = (h.left + h.width / 2 + (i - (list.length - 1) / 2) * 11) + '%'; p.style.top = (h.top + h.height / 2) + '%';
      p.innerHTML = `<i>${spr ? `<img src="${spr.face || spr.src}" alt="">` : ''}</i><span>${esc(botName(b))}${w.pose === 'sleeping' ? ' 💤' : ''}</span>`;
      pins.appendChild(p);
    }));
    const chips = $('#botChips'); chips.innerHTML = '';
    BOTS.forEach(b => {
      const w = where(b), spr = (CFG.sprites || {})[b];
      const line = w.pose === 'sleeping' ? 'Asleep' : (w.note || (String(w.scene).endsWith('-bed') ? 'Up in the bedroom' : (w.pose === 'working' ? 'Working at ' : 'At ') + placeName(w.place)));
      const c = document.createElement('button'); c.type = 'button'; c.className = 'bot-chip' + (w.live ? ' live' : '');
      c.innerHTML = `<i>${spr ? `<img src="${spr.face || spr.src}" alt="">` : ''}</i><span><b>${esc(botName(b))}</b> ${esc(line)}</span>`;
      c.setAttribute('aria-label', `${botName(b)}: ${line}. Visit`);
      c.onclick = () => { const s = sceneOf(b); if (C[s]) enter(s, { arrive: true }); };
      chips.appendChild(c);
    });
    if ($('#board') && !$('#board').hidden) renderBoard();
    refreshScene();
  }
  async function pullStatus() {
    let next = {};
    try {
      const res = await fetch('status.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('status');
      const data = await res.json();
      const t = Date.parse(data && data.updated);
      statusFresh = Number.isFinite(t) && Date.now() - t <= LIVE_MAX;
      if (statusFresh) BOTS.forEach(b => {
        const g = data[b]; if (!g || typeof g !== 'object') return;
        let place = LIVE_PLACES.includes(g.place) || g.place === b + '-bed' ? g.place : b;
        let p = LIVE_POSES.includes(g.pose) ? g.pose : 'idle';
        if ((p === 'sleeping' || p === 'awake') && place === b) place = b + '-bed'; // asleep / up: in its own bedroom
        if ((p === 'sleeping' || p === 'awake') && place !== b + '-bed') p = 'idle'; // a bot only sleeps in its own bed
        next[b] = { place, pose: p, note: typeof g.note === 'string' ? g.note.trim().slice(0, 140) : '', live: true, spot: g.spot };
      });
    } catch (e) { statusFresh = false; }
    liveAll = next;
    applyLive();
  }

  // ----- the playground: blocks, ball, swing, bulletin board -----
  const PG_COLORS = ['#d9534f', '#3f7fbf', '#f2c14e', '#5aa05a', '#e98b3a', '#9b6bc4', '#d9534f'];
  const BW = 5.2; // block width, % of the scene width
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let ballRaf = 0;
  function buildPlay() {
    cancelAnimationFrame(ballRaf);
    if (!cur || !cur.play) return;
    const R = cur.room, act = $('#actors'), BH = BW / (R.aspect || .75); // square blocks
    // swing: the painted rope and seat on their own layer, pivoting from the top bar
    const sw = document.createElement('img'); sw.className = 'swing'; sw.src = R.swing.src; sw.alt = 'Swing'; sw.draggable = false;
    Object.assign(sw.style, { left: R.swing.box.left + '%', top: R.swing.box.top + '%', width: R.swing.box.width + '%', height: R.swing.box.height + '%' });
    const push = amp => { if (!motionOK) return; sw.getAnimations().forEach(a => a.cancel()); const k = [0, 1, -.8, .62, -.46, .32, -.2, .1, 0].map(f => ({ transform: `rotate(${(f * amp).toFixed(1)}deg)` })); sw.animate(k, { duration: 4200, easing: 'ease-in-out' }); };
    sw.onclick = ev => { ev.stopPropagation(); push(20); buzz(12); };
    act.appendChild(sw);
    if (BOTS.some(b => where(b).place === 'playground' && where(b).pose !== 'sleeping')) setTimeout(() => push(9), 900); // someone's playing
    // bulletin board: painted board, little paper notes, tap to read board.json
    const bd = document.createElement('div'); bd.className = 'link zone pboard'; bd.setAttribute('role', 'button'); bd.setAttribute('aria-label', 'Bulletin board');
    Object.assign(bd.style, { left: R.board.left + '%', top: R.board.top + '%', width: R.board.width + '%', height: R.board.height + '%' });
    boardNotes.slice(0, 4).forEach((n, i) => { const p = document.createElement('i'); p.style.left = (8 + (i % 2) * 44) + '%'; p.style.top = (14 + Math.floor(i / 2) * 36) + '%'; p.style.transform = `rotate(${[-6, 4, 3, -4][i]}deg)`; bd.appendChild(p); });
    bd.onclick = ev => { ev.stopPropagation(); openNotes(); };
    act.appendChild(bd);
    // blocks
    const saved = store.get('pg-blocks', null);
    const start = PG_COLORS.map((c, i) => ({ id: i, x: 55 + (i % 4) * 6.4 - (i > 3 ? 3 : 0), y: 64 + (i > 3 ? -BH * .1 + 7 : 0), on: null }));
    const blocks = (Array.isArray(saved) && saved.length === PG_COLORS.length ? saved : start).map((b, i) => ({ ...start[i], ...b, id: i }));
    const els = [];
    const z = b => Math.round(b.y * 10) + 1;
    const draw = b => { const e = els[b.id]; e.style.left = (b.x - BW / 2) + '%'; e.style.top = (b.y - BH) + '%'; e.style.zIndex = z(b); };
    const stackOf = b => { const out = [b]; blocks.forEach(o => { if (o.on === b.id) out.push(...stackOf(o)); }); return out; };
    const save = () => store.set('pg-blocks', blocks.map(({ id, x, y, on }) => ({ id, x: +x.toFixed(2), y: +y.toFixed(2), on })));
    blocks.forEach(b => {
      const e = document.createElement('div'); e.className = 'block'; e.style.setProperty('--c', PG_COLORS[b.id]);
      e.style.width = BW + '%'; e.style.height = BH + '%'; e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'Toy block');
      els[b.id] = e; act.appendChild(e); draw(b);
      e.addEventListener('pointerdown', ev => {
        ev.stopPropagation(); ev.preventDefault(); e.setPointerCapture(ev.pointerId);
        const group = stackOf(b), p0 = toStage(ev.clientX, ev.clientY), orig = group.map(g => ({ g, x: g.x, y: g.y }));
        b.on = null; group.forEach(g => { els[g.id].classList.add('held'); els[g.id].style.zIndex = 5000 + (b.y - g.y) * 10; });
        const mv = m => { const p = toStage(m.clientX, m.clientY); orig.forEach(o => { o.g.x = o.x + p.x - p0.x; o.g.y = o.y + p.y - p0.y; els[o.g.id].style.left = (o.g.x - BW / 2) + '%'; els[o.g.id].style.top = (o.g.y - BH) + '%'; }); };
        const up = () => {
          e.removeEventListener('pointermove', mv); e.removeEventListener('pointerup', up); e.removeEventListener('pointercancel', up);
          // land on the highest block underneath, or on the lawn, or go back
          const ids = new Set(group.map(g => g.id));
          const under = blocks.filter(o => !ids.has(o.id) && Math.abs(o.x - b.x) < BW * .7 && b.y > o.y - BH * 1.6 && b.y < o.y + BH * .5).sort((p, q) => (q.y - BH) - (p.y - BH));
          const top = under.length ? under.reduce((m, o) => (o.y < m.y ? o : m)) : null;
          let dx = 0, dy = 0;
          if (top && !blocks.some(o => o.on === top.id && !ids.has(o.id))) { dx = top.x - b.x; dy = (top.y - BH) - b.y; b.on = top.id; buzz(14); }
          else if (!inPoly(b.x, b.y, R.lawn)) { dx = orig[0].x - b.x; dy = orig[0].y - b.y; }
          group.forEach(g => { g.x += dx; g.y += dy; els[g.id].classList.remove('held'); draw(g); });
          // stacked blocks keep their stack order on top
          group.forEach(g => { if (g !== b) els[g.id].style.zIndex = z(b) + (b.y - g.y) / BH; });
          save();
        };
        e.addEventListener('pointermove', mv); e.addEventListener('pointerup', up); e.addEventListener('pointercancel', up);
      });
    });
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'pill pg-reset'; reset.textContent = 'Tidy blocks';
    reset.onclick = ev => { ev.stopPropagation(); store.set('pg-blocks', null); buildPlayFresh(); };
    $('#playTools').replaceChildren(reset); playTools();
    // ball: flick it, or tap for a little kick
    const ball = document.createElement('div'); ball.className = 'ball'; ball.setAttribute('role', 'button'); ball.setAttribute('aria-label', 'Ball');
    const st = store.get('pg-ball', null) || { x: 58, y: 77 }; const bs = { x: st.x, y: st.y, vx: 0, vy: 0 };
    const BD = 4.2; ball.style.width = BD + '%'; ball.style.height = (BD / (R.aspect || .75)) + '%';
    const drawBall = () => { ball.style.left = (bs.x - BD / 2) + '%'; ball.style.top = (bs.y - BD / (R.aspect || .75)) + '%'; ball.style.zIndex = Math.round(bs.y * 10); };
    drawBall(); act.appendChild(ball);
    const roll = () => {
      bs.vx *= .965; bs.vy *= .965;
      let nx = bs.x + bs.vx, ny = bs.y + bs.vy;
      if (!inPoly(nx, ny, R.lawn)) { if (!inPoly(bs.x + bs.vx, bs.y, R.lawn)) bs.vx *= -.7; if (!inPoly(bs.x, bs.y + bs.vy, R.lawn)) bs.vy *= -.7; nx = bs.x + bs.vx; ny = bs.y + bs.vy; if (!inPoly(nx, ny, R.lawn)) { nx = bs.x; ny = bs.y; } }
      bs.x = nx; bs.y = ny; ball.style.transform = `rotate(${(bs.x * 40) % 360}deg)`; drawBall();
      if (Math.hypot(bs.vx, bs.vy) > .02) ballRaf = requestAnimationFrame(roll); else store.set('pg-ball', { x: +bs.x.toFixed(2), y: +bs.y.toFixed(2) });
    };
    ball.addEventListener('pointerdown', ev => {
      ev.stopPropagation(); ev.preventDefault(); ball.setPointerCapture(ev.pointerId);
      const t0 = performance.now(), p0 = toStage(ev.clientX, ev.clientY);
      const up = u => {
        ball.removeEventListener('pointerup', up); ball.removeEventListener('pointercancel', up);
        const p = toStage(u.clientX, u.clientY), dt = Math.max(60, performance.now() - t0);
        let vx = (p.x - p0.x) / dt * 16, vy = (p.y - p0.y) / dt * 16;
        if (Math.hypot(vx, vy) < .3) { const a = Math.random() * 6.28; vx = Math.cos(a) * .9; vy = Math.sin(a) * .9; }
        const sp = Math.hypot(vx, vy); if (sp > 3) { vx *= 3 / sp; vy *= 3 / sp; }
        bs.vx = vx; bs.vy = vy; buzz(10); cancelAnimationFrame(ballRaf); ballRaf = requestAnimationFrame(roll);
      };
      ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);
    });
  }
  function playTools() { // v26: send Olithia out to play, or back home
    const box = $('#playTools'); box.querySelectorAll('.pg-join').forEach(e => e.remove());
    const here = locate(CFG.player).scene === curId, j = document.createElement('button'); j.type = 'button'; j.className = 'pill pg-join';
    j.textContent = here ? 'Head home' : 'Join in'; j.onclick = ev => { ev.stopPropagation(); setOli(here ? CFG.player : curId, 'idle'); };
    box.appendChild(j);
  }
  function buildPlayFresh() { $('#actors').querySelectorAll('.block,.ball,.swing,.pboard').forEach(e => e.remove()); buildPlay(); }

  // ----- the town post: letters from any bot, write to any bot -----
  let letters = [];
  let mailTo = BOTS[0] || 'gorbo';
  function readIds() { const ids = store.get('read-letters', []); return Array.isArray(ids) ? ids : []; }
  const letterFrom = l => { const f = String((l && l.from) || 'gorbo').toLowerCase(); return isBot(f) ? f : 'gorbo'; };
  function unreadLetters() { const seen = readIds(); return letters.some(l => l && l.id && !seen.includes(l.id)); }
  function paintMailDot() {
    const unread = unreadLetters();
    $('#mailBtn').classList.toggle('has-unread', unread);
    $('#mailBtn').setAttribute('aria-label', unread ? 'Mailbox, new letter' : 'Mailbox');
  }
  function showMail(which) {
    $('#mailHome').hidden = which !== 'home';
    $('#mailRead').hidden = which !== 'read';
    $('#mailWrite').hidden = which !== 'write';
  }
  function renderLetters() {
    const list = $('#mailList'); list.innerHTML = '';
    const rows = letters.filter(l => l && l.id);
    if (!rows.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'The post box is quiet.'; list.appendChild(p); paintMailDot(); return; }
    const seen = readIds();
    rows.forEach(l => {
      const b = document.createElement('button'); b.type = 'button'; if (!seen.includes(l.id)) b.className = 'unread';
      const small = document.createElement('small'); small.textContent = botName(letterFrom(l)) + (l.date ? ' · ' + l.date : '');
      b.append(document.createTextNode(l.title || 'A letter'), small);
      b.onclick = () => openLetter(l);
      list.appendChild(b);
    });
    paintMailDot();
  }
  let reading = null;
  function openLetter(l) {
    reading = l;
    const seen = readIds(); if (!seen.includes(l.id)) store.set('read-letters', seen.concat(l.id));
    $('#mailTitle').textContent = l.title || 'A letter';
    $('#mailMeta').textContent = 'From ' + botName(letterFrom(l)) + (l.date ? ' · ' + l.date : '');
    $('#mailReply').textContent = 'Reply to ' + botName(letterFrom(l));
    fillText($('#mailBody'), l.body || '');
    showMail('read'); paintMailDot();
  }
  function pickRecipient(id) {
    mailTo = id;
    $('#mailTo').querySelectorAll('button').forEach(b => { const on = b.dataset.to === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    const n = botName(id);
    $('#mailWriteTitle').textContent = 'Write to ' + n;
    $('#mailWriteHint').textContent = `Tap Copy letter, then paste it into your chat with ${n}. It begins with “Letter to ${n}:”.`;
    $('#mailText').placeholder = `Dear ${n}…`;
  }
  function writeTo(id) { pickRecipient(id); showMail('write'); $('#mailSent').hidden = true; }
  $('#mailTo').innerHTML = BOTS.map(b => `<button type="button" data-to="${b}">${(CFG.sprites[b] ? `<img src="${CFG.sprites[b].face}" alt="">` : '')}${esc(botName(b))}</button>`).join('');
  $('#mailTo').onclick = e => { const b = e.target.closest('button'); if (b) pickRecipient(b.dataset.to); };
  async function pullLetters() {
    try {
      const res = await fetch('letters.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('letters');
      const data = await res.json();
      letters = Array.isArray(data) ? data : [];
    } catch (e) { letters = letters.length ? letters : []; }
    renderLetters();
  }
  $('#mailBtn').onclick = () => { $('#mail').hidden = false; showMail('home'); renderLetters(); $('#mailSent').hidden = true; };
  $('#mailClose').onclick = () => { $('#mail').hidden = true; };
  $('#mail').onclick = e => { if (e.target === $('#mail')) $('#mail').hidden = true; };
  $('#mailCompose').onclick = () => writeTo(mailTo);
  $('#mailReply').onclick = () => writeTo(letterFrom(reading));
  $('#mailBack').onclick = () => showMail('home');
  $('#mailWriteBack').onclick = () => showMail('home');
  $('#mailText').addEventListener('input', () => { $('#mailSend').disabled = $('#mailShare').disabled = !$('#mailText').value.trim(); });
  $('#mailSend').disabled = $('#mailShare').disabled = true;
  if (!navigator.share) $('#mailShare').hidden = true;
  const mailGo = mode => async () => {
    const text = $('#mailText').value.trim(); if (!text) return;
    const n = botName(mailTo);
    await passOn(`Letter to ${n}:\n` + text, n, $('#mailSent'), mode);
  };
  $('#mailSend').onclick = mailGo('copy'); $('#mailShare').onclick = mailGo('share');
  pickRecipient(mailTo);

  // ----- the town board: who's doing what, and Olithia's questions & tasks for the bots -----
  let taskItems = [], boardNotes = [];
  let taskTo = BOTS[0] || 'gorbo';
  const statusLabel = s => ({ done: 'Done', doing: 'Doing', open: 'Open', answered: 'Answered' }[s] || 'Open');
  const sentTasks = () => { const s = store.get('sent-tasks', []); return Array.isArray(s) ? s : []; };
  // tasks.json items plus the ones sent from this phone that haven't shown up in tasks.json yet
  function boardItems() {
    const known = new Set(taskItems.map(t => (t.for + '|' + t.text).toLowerCase()));
    return taskItems.concat(sentTasks().filter(t => !known.has((t.for + '|' + t.text).toLowerCase())).map(t => ({ ...t, status: 'sent' })));
  }
  async function pullBoard() {
    try { const r = await fetch('tasks.json', { cache: 'no-store' }); if (!r.ok) throw 0; const d = await r.json(); taskItems = (d && Array.isArray(d.items) ? d.items : []).filter(t => t && isBot(String(t.for).toLowerCase()) && t.text).map(t => ({ for: String(t.for).toLowerCase(), text: String(t.text), status: String(t.status || 'open').toLowerCase() })); }
    catch (e) { /* keep what we had */ }
    try { const r = await fetch('board.json', { cache: 'no-store' }); if (!r.ok) throw 0; const d = await r.json(); boardNotes = (d && Array.isArray(d.notes) ? d.notes : []).filter(n => n && n.text); }
    catch (e) { /* keep what we had */ }
    if (!$('#board').hidden) renderBoard();
    if (cur && cur.play) buildPlayFresh();
    if (cur && isBot(curId) && !$('#tasks').hidden) renderTasks();
  }
  function renderBoard() {
    const who = $('#boardWho'); who.innerHTML = '';
    BOTS.forEach(b => {
      const w = where(b), spr = CFG.sprites[b];
      const row = document.createElement('div'); row.className = 'who';
      const doing = w.pose === 'sleeping' ? 'Asleep' : (w.note || (w.pose === 'working' ? 'Working' : w.pose === 'sitting' ? 'Taking a break' : 'Hanging out'));
      row.innerHTML = `<i>${spr ? `<img src="${spr.face || spr.src}" alt="">` : ''}</i><div><b>${esc(botName(b))}</b><span>${esc(doing)}</span><small>${esc(w.pose === 'sleeping' ? placeName(b) + ' bedroom' : placeName(w.place))}${w.live ? '' : ' · usual schedule'}</small></div>`;
      who.appendChild(row);
    });
    const ul = $('#boardTasks'); ul.innerHTML = '';
    const items = boardItems();
    if (!items.length) { const li = document.createElement('li'); li.className = 'none'; li.textContent = 'No questions yet. Ask one below.'; ul.appendChild(li); }
    items.forEach(t => { const li = document.createElement('li'); li.className = 'bt-' + t.status; li.innerHTML = `<span class="st">${esc(t.status === 'sent' ? 'Sent' : statusLabel(t.status))}</span><b>${esc(botName(t.for))}</b> ${esc(t.text)}`; ul.appendChild(li); });
  }
  function pickTaskTo(id) {
    taskTo = id; const n = botName(id);
    $('#taskTo').querySelectorAll('button').forEach(b => { const on = b.dataset.to === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $('#taskText').placeholder = `A question or task for ${n}…`;
  }
  $('#taskTo').innerHTML = BOTS.map(b => `<button type="button" data-to="${b}">${(CFG.sprites[b] ? `<img src="${CFG.sprites[b].face}" alt="">` : '')}${esc(botName(b))}</button>`).join('');
  $('#taskTo').onclick = e => { const b = e.target.closest('button'); if (b) pickTaskTo(b.dataset.to); };
  function openBoard(forBot) { $('#board').hidden = false; $('#taskSent').hidden = true; pickTaskTo(isBot(forBot) ? forBot : taskTo); renderBoard(); }
  $('#boardBtn').onclick = () => openBoard();
  $('#boardClose').onclick = () => { $('#board').hidden = true; };
  $('#board').onclick = e => { if (e.target === $('#board')) $('#board').hidden = true; };
  $('#taskText').addEventListener('input', () => { $('#taskSend').disabled = $('#taskShare').disabled = !$('#taskText').value.trim(); });
  $('#taskSend').disabled = $('#taskShare').disabled = true;
  if (!navigator.share) $('#taskShare').hidden = true;
  const taskGo = mode => async () => {
    const text = $('#taskText').value.trim(); if (!text) return;
    const n = botName(taskTo);
    const ok = await passOn(`Task for ${n}:\n` + text, n, $('#taskSent'), mode);
    if (ok) { store.set('sent-tasks', sentTasks().concat({ for: taskTo, text, date: new Date().toISOString().slice(0, 10) }).slice(-30)); $('#taskText').value = ''; $('#taskSend').disabled = true; renderBoard(); if (cur && isBot(curId)) renderTasks(); }
  };
  $('#taskSend').onclick = taskGo('copy'); $('#taskShare').onclick = taskGo('share');
  // the mossy standing stone on the map is the town plaza: tap it for the board
  (() => { const h = document.createElement('div'); h.className = 'hot plaza'; h.setAttribute('role', 'button'); h.setAttribute('aria-label', 'Town board');
    Object.assign(h.style, { left: '40.3%', top: '41.5%', width: '19.4%', height: '6.1%' }); h.innerHTML = '<span class="label">Town board</span>';
    h.addEventListener('click', () => { if (!mapDragged()) openBoard(); }); $('#hotspots').appendChild(h); })();
  // bulletin board in the playground
  function openNotes() {
    const list = $('#notesList'); list.innerHTML = '';
    if (!boardNotes.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No notes pinned yet.'; list.appendChild(p); }
    boardNotes.forEach((n, i) => { const d = document.createElement('div'); d.className = 'note'; d.style.transform = `rotate(${[-1.5, 1.2, -.8, 1.6][i % 4]}deg)`; const f = String(n.from || '').toLowerCase();
      d.innerHTML = `<p></p><small>${esc(isBot(f) ? botName(f) : (n.from || ''))}${n.date ? ' · ' + esc(n.date) : ''}</small>`; d.querySelector('p').textContent = n.text; list.appendChild(d); });
    $('#notes').hidden = false;
  }
  $('#notesClose').onclick = () => { $('#notes').hidden = true; };
  $('#notes').onclick = e => { if (e.target === $('#notes')) $('#notes').hidden = true; };

  function pullLive() { pullStatus(); pullLetters(); pullBoard(); }

  // ---------- real-time sky: a soft gradient that follows the hour (?hour=18.5 to preview) ----------
  const SKY = [ // hour, top colour, bottom colour (multiplied over the scene)
    [0, [52, 62, 140, .5], [70, 80, 150, .34]], [4.5, [52, 62, 140, .48], [70, 80, 150, .32]], [6, [250, 160, 150, .34], [255, 200, 160, .18]],
    [7.5, [255, 214, 170, .14], [255, 236, 200, .04]], [9, [255, 255, 255, 0], [255, 255, 255, 0]], [16, [255, 255, 255, 0], [255, 255, 255, 0]],
    [17.5, [255, 170, 110, .2], [255, 200, 150, .08]], [19, [220, 110, 120, .32], [255, 150, 90, .2]], [20.5, [110, 86, 170, .42], [140, 100, 160, .26]],
    [22, [52, 62, 140, .5], [70, 80, 150, .34]], [24, [52, 62, 140, .5], [70, 80, 150, .34]]];
  const mixC = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  function tint() {
    const h = hourNow() % 24; let i = 0; while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
    const [h0, t0, b0] = SKY[i], [h1, t1, b1] = SKY[i + 1], t = h1 > h0 ? (h - h0) / (h1 - h0) : 0;
    const css = c => `rgba(${c.slice(0, 3).map(Math.round).join(',')},${c[3].toFixed(3)})`;
    $('#tint').style.background = `linear-gradient(to bottom, ${css(mixC(t0, t1, t))}, ${css(mixC(b0, b1, t))})`;
  }
  tint(); setInterval(tint, 60000);
  // (v26: pullLive below re-runs locate() for every scene each minute, so bedtimes and outings crossfade in on their own)
  pullLive(); setInterval(pullLive, 60000);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  if ('serviceWorker' in navigator) { // v28: when a new SW takes over, reload once so phones get the new version
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had || sessionStorage.getItem('bt-reloaded')) return; sessionStorage.setItem('bt-reloaded', '1'); location.reload(); });
    navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {});
  }
  // ----- v28: poem box (the book-swap little library) -----
  function openPoems() {
    let p = $('#poems'); if (!p) { p = document.createElement('div'); p.id = 'poems'; document.body.appendChild(p); }
    p.innerHTML = `<div class="pcard"><button type="button" class="px" aria-label="Close">✕</button><h3>📚 The poem box</h3><div class="plist">Loading…</div>
      <h4>Leave a poem</h4><input id="pTitle" placeholder="Title" maxlength="80"><textarea id="pText" rows="5" placeholder="Your poem…"></textarea>
      <div class="prow"><button type="button" class="pill main" id="pSave">Leave it</button><button type="button" class="pill" id="pCopy" hidden>Copy</button></div><small id="pMsg"></small></div>`;
    p.hidden = false; p.onclick = e => { if (e.target === p) p.hidden = true; }; p.querySelector('.px').onclick = () => p.hidden = true;
    const mine = () => store.get('poems', []);
    const render = list => { p.querySelector('.plist').innerHTML = list.length ? list.map(x => `<article><b>${esc(x.title || 'Untitled')}</b><pre>${esc(x.text || '')}</pre><small>— ${esc(x.from || '')}${x.date ? ' · ' + esc(x.date) : ''}</small></article>`).join('') : '<i>No poems yet.</i>'; };
    fetch('poems.json', { cache: 'no-store' }).then(r => r.json()).catch(() => []).then(j => render([...mine(), ...(Array.isArray(j) ? j : [])]));
    let last = '';
    $('#pSave').onclick = () => {
      const title = $('#pTitle').value.trim(), text = $('#pText').value.trim(); if (!text) return;
      const x = { id: 'o' + Date.now(), from: C[CFG.player].name, date: new Date().toISOString().slice(0, 10), title, text };
      store.set('poems', [x, ...mine()]); last = `Poem for the box: ${title}\n${text}`; $('#pCopy').hidden = false; $('#pMsg').textContent = 'Saved! Copy it to chat so it joins the box for everyone.';
      $('#pTitle').value = $('#pText').value = ''; openPoemsRefresh();
    };
    const openPoemsRefresh = () => fetch('poems.json', { cache: 'no-store' }).then(r => r.json()).catch(() => []).then(j => render([...mine(), ...(Array.isArray(j) ? j : [])]));
    $('#pCopy').onclick = () => navigator.clipboard.writeText(last).then(() => $('#pMsg').textContent = 'Copied!').catch(() => $('#pMsg').textContent = last);
  }
  window.__bt = { openPoems, enter, go, cam, applyCam, where, locate, setOli, dayPlan, dayKey }; // handy for testing // handy for testing
})();
