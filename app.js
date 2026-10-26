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
    closeDig(); // v52
    curId = id; cur = C[id];
    visiting = id !== CFG.player && locate(CFG.player).scene === id;
    pose = cur.room.poses && isChar(id) && hostHome() ? locate(id).pose : 'idle';
    $('#house').style.opacity = '';
    showRoom(applyBackdrop(), false);
    $('#roomImg').alt = cur.house; $('#roomFade').alt = '';
    $('#houseName').textContent = cur.house; $('#houseRole').textContent = `${cur.name} · ${cur.role}`;
    $('#chat').hidden = true; $('#log').innerHTML = ''; hideBubble(); if (window.BotTownChat && BotTownChat.close) try { BotTownChat.close(); } catch (e) {} // v51
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
    layout(); buildActors(); buildGuests(); resetCam(false); buildLinks(); buildPlay(); buildOwl(); buildPark44();
    $('#tasks').hidden = gallery || !(cur.tasks || isBot(id));
    if (cur.tasks || isBot(id)) renderTasks();
    updateMode(true);
    if (motionOK && opts.arrive) { $('#house').classList.add('arriving'); setTimeout(() => $('#house').classList.remove('arriving'), 720); }
    if (motionOK && opts.door) { vp.classList.remove('door-shut'); vp.classList.add('door-open'); setTimeout(() => vp.classList.remove('door-open'), 680); }
    maybeTiltPrompt();
    if (!opts.skipPush) history.pushState({ id }, '', '#' + id);
  }
  function toMap(fromPop) {
    closeDig(); // v52
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
      // v48: on play scenes, extra scroll room so the bottom props can rise clear of the docked buttons
      const dock = cur.play ? $('#playTools') : null, pad = dock && dock.offsetHeight ? innerHeight - dock.getBoundingClientRect().top + 10 : 0;
      cam.s = 1; cam.x = 0; cam.y = Math.min(0, Math.max(innerHeight - H - pad, cam.y));
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
      if (s.sky) { if (window.BotSky) BotSky.open(); return; }
      if (s.poems) openPoems();
      if (s.seats && curId === 'starfall') sitInPark(si, el); // v29: any spot is a seat for Olithia (if one is free)
      else if (!s.poems) showBubble(el, s.label, s.caption);
    }); el.classList.remove('glow'); }); // invisible until tapped
    if (curId === 'starfall' && isNight()) { const b = document.createElement('div'); b.className = 'bluestar'; b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'A little blue star');
      b.onclick = ev => { ev.stopPropagation(); const lab = (CFG.blueStar || {}).label || ''; showBubble(b, '💙', lab); }; $('#actors').appendChild(b); } // v32
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


  // ---------- v41: Loria's owl (one instance: with Loria when she's out at night, else at home) ----------
  let owlT = 0;
  function owlPlace() {
    const O = CFG.owl; if (!O) return null; const L = locate('loria'), night = inHours(O.night);
    if (night && (L.scene === 'starfall' || L.scene === 'playground')) return { scene: L.scene, awake: true };
    if (L.scene === 'loria-bed') return { scene: 'loria-bed', awake: night };
    return { scene: 'loria', awake: night };
  }
  function buildOwl() {
    clearTimeout(owlT); $('#actors').querySelectorAll('.owl').forEach(e => e.remove());
    const O = CFG.owl, w = owlPlace(); if (!w || w.scene !== curId) return; const P = O.perches[curId]; if (!P) return;
    const el = document.createElement('div'); el.className = 'owl' + (w.awake ? ' awake' : ' dozing'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', O.name + (w.awake ? '' : ' (dozing)'));
    const hP = P.h / P.art[1] * 100, wP = P.h * O.ratio / P.art[0] * 100;
    Object.assign(el.style, { left: (P.x - wP / 2) + '%', top: (P.y - hP) + '%', width: wP + '%', height: hP + '%', zIndex: 1900 });
    const dark = curId === 'starfall' || curId === 'loria-bed' ? isNight() : false, tint = dark && P.tintNight ? P.tintNight : P.tint;
    el.innerHTML = `<i class="owl-sh"></i><img src="${w.awake ? O.awake : O.doze}" alt="" draggable="false"${tint ? ` style="filter:${tint}"` : ''}>`;
    const img = el.querySelector('img');
    if (w.awake && motionOK) { const life = () => { owlT = setTimeout(() => { if (!el.isConnected) return;
        if (Math.random() < .7) { img.src = O.doze; setTimeout(() => { img.src = O.awake; }, 150); }
        else img.animate([{ rotate: '0deg' }, { rotate: (Math.random() < .5 ? -1 : 1) * 7 + 'deg', offset: .3 }, { rotate: (Math.random() < .5 ? -1 : 1) * 7 + 'deg', offset: .7 }, { rotate: '0deg' }], { duration: 2400, easing: 'ease-in-out' });
        life(); }, 3500 + Math.random() * 4000); }; life(); }
    el.onclick = ev => { ev.stopPropagation(); buzz(8);
      try { pgNote(392, .45, 'sine', .09); setTimeout(() => pgNote(349, .7, 'sine', .08), 420); } catch (e) {}
      img.animate([{ scale: '1' }, { scale: '1.08', offset: .3 }, { scale: '1' }], { duration: 500 });
      if (!w.awake) { img.src = O.awake; setTimeout(() => { img.src = O.doze; }, 1600); }
      const h = document.createElement('span'); h.className = 'owl-heart'; h.textContent = '♥'; el.appendChild(h); setTimeout(() => h.remove(), 1400); };
    $('#actors').appendChild(el);
  }

  // ---------- v44: October pumpkin patch + critters to collect (Starfall Hill) ----------
  const monthParam = new URLSearchParams(location.search).get('month'), critParam = new URLSearchParams(location.search).get('critters');
  const isOctober = () => (monthParam ? +monthParam : new Date().getMonth() + 1) === 10;
  let critT = [];
  function buildPark44() {
    critT.forEach(clearTimeout); critT = [];
    const act = $('#actors'); act.querySelectorAll('.sf-pk,.sf-patch,.crit').forEach(e => e.remove());
    const btn = $('#critBtn'); const R = cur.room; btn.hidden = !R.critters; if (!R.critters) return;
    const AW = 720, AH = 2260, X = v => v / AW * 100, Y = v => v / AH * 100, night = isNight();
    if (R.october && isOctober()) {
      const O = R.october, [bx, by, bw, bh] = O.box, t = night ? 'night' : 'day';
      const p = document.createElement('img'); p.className = 'sf-patch'; p.src = night ? O.night : O.day; p.alt = ''; p.draggable = false;
      Object.assign(p.style, { left: X(bx) + '%', top: Y(by) + '%', width: X(bw) + '%', height: Y(bh) + '%', zIndex: Math.round(Y(by + bh * .55) * 10) }); act.appendChild(p);
      O.pumpkins.forEach(([x, y, w, h], i) => { const e = document.createElement('img'); e.className = 'sf-pk'; e.src = `${O.pk}${i}-${t}.webp`; e.alt = 'Pumpkin'; e.draggable = false; e.setAttribute('role', 'button');
        Object.assign(e.style, { left: X(x) + '%', top: Y(y) + '%', width: X(w) + '%', height: Y(h) + '%', zIndex: 1550 + Math.round(Y(y + h)) });
        e.onclick = ev => { ev.stopPropagation(); buzz(10); pgNote(92 + Math.random() * 14, .35, 'sine', .3); setTimeout(() => pgNote(70, .25, 'sine', .15), 40);
          if (motionOK) e.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.07,.97)', offset: .25 }, { transform: 'scale(.98,1.06)', offset: .55 }, { transform: 'scale(1,1)' }], { duration: 420, easing: 'ease-out' });
          leafPuff(act, x + w / 2, y + h * .8, X, Y); };
        act.appendChild(e); });
    }
    // critters: who is out depends on the hour; each turns up at one of its spots, a few at a time, and wanders off when found
    const C = R.critters, ids = Object.keys(C).filter(k => critParam === 'all' || C[k].when === 'any' || (C[k].when === 'night') === night);
    const spawn = (k, delay) => critT.push(setTimeout(() => { if (curId !== 'starfall' || act.querySelector(`.crit[data-k=${k}]`)) return; const c = C[k];
      const [sx, sy] = c.spots[Math.floor(Math.random() * c.spots.length)], fly = c.fly || 0, flip = Math.random() < .5;
      const el = document.createElement('div'); el.className = 'crit crit-' + k + (fly ? ' flying' : '') + (night && !c.glow ? ' dim' : ''); el.dataset.k = k; el.setAttribute('role', 'button'); el.setAttribute('aria-label', c.name);
      Object.assign(el.style, { left: X(sx) + '%', top: Y(sy) + '%', zIndex: 1600 + Math.round(Y(sy)), '--w': X(c.w) + '%' });
      el.innerHTML = `<i class="crit-sh"></i><img src="assets/sf44-crit-${k}.webp" alt="" draggable="false"${flip ? ' class="flip"' : ''}>`;
      // sizes in % of the scene: the element itself is the tap target (a little bigger than the critter)
      Object.assign(el.style, { width: X(Math.max(c.w, 30) + 30) + '%', height: Y(c.h + fly + 30) + '%', marginLeft: -X(Math.max(c.w, 30) + 30) / 2 + '%', marginTop: -Y(c.h + fly + 15) + '%' });
      const im = el.querySelector('img'), sh = el.querySelector('i'); im.style.width = (c.w / (Math.max(c.w, 30) + 30) * 100) + '%'; im.style.bottom = ((15 + fly) / (c.h + fly + 30) * 100) + '%';
      sh.style.width = (c.w * (fly ? .6 : 1.05) / (Math.max(c.w, 30) + 30) * 100) + '%'; sh.style.bottom = (13 / (c.h + fly + 30) * 100) + '%'; if (fly) sh.style.opacity = '.45';
      el.onclick = ev => { ev.stopPropagation(); if (el.dataset.gone) return; el.dataset.gone = 1; buzz(8);
        const J = store.get('critters', {}), n = (J[k] || 0) + 1; J[k] = n; store.set('critters', J);
        try { pgNote(784, .25, 'sine', .08); setTimeout(() => pgNote(1046.5, .35, 'sine', .07), 110); } catch (e) {}
        showBubble(el, c.name + (n > 1 ? ` ×${n}` : ' ✦ new!'), ' ' + c.note); critBadge();
        const dir = (flip ? 1 : -1) * (c.walk ? 1 : 1), dx = fly ? 40 : 55, dy = fly ? -60 : 0;
        el.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${-dir * dx}%,${dy}%)`, opacity: 0 }], { duration: motionOK ? 900 : 1, easing: 'ease-in', fill: 'forwards' });
        setTimeout(() => el.remove(), 950); spawn(k, 25000 + Math.random() * 35000); };
      act.appendChild(el); }, delay));
    const shuffled = ids.sort(() => Math.random() - .5), first = critParam === 'all' ? ids.length : 1 + Math.floor(Math.random() * 2);
    shuffled.forEach((k, i) => spawn(k, i < first ? 0 : 8000 + Math.random() * 30000));
    critBadge();
  }
  function leafPuff(act, x, y, X, Y) { if (!motionOK) return;
    for (let i = 0; i < 6; i++) { const l = document.createElement('i'); l.className = 'sf-leaf'; l.style.left = X(x) + '%'; l.style.top = Y(y) + '%'; l.style.background = ['#6f8a3a', '#9aa845', '#c9852e', '#7c6a2a'][i % 4];
      act.appendChild(l); const a = Math.PI * (1.05 + i / 5 * .9), r = 26 + Math.random() * 20;
      l.animate([{ transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) rotate(${200 + i * 40}deg)`, opacity: .9, offset: .55 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.3}px), calc(-50% + ${Math.sin(a) * r * .4 + 14}px)) rotate(${320 + i * 50}deg)`, opacity: 0 }], { duration: 900 + i * 60, easing: 'ease-out' });
      setTimeout(() => l.remove(), 1300); } }
  function critBadge() { const J = store.get('critters', {}), n = Object.keys(J).length, tot = Object.keys((C.starfall.room.critters) || {}).length; $('#critBtn').textContent = `🐾 Critters ${n}/${tot}`; }
  function openCritters() { const R = C.starfall.room, J = store.get('critters', {}), list = $('#critList'); list.innerHTML = '';
    Object.entries(R.critters).forEach(([k, c]) => { const n = J[k] || 0, li = document.createElement('li'); li.className = n ? 'got' : 'missing';
      li.innerHTML = n ? `<img src="assets/sf44-crit-${k}.webp" alt=""><div><b>${c.name}</b> <span class="cnt">×${n}</span><small>${c.note}</small></div>` : `<img src="assets/sf44-crit-${k}.webp" alt="" class="sil"><div><b>???</b><small>${c.when === 'night' ? 'Comes out after dark.' : c.when === 'day' ? 'Out in the daytime.' : 'Any time, if you look closely.'}</small></div>`;
      list.appendChild(li); });
    hideBubble(); $('#critters').hidden = false; }
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
  // v51: in Gorbo's, Loria's or Scout's place, Chat talks to the real bot through the Pi relay (falls back to a copied letter)
  const relayOn = () => !!(window.BotTownChat && CFG.relay && CFG.relay.url);
  if (relayOn()) BotTownChat.init({ relay: CFG.relay.url.replace(/\/+$/, ''), key: CFG.relay.key, name: (C[CFG.player] && C[CFG.player].name) || 'Olithia',
    onFallback: async (bot, text) => { const t = `Letter to ${botName(bot)}: ${text}`; toast((await copyText(t)) ? `Relay is napping — copied! Paste it in your chat with ${botName(bot)}.` : t); } });
  $('#tbChat').onclick = () => { const b = ownerOf(curId); if (relayOn() && isBot(b)) { $('#chat').hidden = true; BotTownChat.open(b); } else openChat(); };
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
    $('#installText').textContent = 'Safari: Share → Add to Home Screen';
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
      const seat = cur.room.parkPoses && parkSeats()[b], toy = cur.play && cur.room.toys && pgToys()[b];
      if (toy) { el = toyEl(b, toy); } else if (seat) {
        const k = seat.seat.kind || 'sit', pb = seat.seat.patch && cur.room.parkBox && cur.room.parkBox[seat.seat.patch + '-' + b];
        if (pb) { // v31: painted-in patch for this exact seat
          el = document.createElement('img'); el.className = 'guest park-patch'; el.alt = botName(b); el.draggable = false;
          el.src = cur.room.parkPatch + seat.seat.patch + '-' + b + (isNight() ? '-night' : '') + '.webp';
          Object.assign(el.style, { left: pb[0] + '%', top: pb[1] + '%', width: pb[2] + '%', height: pb[3] + '%', zIndex: Math.round(seat.seat.y * 10) });
        } else {
        el = document.createElement('img'); el.className = 'guest park-pose' + (isNight() ? ' night' : ''); el.alt = botName(b); el.draggable = false;
        el.src = cur.room.parkPoses[k] + b + '.webp';
        const hPct = (cur.room.parkH[k] || .17) * 100 / cur.room.aspect;
        Object.assign(el.style, { left: seat.seat.x + '%', top: seat.seat.y + '%', height: hPct + '%', zIndex: Math.round(seat.seat.y * 10) });
        const an = k === 'scope' && cur.room.scopeAnchor && cur.room.scopeAnchor[b];
        if (an) Object.assign(el.style, { height: cur.room.scopeFeet / (1 - an[1]) + '%', transform: `translate(${-an[0] * 100}%, ${-an[1] * 100}%)`, zIndex: Math.round((seat.seat.y + cur.room.scopeFeet) * 10) });
        }
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
    $('#actors').querySelectorAll('.link:not(.pboard):not(.pg-slide):not(.pg-chest):not(.pg-chimes)').forEach(e => e.remove()); buildLinks();
    const wantMain = !cur.bot || locate(cur.bot).scene === curId, wantVis = !!(cur.room.visitor && visiting);
    if (cur.sprite && !cur.room.poses && !cur.gallery && (!!actors.main !== wantMain || !!actors.visitor !== wantVis)) buildActors();
    buildGuests(); buildOwl(); updateMode(true); if (cur.play) playTools();
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
  const PG_COLORS = ['#d9534f', '#3f7fbf', '#f2c14e', '#5aa05a', '#e98b3a', '#9b6bc4', '#4fb3b0', '#e97fa8', '#f2c14e', '#3f7fbf'];
  const PG_SHAPES = ['', '', 'arch', '', 'cyl', '', 'tri', '', 'cyl', 'arch']; // v33: tri can't hold anything on top
  let BW = 3.6; // block width (v33: smaller, to suit the bigger playground), % of the scene width
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let ballRaf = 0;
  function buildPlay() {
    cancelAnimationFrame(ballRaf);
    if (!cur || !cur.play) return;
    const R = cur.room, act = $('#actors'); BW = R.blockW || 3.6; const BH = BW / (R.aspect || .75); // square blocks
    // v33: the swing hangs from the painted bar (ropes + seat drawn here); a bot riding it replaces it (.swing-rider)
    // v36: two swings hang from the painted crossbar (px coords of the art); a rider replaces its swing (.swing-rider[data-toy])
    const px = (x, y) => [x / R.artW * 100, y / R.artH * 100];
    (R.swings || []).forEach(SW => {
      const sw = document.createElement('div'); sw.className = 'swing'; sw.dataset.toy = SW.toy; sw.setAttribute('role', 'button'); sw.setAttribute('aria-label', 'Swing');
      const L = SW.L, dx = SW.half, dy = SW.half * SW.slope; // rope tops sit along the slanted bar
      sw.innerHTML = `<svg viewBox="-40 -20 80 ${L + 40}"><g stroke-linecap="round"><path d="M${-dx} ${dy}L${-dx} ${L + dy}M${dx} ${-dy}L${dx} ${L - dy}" stroke="#c9a46a" stroke-width="2.6"/><path d="M${-dx} ${dy}L${-dx} ${L + dy}M${dx} ${-dy}L${dx} ${L - dy}" stroke="#7a5a32" stroke-width="1" stroke-dasharray="2 2.6"/></g><path d="M${-dx - 6} ${L + dy - 1}L${dx + 6} ${L - dy - 1}L${dx + 6} ${L - dy + 7}L${-dx - 6} ${L + dy + 7}Z" fill="#9a6a3a" stroke="#5e3d1e" stroke-width="1.2"/><path d="M${-dx - 5} ${L + dy}L${dx + 5} ${L - dy}" stroke="#c08a52" stroke-width="2"/></svg>`;
      const [l, t] = px(SW.x - 40, SW.y - 20), [w, h] = px(80, L + 40);
      Object.assign(sw.style, { left: l + '%', top: t + '%', width: w + '%', height: h + '%', transformOrigin: `50% ${20 / (L + 40) * 100}%`, zIndex: SW.z });
      sw.style.touchAction = 'none'; // v36: the swing stays the hit target even when ridden (riders don't catch taps)
      const rider = () => act.querySelector(`.swing-rider[data-toy=${SW.toy}]`);
      bindSwing(sw, () => { const r = rider(); if (!r) return setOliToy(SW.toy); if (r.dataset.id === CFG.player) return setOliToy(null); pgPush(20, r); buzz(12); }, () => rider() || sw);
      act.appendChild(sw);
      // v42: soft contact shadow on the grass under the seat; it slides with the swing (pgPush)
      const sh = document.createElement('div'); sh.className = 'pg-swshadow'; sh.dataset.toy = SW.toy; const gy = SW.ground || SW.y + SW.L + 46;
      Object.assign(sh.style, { left: (SW.x - 30) / R.artW * 100 + '%', top: (gy - 8) / R.artH * 100 + '%', width: 60 / R.artW * 100 + '%', height: 16 / R.artH * 100 + '%', zIndex: SW.z - 2 });
      act.appendChild(sh);
    });
    if (R.swingLeg) { const lg = document.createElement('img'); lg.className = 'pg-ss'; lg.src = R.swingLeg.src; lg.alt = ''; lg.draggable = false; Object.assign(lg.style, { left: R.swingLeg.box[0] + '%', top: R.swingLeg.box[1] + '%', width: R.swingLeg.box[2] + '%', height: R.swingLeg.box[3] + '%', zIndex: R.swingLeg.z, pointerEvents: 'none' }); act.appendChild(lg); }
    // v42: rigid damped pendulum in the swing's own plane (perpendicular to the slanted crossbar), eased at both ends by the sine itself
    const SWD = [0.914, -0.406], SWF = [0.62, 0.32], SWI = [[1 / 0.914, 0], [0.406 / 0.914, 1]];
    const swMat = th => { const vx = Math.sin(th) * SWF[0], vy = Math.cos(th) + Math.sin(th) * SWF[1];
      const a = SWD[0] * SWI[0][0] + vx * SWI[1][0], c = vx * SWI[1][1], b = SWD[1] * SWI[0][0] + vy * SWI[1][0], d = vy * SWI[1][1];
      return `matrix(${a.toFixed(4)},${b.toFixed(4)},${c.toFixed(4)},${d.toFixed(4)},0,0)`; };
    const push = (amp, el) => { if (!motionOK) return; const tgt = el || act.querySelector('.swing-rider') || act.querySelector('.swing'); if (!tgt) return;
      const toy = tgt.dataset.toy, SW = (R.swings || []).find(q => q.toy === toy) || R.swings[0], sh = act.querySelector(`.pg-swshadow[data-toy=${toy}]`);
      const A = Math.min(16, Math.abs(amp) * 0.75) * Math.sign(amp || 1) * Math.PI / 180, T = 2.9, tau = 7.5, t0 = performance.now(), id = (tgt._swId = (tgt._swId || 0) + 1);
      const step = now => { if (tgt._swId !== id || !tgt.isConnected) return; const t = (now - t0) / 1000;
        const ramp = Math.min(1, t / 0.9), env = A * Math.exp(-t / tau) * (0.5 - 0.5 * Math.cos(Math.PI * ramp)), th = env * Math.sin(2 * Math.PI * t / T);
        tgt.style.transform = swMat(th);
        if (sh) { const sx = Math.sin(th) * SW.L * SWF[0], sy = Math.sin(th) * SW.L * SWF[1], lift = 1 - Math.cos(th);
          sh.style.transform = `translate(${(sx / 60 * 100).toFixed(1)}%, ${(sy / 16 * 100).toFixed(1)}%) scale(${(1 + lift * 1.5).toFixed(3)})`; sh.style.opacity = (0.8 - lift * 3).toFixed(3); }
        if (Math.abs(env) > 0.002 || t < 1) requestAnimationFrame(step); else { tgt.style.transform = ''; if (sh) { sh.style.transform = ''; sh.style.opacity = ''; } } };
      requestAnimationFrame(step); };
    pgPush = push;
    if (BOTS.some(b => where(b).place === 'playground' && where(b).pose !== 'sleeping')) setTimeout(() => push(9), 900); // someone's playing
    // bulletin board: painted board, little paper notes, tap to read board.json
    const bd = document.createElement('div'); bd.className = 'link zone pboard'; bd.setAttribute('role', 'button'); bd.setAttribute('aria-label', 'Bulletin board');
    Object.assign(bd.style, { left: R.board.left + '%', top: R.board.top + '%', width: R.board.width + '%', height: R.board.height + '%' });
    // v46: notes sit on the board's painted face: a skewed plane (art px TL 453,1597 / TR 532,1618 / BL 453,1685), aged paper, a tack, a soft shadow
    const face = document.createElement('div'); face.className = 'pb-face'; const BF = R.boardFace || { x: 453, y: 1597, w: 79, h: 88, dy: 21 }, bA = R.board;
    Object.assign(face.style, { left: ((BF.x / R.artW * 100 - bA.left) / bA.width * 100) + '%', top: ((BF.y / R.artH * 100 - bA.top) / bA.height * 100) + '%', width: (BF.w / R.artW * 100 / bA.width * 100) + '%', height: (BF.h / R.artH * 100 / bA.height * 100) + '%', transform: `skewY(${(Math.atan2(BF.dy, BF.w) * 180 / Math.PI).toFixed(2)}deg)` });
    const NP = [[7, 7, -2.5], [53, 9, 2], [9, 53, 1.5], [52, 55, -2]], tints = ['#efe3c6', '#eadcbc', '#f1e6cc', '#e8d8b6'], pins = ['#b8463b', '#3f6f9a', '#c79a3a', '#5b8a4a'];
    boardNotes.slice(0, 4).forEach((n, i) => { const p = document.createElement('i'); const [x, y, r] = NP[i]; Object.assign(p.style, { left: x + '%', top: y + '%', transform: `rotate(${r}deg)` }); p.style.setProperty('--paper', tints[i]); p.style.setProperty('--pin', pins[i]); p.innerHTML = '<b></b>'; face.appendChild(p); });
    bd.appendChild(face);
    bd.onclick = ev => { ev.stopPropagation(); openNotes(); };
    act.appendChild(bd);
    // blocks
    const saved = store.get('pg-blocks' + (R.stateKey || ''), null);
    const PG_START = (R.blockStart || []).map(([x, y, k, on]) => [x, y - (k || 0) * BH, on == null ? null : on]);
    const start = PG_COLORS.map((c, i) => ({ id: i, x: PG_START[i][0], y: PG_START[i][1], on: PG_START[i][2] }));
    const blocks = (Array.isArray(saved) && saved.length === PG_COLORS.length ? saved : start).map((b, i) => ({ ...start[i], ...b, id: i }));
    const els = [];
    const z = b => Math.round(b.y * 10) + 1;
    const draw = b => { const e = els[b.id]; e.style.left = (b.x - BW / 2) + '%'; e.style.top = (b.y - BH) + '%'; e.style.zIndex = z(b); };
    const stackOf = b => { const out = [b]; blocks.forEach(o => { if (o.on === b.id) out.push(...stackOf(o)); }); return out; };
    const save = () => store.set('pg-blocks' + (R.stateKey || ''), blocks.map(({ id, x, y, on }) => ({ id, x: +x.toFixed(2), y: +y.toFixed(2), on })));
    blocks.forEach(b => {
      const e = document.createElement('div'); e.className = 'block' + (PG_SHAPES[b.id] ? ' ' + PG_SHAPES[b.id] : ''); e.style.setProperty('--c', PG_COLORS[b.id]);
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
          if (top && PG_SHAPES[top.id] !== 'tri' && !blocks.some(o => o.on === top.id && !ids.has(o.id))) { dx = top.x - b.x; dy = (top.y - BH) - b.y; b.on = top.id; buzz(14); }
          else if (!inPoly(b.x, b.y, R.lawn)) { dx = orig[0].x - b.x; dy = orig[0].y - b.y; }
          group.forEach(g => { g.x += dx; g.y += dy; els[g.id].classList.remove('held'); draw(g); if (motionOK) els[g.id].animate([{ transform: 'translateY(-14%)' }, { transform: 'translateY(2%) scaleY(.94)' }, { transform: 'none' }], { duration: 300, easing: 'ease-out' }); });
          // stacked blocks keep their stack order on top
          group.forEach(g => { if (g !== b) els[g.id].style.zIndex = z(b) + (b.y - g.y) / BH; });
          save();
        };
        e.addEventListener('pointermove', mv); e.addEventListener('pointerup', up); e.addEventListener('pointercancel', up);
      });
    });
    const root = b => (b.on == null ? b : root(blocks[b.on])); blocks.forEach(b => { if (b.on != null) { const r = root(b); els[b.id].style.zIndex = z(r) + (r.y - b.y) / BH; } }); // stacks: upper blocks in front
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'pill pg-reset'; reset.textContent = 'Tidy blocks';
    reset.onclick = ev => { ev.stopPropagation(); store.set('pg-blocks' + (R.stateKey || ''), null); buildPlayFresh(); };
    $('#playTools').replaceChildren(reset); playTools();
    buildToys(R, act);
    // ball: flick it, or tap for a little kick
    const ball = document.createElement('div'); ball.className = 'ball'; ball.setAttribute('role', 'button'); ball.setAttribute('aria-label', 'Ball');
    const st = store.get('pg-ball' + (R.stateKey || ''), null) || { x: R.ball ? R.ball[0] : 49, y: R.ball ? R.ball[1] : 53 }; const bs = { x: st.x, y: st.y, vx: 0, vy: 0 };
    const BD = R.ballD || 4.2; ball.style.width = BD + '%'; ball.style.height = (BD / (R.aspect || .75)) + '%';
    const drawBall = () => { ball.style.left = (bs.x - BD / 2) + '%'; ball.style.top = (bs.y - BD / (R.aspect || .75)) + '%'; ball.style.zIndex = Math.round(bs.y * 10); };
    drawBall(); act.appendChild(ball);
    const roll = () => {
      bs.vx *= .965; bs.vy *= .965;
      let nx = bs.x + bs.vx, ny = bs.y + bs.vy;
      if (!inPoly(nx, ny, R.lawn)) { if (!inPoly(bs.x + bs.vx, bs.y, R.lawn)) bs.vx *= -.7; if (!inPoly(bs.x, bs.y + bs.vy, R.lawn)) bs.vy *= -.7; nx = bs.x + bs.vx; ny = bs.y + bs.vy; if (!inPoly(nx, ny, R.lawn)) { nx = bs.x; ny = bs.y; } }
      bs.x = nx; bs.y = ny; ball.style.transform = `rotate(${(bs.x * 40) % 360}deg)`; drawBall();
      if (Math.hypot(bs.vx, bs.vy) > .02) ballRaf = requestAnimationFrame(roll); else store.set('pg-ball' + (R.stateKey || ''), { x: +bs.x.toFixed(2), y: +bs.y.toFixed(2) });
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
  // ---------- v33: more toys ----------
  var pgPush = () => {}, pgAC = null;
  function pgNote(f, dur = 1.4, type = 'triangle', vol = .18) { // soft mallet note (C major, matches the music)
    try { pgAC = pgAC || new (window.AudioContext || window.webkitAudioContext)(); if (pgAC.state === 'suspended') pgAC.resume();
      const t = pgAC.currentTime, o = pgAC.createOscillator(), o2 = pgAC.createOscillator(), g = pgAC.createGain();
      o.type = type; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 4; const g2 = pgAC.createGain(); g2.gain.value = .08;
      o2.connect(g2); g2.connect(g); o.connect(g); g.connect(pgAC.destination);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05); } catch (e) {}
  }
  const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, A6: 1760 };
  const oliToy = () => { const o = store.get('olithia-at', null); return o && o.scene === curId && o.toy ? o.toy : null; };
  function setOliToy(t) { store.set('olithia-at', { scene: curId, pose: 'idle', toy: t || null }); applyLive(); } // v35: Olithia picks a toy
  function pgToys() { // who plays with what this hour (one per toy, one instance each); Olithia's own pick comes first
    const out = {}, used = new Set(), h = Math.floor(hourNow()), R = cur && cur.room;
    if (!R || !R.toys) return out;
    const here = b => { const w = locate(b); return w.scene === curId && w.pose !== 'sleeping'; };
    const mine = here(CFG.player) && oliToy(); if (mine && R.toys[mine]) { out[CFG.player] = mine; used.add(mine); }
    const oa = store.get('olithia-at', null), hopped = oa && oa.scene === curId && 'toy' in oa && !oa.toy; // she hopped off: let her stand
    [...BOTS, CFG.player].forEach((b, i) => { if (out[b] || !here(b) || (b === CFG.player && hopped)) return;
      const opts = Object.keys(R.toys);
      for (let k = 0; k < opts.length; k++) { const t = opts[(h + i + k) % opts.length]; if (!used.has(t)) { used.add(t); out[b] = t; break; } } });
    return out;
  }
  const toyTaker = t => { const m = pgToys(); return Object.keys(m).find(b => m[b] === t); };
  function bindSwing(el, onTap, target) { // v35: a drag pushes, a tap does onTap (no double push)
    let x0 = null, dragged = false;
    el.addEventListener('pointerdown', e => { e.stopPropagation(); x0 = e.clientX; dragged = false; });
    el.addEventListener('pointermove', e => { if (x0 != null && Math.abs(e.clientX - x0) > 12) dragged = true; });
    el.addEventListener('pointerup', e => { if (x0 != null && dragged) { const dx = e.clientX - x0; pgPush(Math.min(28, 10 + Math.abs(dx) / 4) * Math.sign(dx), target ? target() : el); buzz(10); } x0 = null; });
    el.addEventListener('pointercancel', () => { x0 = null; });
    el.onclick = ev => { ev.stopPropagation(); if (dragged) { dragged = false; return; } onTap(); };
  }
  function toyEl(b, t) {
    const R = cur.room, T = R.toys[t], el = document.createElement('img'); el.alt = botName(b); el.draggable = false;
    const SWg = (R.swings || []).find(q => q.toy === t);
    if (SWg) { el.className = 'guest swing-rider'; el.dataset.toy = t; el.src = R.swingRiders + (SWg.patch || 'A') + '-' + b + '.webp';
      // v37: the painted rider+seat+ropes patch hangs from the crossbar and rotates around it
      Object.assign(el.style, { left: (SWg.x - 70) / R.artW * 100 + '%', top: (SWg.y - 24) / R.artH * 100 + '%', width: 140 / R.artW * 100 + '%', height: 250 / R.artH * 100 + '%', transformOrigin: '50% 9.6%', zIndex: SWg.z + 1 });
      el.style.touchAction = 'none';
      el.style.pointerEvents = 'none'; // taps go to the swing underneath
      if (motionOK) setTimeout(() => pgPush(12, el), 700 + Math.random() * 900);
    } else { el.className = 'guest pg-toy' + (T.box ? ' boxed' : ''); el.dataset.toy = t; el.src = T.pose + b + '.webp';
      if (b === CFG.player) setTimeout(() => { el.onclick = ev => { ev.stopPropagation(); setOliToy(null); }; }, 0); else el.style.pointerEvents = 'none'; // tap her to hop off
      const [bx, by, bw, bh] = T.box; // v37: painted-in pose, art px box
      Object.assign(el.style, { left: bx / R.artW * 100 + '%', top: by / R.artH * 100 + '%', width: bw / R.artW * 100 + '%', height: bh / R.artH * 100 + '%', zIndex: Math.round(T.y * 10) }); }
    return el;
  }
  function toyTap(t, el, label) {
    if (oliToy() === t) return setOliToy(null);
    const who = toyTaker(t); if (who && who !== CFG.player) return showBubble(el, label, `${botName(who)} is playing here. Try another toy!`);
    setOliToy(t);
  }
  function buildToys(R, act) {
    // seesaw (v40): the plank tilts in 3D about the axle; its cast shadow and the end's contact shadow follow
    const S = R.seesaw, pl = document.createElement('img'), po = document.createElement('img'), psh = document.createElement('img'), tsh = document.createElement('img');
    const W0 = 280, H0 = 160, [px, py] = S.pivot, [ax, ay] = S.e1, [sbx, sby] = S.e2, det = ax * sby - ay * sbx, iA = [sby / det, -sbx / det]; // row of B^-1 giving "distance along the plank"
    [[pl, S.plank, 642], [po, S.post, 641], [psh, S.plankShadow, 630], [tsh, S.postShadow, 631]].forEach(([e, src, z]) => { e.className = 'pg-ss'; e.draggable = false; e.alt = ''; e.src = src;
      Object.assign(e.style, { left: S.box.left + '%', top: S.box.top + '%', width: S.box.width + '%', height: S.box.height + '%', zIndex: z, transformOrigin: `${px / W0 * 100}% ${py / H0 * 100}%` }); act.appendChild(e); });
    psh.style.pointerEvents = tsh.style.pointerEvents = 'none';
    const dots = S.ends.map(() => { const d = document.createElement('div'); d.className = 'pg-ss-contact'; d.style.zIndex = 632; act.appendChild(d); return d; });
    const toPct = (x, y) => [S.box.left + x / W0 * S.box.width, S.box.top + y / H0 * S.box.height];
    let phi = S.phiL, side = 'L', raf = 0;
    const pose = deg => { // v40: rigid 3D rotation in the plane of the plank and the vertical (basis e1, up = (0,-kv)), so thickness and handles stay solid
      const r = deg * Math.PI / 180, s = Math.sin(r), c = Math.cos(r), kv = S.kv;
      const ux = c * ax, uy = c * ay - s * kv, vx2 = -s * ax, vy2 = -s * ay - c * kv; // images of e1 and of up
      const B = [[1 / ax, 0], [ay / (ax * kv), -1 / kv]];
      const m = [ux * B[0][0] + vx2 * B[1][0], uy * B[0][0] + vy2 * B[1][0], ux * B[0][1] + vx2 * B[1][1], uy * B[0][1] + vy2 * B[1][1]];
      pl.style.transform = `matrix(${m.map(v => v.toFixed(4)).join(',')},0,0)`;
      // cast shadow: the plank's top face, each point dropped to the grass and drifted along the light by its height
      const gs = s, gc = c, gx = gc * ax, gy = gc * ay - gs * kv, Gi = [[sby / det, -sbx / det], [-ay / det, ax / det]];
      const g = [gx * Gi[0][0] + sbx * Gi[1][0], gy * Gi[0][0] + sby * Gi[1][0], gx * Gi[0][1] + sbx * Gi[1][1], gy * Gi[0][1] + sby * Gi[1][1]];
      const k = kv * s, [lx, ly] = S.light;
      const sm = [g[0] + k * lx * iA[0], g[1] + k * ly * iA[0], g[2] + k * lx * iA[1], g[3] + k * ly * iA[1]];
      psh.style.transform = `translate(${(S.z0 * lx / W0 * 100).toFixed(3)}%,${(S.z0 * ly / H0 * 100).toFixed(3)}%) matrix(${sm.map(v => v.toFixed(4)).join(',')},0,0)`;
      S.ends.forEach(([ex, ey], n) => { const vx = ex - px, vy = ey - py, al = vx / ax, H = (al * ay - vy) / kv, z = S.z0 + kv * (s * al + c * H);
        const qx = px + m[0] * vx + m[2] * vy, qy = py + m[1] * vx + m[3] * vy, [L, T] = toPct(qx, qy + 1.5), d = dots[n];
        d.style.left = L + '%'; d.style.top = T + '%'; d.style.opacity = Math.max(0, 1 - Math.max(0, z) / 14).toFixed(2); }); };
    pose(phi);
    pl.setAttribute('role', 'button'); pl.setAttribute('aria-label', 'Seesaw');
    const tip = () => { const from = phi, to = side === 'L' ? S.phiR : S.phiL; side = side === 'L' ? 'R' : 'L'; buzz(10); pgNote(side === 'R' ? 196 : 262, .5, 'sine', .12);
      cancelAnimationFrame(raf); if (!motionOK) { pose(phi = to); return; }
      const t0 = performance.now(), D = 950;
      const f = u => { // fall with gravity, land, one soft bump, settle (never past the grass)
        if (u < .5) { const q = u / .5; return q * q; }
        if (u < .75) { const q = (u - .5) / .25; return 1 - .12 * Math.sin(q * Math.PI); }
        const q = (u - .75) / .25; return 1 - .035 * Math.sin(q * Math.PI); };
      const step = now => { const u = Math.min(1, (now - t0) / D); phi = from + (to - from) * f(u); pose(phi); if (u < 1) raf = requestAnimationFrame(step); else if (u >= 1) { phi = to; pose(phi); buzz(6); } };
      raf = requestAnimationFrame(step); };
    [pl, po].forEach(e => e.onclick = ev => { ev.stopPropagation(); tip(); });
    // v35: tap the slide to sit at the top (or hop off)
    const sl = document.createElement('div'); sl.className = 'link zone pg-slide'; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Slide');
    Object.assign(sl.style, { left: R.slideZone.left + '%', top: R.slideZone.top + '%', width: R.slideZone.width + '%', height: R.slideZone.height + '%', zIndex: 330 });
    sl.onclick = ev => { ev.stopPropagation(); toyTap('slide', sl, 'Slide'); }; act.appendChild(sl);
    // sandbox: drag to draw, double-tap for a castle, press and hold to sit in it (saved)
    const P = R.sandbox, xs = P.map(p => p[0]), ys = P.map(p => p[1]), bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
    const sand = document.createElement('canvas'); sand.className = 'pg-sand'; sand.width = Math.round(bw * R.artW / 50); sand.height = Math.round(bh * R.artH / 50); // v38: 2px per art px, true aspect (no stretched streaks)
    Object.assign(sand.style, { left: bx + '%', top: by + '%', width: bw + '%', height: bh + '%', zIndex: 20, clipPath: `polygon(${P.map(p => ((p[0] - bx) / bw * 100).toFixed(1) + '% ' + ((p[1] - by) / bh * 100).toFixed(1) + '%').join(',')})` });
    sand.setAttribute('aria-label', 'Sandbox: drag to draw, double-tap for a castle, press and hold to sit'); act.appendChild(sand);
    const sc = sand.getContext('2d'), sv = store.get('pg-sand-v38', null);
    if (sv) { const im = new Image(); im.onload = () => sc.drawImage(im, 0, 0); im.src = sv; }
    const sp = e => { const r = sand.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * sand.width, (e.clientY - r.top) / r.height * sand.height]; };
    const saveSand = () => { try { store.set('pg-sand-v38', sand.toDataURL('image/png')); } catch (e) {} };
    const castle = (x, y) => { const c = sc; c.save(); c.translate(x, y);
      const body = (ox, w, h) => { c.fillStyle = '#c8a46a'; c.fillRect(ox - w / 2, -h, w, h); c.fillStyle = '#e2c48e'; c.fillRect(ox - w / 2, -h, w * .35, h); c.strokeStyle = '#8f6b3a'; c.lineWidth = 1; c.strokeRect(ox - w / 2, -h, w, h);
        for (let k = 0; k < 3; k++) { c.fillStyle = '#c8a46a'; c.fillRect(ox - w / 2 + k * w / 2.5, -h - 4, w / 5, 4); } };
      body(-11, 9, 18); body(11, 9, 18); body(0, 16, 12); c.fillStyle = '#7a5530'; c.fillRect(-3, -6, 6, 6); c.fillStyle = '#e8574a'; c.beginPath(); c.moveTo(11, -26); c.lineTo(11, -34); c.lineTo(17, -31); c.closePath(); c.fill();
      c.fillStyle = 'rgba(90,60,30,.25)'; c.beginPath(); c.ellipse(0, 1, 22, 4, 0, 0, 6.3); c.fill(); c.restore(); };
    let lastTap = 0, drawing = null, moved = false, openT = 0;
    let hold = 0, hold0 = null;
    sand.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); sand.setPointerCapture(e.pointerId); const p = sp(e), now = performance.now();
      clearTimeout(hold); clearTimeout(openT); moved = false; hold0 = [e.clientX, e.clientY]; hold = setTimeout(() => { drawing = null; hold0 = null; moved = true; buzz(14); toyTap('sand', sand, 'Sandbox'); }, 600);
      if (now - lastTap < 330) { moved = true; castle(p[0], p[1] + 10); buzz(16); saveSand(); lastTap = 0; drawing = null; return; } lastTap = now; drawing = p; });
    sand.addEventListener('pointermove', e => { if (hold0 && Math.hypot(e.clientX - hold0[0], e.clientY - hold0[1]) > 6) { clearTimeout(hold); hold0 = null; moved = true; } if (!drawing) return; const p = sp(e);
      sc.lineCap = 'round'; sc.lineJoin = 'round';
      sc.save(); sc.filter = 'blur(1.2px)'; // v38: a soft groove: shaded lower lip, sunlit upper lip
      sc.strokeStyle = 'rgba(150,100,48,.30)'; sc.lineWidth = 6.5; sc.beginPath(); sc.moveTo(drawing[0], drawing[1]); sc.lineTo(p[0], p[1]); sc.stroke();
      sc.strokeStyle = 'rgba(118,76,34,.24)'; sc.lineWidth = 3; sc.beginPath(); sc.moveTo(drawing[0], drawing[1] + 1); sc.lineTo(p[0], p[1] + 1); sc.stroke();
      sc.strokeStyle = 'rgba(255,232,180,.32)'; sc.lineWidth = 1.6; sc.beginPath(); sc.moveTo(drawing[0], drawing[1] - 2.6); sc.lineTo(p[0], p[1] - 2.6); sc.stroke(); sc.restore(); drawing = p; });
    const endSand = e => { clearTimeout(hold); hold0 = null; if (drawing && moved) saveSand(); drawing = null; }; // v45: Dig & Find lives in the chest now
    sand.addEventListener('pointerup', endSand); sand.addEventListener('pointercancel', endSand);
    // v45: rake + zen lines. Sandbox corners in canvas px: A left, B back, C right, D front
    const Q = P.map(p => [(p[0] - bx) / bw * sand.width, (p[1] - by) / bh * sand.height]), [qA, qB, qC, qD] = Q, lerp = (u, v, t) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
    const zenLine = t => { const s = lerp(qA, qD, t), e = lerp(qB, qC, t); sc.save(); sc.lineCap = 'round'; sc.filter = 'blur(.8px)';
      sc.strokeStyle = 'rgba(140,94,46,.24)'; sc.lineWidth = 2.6; sc.beginPath(); sc.moveTo(s[0], s[1] + .8); sc.lineTo(e[0], e[1] + .8); sc.stroke();
      sc.strokeStyle = 'rgba(255,236,190,.3)'; sc.lineWidth = 1.3; sc.beginPath(); sc.moveTo(s[0], s[1] - 1.2); sc.lineTo(e[0], e[1] - 1.2); sc.stroke(); sc.restore(); };
    const clearTo = p => { sc.save(); sc.beginPath(); const e1 = lerp(qB, qC, p), e2 = lerp(qA, qD, p); [qA, qB, e1, e2].forEach((q, i) => i ? sc.lineTo(q[0], q[1]) : sc.moveTo(q[0], q[1])); sc.closePath(); sc.clip();
      sc.clearRect(0, 0, sand.width, sand.height); sc.restore(); };
    const N = 13;
    pgSmooth = (onStep, done) => { const t0 = performance.now(), D = motionOK ? 1600 : 1; let drawn = 0;
      const step = now => { const p = Math.min(1, (now - t0) / D), pe = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; clearTo(Math.min(1, pe + .04));
        for (let i = 0; i < N; i++) { const t = (i + .5) / N; if (t <= pe) zenLine(t); } // redraw the lines already passed (cleared band is re-lined)
        if (onStep) onStep(pe, lerp(lerp(qA, qD, pe), lerp(qB, qC, pe), .5));
        if (p < 1) requestAnimationFrame(step); else { saveSand(); if (done) done(); } };
      requestAnimationFrame(step); };
    // the rake: tap it to sweep the sand smooth
    if (R.rake) { const K = R.rake, [kx, ky, kw, kh] = K.box, rk = document.createElement('img'); rk.className = 'pg-rake'; rk.src = K.src; rk.alt = 'Rake'; rk.draggable = false; rk.setAttribute('role', 'button'); rk.setAttribute('aria-label', 'Rake: smooth the sand');
      const AX = v => v / R.artW * 100, AY = v => v / R.artH * 100;
      Object.assign(rk.style, { left: AX(kx) + '%', top: AY(ky) + '%', width: AX(kw) + '%', height: AY(kh) + '%', zIndex: Math.round(AY(ky + kh * .8) * 10) });
      let busy = false;
      rk.onclick = ev => { ev.stopPropagation(); if (busy) return; busy = true; buzz(8); const r0 = rk.style.cssText;
        try { const ac = pgAC = pgAC || new (window.AudioContext || window.webkitAudioContext)(); const len = 1.5, b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0);
          for (let i = 0; i < d.length; i++) { const t = i / ac.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t / len) * (.55 + .45 * Math.abs(Math.sin(t * 7))); }
          const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .7; g.gain.value = .07; s.buffer = b; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); } catch (e) {}
        // the rake head rides the sweep line across the sand (canvas px -> scene %)
        const toPct = q => [bx + q[0] / sand.width * bw, by + q[1] / sand.height * bh];
        rk.style.transition = 'none';
        pgSmooth((p, mid) => { const [mx, my] = toPct(mid), hx = AX(kx + kw * K.head[0]), hy = AY(ky + kh * K.head[1]), w = Math.sin(p * Math.PI * 6) * .6;
          rk.style.zIndex = Math.round(my * 10); // v49: depth follows the sweep line, so a kneeling character in front hides it
          rk.style.transform = `translate(${((mx - hx) / AX(kw) * 100 + w).toFixed(2)}%, ${((my - hy) / AY(kh) * 100).toFixed(2)}%) rotate(${(-4 + w).toFixed(2)}deg)`; },
          () => { rk.animate([{ transform: rk.style.transform }, { transform: 'none' }], { duration: motionOK ? 450 : 1, easing: 'ease-in-out' }).onfinish = () => { rk.style.cssText = r0; busy = false; }; });
      };
      act.appendChild(rk); }
    // v45: smooth stones: drag one into the sand (it settles with a little groove ring), drag it back out to put it away
    if (R.stones) { const AX = v => v / R.artW * 100, AY = v => v / R.artH * 100, saved = store.get('pg-stones', {}) || {};
      const inSand = (x, y) => { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins; } return ins; };
      const shrink = (x, y, k) => { const cx = P.reduce((s, p) => s + p[0], 0) / 4, cy = P.reduce((s, p) => s + p[1], 0) / 4; return [cx + (x - cx) * k, cy + (y - cy) * k]; };
      R.stones.forEach((S, i) => { const el = document.createElement('div'); el.className = 'pg-stone'; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Smooth stone');
        el.innerHTML = `<i class="ring"></i><img src="${S.src}" alt="" draggable="false">`;
        const wP = AX(S.w + 14), hP = AY(S.h + 14); // finger-friendly hit box around the stone
        let pos = saved[i] || null; // [x%, y%] of the stone's foot when in the sand
        const put = () => { const [x, y] = pos || [AX(S.home[0]), AY(S.home[1])]; Object.assign(el.style, { left: (x - wP / 2) + '%', top: (y - hP + AY(7)) + '%', width: wP + '%', height: hP + '%', zIndex: pos ? 30 + Math.round(y) : Math.round(y * 10) });
          el.classList.toggle('in', !!pos); };
        el.querySelector('img').style.width = (S.w / (S.w + 14) * 100) + '%'; put();
        el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('lift'); el.style.zIndex = 3000;
          const r = act.getBoundingClientRect(), mv = ev => { const x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100 + AY(4); Object.assign(el.style, { left: (x - wP / 2) + '%', top: (y - hP + AY(7)) + '%' }); el._xy = [x, y]; };
          const up = ev => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('lift');
            if (el._xy) { let [x, y] = el._xy; if (inSand(x, y)) pos = [x, y]; else { const [sx, sy] = shrink(x, y, .82); pos = (inSand(...shrink(x, y, .9)) || Math.hypot(sx - x, (sy - y) * 2.6) < 2.5) ? shrink(x, y, .9) : null; }
              if (pos && !inSand(...pos)) pos = null;
              buzz(pos ? 10 : 6); try { pgNote(pos ? 196 : 262, .3, 'sine', .1); } catch (e) {} }
            el._xy = null; saved[i] = pos; store.set('pg-stones', saved); put();
            if (pos && motionOK) el.querySelector('img').animate([{ translate: '0 -18%' }, { translate: '0 3%' }, { translate: '0 0' }], { duration: 260, easing: 'ease-out' }); };
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); });
        act.appendChild(el); }); }
    // chalkboard: shows her doodle; tap to draw
    // v47: the doodle lives ON the painted slate: an affine plane through its inner corners (art px TL, TR, BL), transparent, grainy chalk
    const C = R.chalk, SL = C.slate || { tl: [155, 1380], tr: [223.75, 1368], bl: [164.5, 1463] }, ch = document.createElement('canvas'); ch.className = 'pg-chalk'; ch.width = 166; ch.height = 200;
    const sw = SL.tr[0] - SL.tl[0], sh = SL.bl[1] - SL.tl[1];
    Object.assign(ch.style, { left: SL.tl[0] / R.artW * 100 + '%', top: SL.tl[1] / R.artH * 100 + '%', width: sw / R.artW * 100 + '%', height: sh / R.artH * 100 + '%', transformOrigin: '0 0',
      transform: `matrix(1,${((SL.tr[1] - SL.tl[1]) / sw).toFixed(4)},${((SL.bl[0] - SL.tl[0]) / sh).toFixed(4)},1,0,0)`, zIndex: 760 }); ch.setAttribute('role', 'button'); ch.setAttribute('aria-label', 'Chalkboard');
    const cv = store.get('pg-chalk', null); if (cv) { const im = new Image(); im.onload = () => chalkPreview(ch, im); im.src = cv; }
    ch.onclick = ev => { ev.stopPropagation(); openChalk(ch); }; act.appendChild(ch);
    // v45: the sand-filled toy chest opens Dig & Find (tap zone = the sand inside it)
    const chest = document.createElement('div'); chest.className = 'link zone pg-chest'; chest.setAttribute('role', 'button'); chest.setAttribute('aria-label', 'Toy chest: Dig & Find');
    const CS = R.chestSand.map(([x, y]) => [x / R.artW * 100, y / R.artH * 100]), cxs = CS.map(p => p[0]), cys = CS.map(p => p[1]), cbx = Math.min(...cxs) - .8, cby = Math.min(...cys) - .5, cbw = Math.max(...cxs) - cbx + .8, cbh = Math.max(...cys) - cby + .5;
    Object.assign(chest.style, { left: cbx + '%', top: cby + '%', width: cbw + '%', height: cbh + '%', zIndex: 700, clipPath: `polygon(${CS.map(p => ((p[0] - cbx) / cbw * 100).toFixed(1) + '% ' + ((p[1] - cby) / cbh * 100).toFixed(1) + '%').join(',')})` });
    chest.onclick = ev => { ev.stopPropagation(); buzz(8); try { pgNote(330, .25, 'sine', .08); } catch (e) {}
      if (motionOK) for (let i = 0; i < 6; i++) { const g = document.createElement('i'); g.className = 'pg-grain'; Object.assign(g.style, { left: (cbx + cbw * (.3 + Math.random() * .4)) + '%', top: (cby + cbh * .5) + '%', zIndex: 3000 }); act.appendChild(g);
        g.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 30}px, ${-14 - Math.random() * 16}px)`, opacity: 0 }], { duration: 500, easing: 'ease-out' }); setTimeout(() => g.remove(), 520); }
      clearTimeout(digT); digT = setTimeout(() => { if (curId === 'playground' && $('#house').classList.contains('active')) openDig(); }, motionOK ? 260 : 0); };
    act.appendChild(chest);
    const bubble = (x, y) => { const b = document.createElement('div'); b.className = 'pg-bubble'; const s = 2.2 + Math.random() * 2.6; Object.assign(b.style, { left: x + '%', top: y + '%', width: s + '%', zIndex: 3000 });
      act.appendChild(b); const dx = (Math.random() - .5) * 160, dy = -(180 + Math.random() * 220), d = 5200 + Math.random() * 2800;
      const an = b.animate([{ transform: 'translate(0,0) scale(.3)', opacity: 0 }, { transform: `translate(${dx * .3}px,${dy * .25}px) scale(1)`, opacity: 1, offset: .15 }, { transform: `translate(${dx}px,${dy}px) scale(1.05)`, opacity: .9, offset: .9 }, { transform: `translate(${dx * 1.1}px,${dy * 1.1}px) scale(1.1)`, opacity: 0 }], { duration: motionOK ? d : 1, easing: 'ease-out' });
      an.onfinish = () => b.remove();
      b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); an.pause(); b.classList.add('pop'); pgNote(1400 + Math.random() * 600, .12, 'sine', .08); buzz(6); setTimeout(() => b.remove(), 220); }); };
    // xylophone: six keys C D E F G A
    const X = R.xylo, keys = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5'];
    keys.forEach((n, i) => { const k = document.createElement('div'); k.className = 'pg-key'; k.setAttribute('role', 'button'); k.setAttribute('aria-label', 'Xylophone ' + n[0]);
      Object.assign(k.style, { left: (X.left + X.width * i / 6) + '%', top: X.top + '%', width: (X.width / 6) + '%', height: X.height + '%', zIndex: 650 });
      k.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); pgNote(NOTE[n]); buzz(5); k.classList.remove('hit'); void k.offsetWidth; k.classList.add('hit'); }); act.appendChild(k); });
    // wind chimes
    const W = R.chimes, wc = document.createElement('div'); wc.className = 'link zone pg-chimes'; wc.setAttribute('role', 'button'); wc.setAttribute('aria-label', 'Wind chimes');
    Object.assign(wc.style, { left: W.left + '%', top: W.top + '%', width: W.width + '%', height: W.height + '%', zIndex: 650 });
    wc.onclick = ev => { ev.stopPropagation(); const seq = ['C6', 'E6', 'G6', 'A6', 'G6', 'E6'].sort(() => Math.random() - .5).slice(0, 4); seq.forEach((n, i) => setTimeout(() => pgNote(NOTE[n], 2.2, 'sine', .1), i * 170 + Math.random() * 60)); wc.classList.remove('ring'); void wc.offsetWidth; wc.classList.add('ring'); };
    act.appendChild(wc);
    // kite: drag it about the sky
    const K = R.kite, ks = store.get('pg-kite' + (R.stateKey || ''), null) || { x: K.x, y: K.y }, svgNS = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(svgNS, 'svg'); line.setAttribute('class', 'pg-string'); line.setAttribute('viewBox', '0 0 100 100'); line.setAttribute('preserveAspectRatio', 'none');
    line.innerHTML = '<path fill="none" stroke="#fff8e8" stroke-width=".25" vector-effect="non-scaling-stroke" stroke-opacity=".85"/>'; act.appendChild(line);
    const kite = document.createElement('div'); kite.className = 'pg-kite'; kite.setAttribute('role', 'button'); kite.setAttribute('aria-label', 'Kite');
    kite.innerHTML = '<svg viewBox="0 0 40 70"><path d="M20 2L36 20L20 40L4 20Z" fill="#e8574a" stroke="#7a2a22" stroke-width="1"/><path d="M20 2L36 20L20 20Z" fill="#f2c14e"/><path d="M4 20L20 40L20 20Z" fill="#3f7fbf"/><path d="M20 2V40M4 20H36" stroke="#5a3a22" stroke-width=".8"/><path class="tail" d="M20 40c4 6-4 10 0 16s-4 10 0 14" fill="none" stroke="#fff4e2" stroke-width="1"/><path d="M17 50l6-2M17 60l6-2" stroke="#e8574a" stroke-width="2"/></svg>';
    act.appendChild(kite);
    const drawKite = () => { Object.assign(kite.style, { left: (ks.x - 2.6) + '%', top: (ks.y - 1.2) + '%' }); const mx = (ks.x + K.anchor[0]) / 2 + 3, my = (ks.y + K.anchor[1]) / 2 + 6;
      line.firstChild.setAttribute('d', `M${ks.x} ${ks.y + 3.2}Q${mx} ${my} ${K.anchor[0]} ${K.anchor[1]}`); };
    drawKite();
    kite.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); kite.setPointerCapture(e.pointerId); kite.classList.add('held');
      const mv = m => { const p = toStage(m.clientX, m.clientY); ks.x = clamp(p.x, 6, 94); ks.y = clamp(p.y, 1, K.maxY || 30); drawKite(); };
      const up = () => { kite.removeEventListener('pointermove', mv); kite.removeEventListener('pointerup', up); kite.classList.remove('held'); store.set('pg-kite' + (R.stateKey || ''), { x: +ks.x.toFixed(1), y: +ks.y.toFixed(1) }); };
      kite.addEventListener('pointermove', mv); kite.addEventListener('pointerup', up); });
  }
  var pgSmooth = () => {};
  // ---------- v37: Dig & Find ----------
  const DIG_KINDS = [
    { k: 'shell', e: '🐚', n: 'Seashell', w: 5 }, { k: 'gear', e: '⚙️', n: "Gorbo's gear", w: 3 }, { k: 'moon', e: '🌙', n: "Loria's moon charm", w: 3 },
    { k: 'feather', e: '🪶', n: "Scout's fox-tail feather", w: 3 }, { k: 'acorn', e: '🌰', n: 'Acorn', w: 4 }, { k: 'umbrella', e: '☂️', n: 'Tiny umbrella', w: 3 },
    { k: 'pebble', e: '🪨', n: 'Smooth pebble', w: 3 }, { k: 'bluestar', e: '★', n: 'Blue star gem (rare!)', w: .35 }];
  let digState = null;
  function digRound() {
    const pick = () => { const tot = DIG_KINDS.reduce((a, d) => a + d.w, 0); let r = Math.random() * tot; for (const d of DIG_KINDS) { if ((r -= d.w) < 0) return d; } return DIG_KINDS[0]; };
    const items = []; let guard = 0;
    while (items.length < 5 && guard++ < 400) { const x = 40 + Math.random() * 220, y = 50 + Math.random() * 300; if (items.every(o => Math.hypot(o.x - x, o.y - y) > 62)) items.push({ ...pick(), x, y, rot: (Math.random() - .5) * .8, found: false }); }
    return items;
  }
  // v52: Dig & Find closes on Escape, a tap outside, or any scene change (finds are saved as they are found)
  let digT = 0;
  function closeDig() { clearTimeout(digT); const m = $('#dig'); if (m && !m.hidden) { m.hidden = true; const cv = $('#digPad'); cv.onpointerdown = cv.onpointermove = cv.onpointerup = cv.onpointercancel = null; } }
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#dig').hidden) { e.preventDefault(); closeDig(); } });
  $('#dig').addEventListener('click', e => { if (e.target.id === 'dig') closeDig(); });
  function openDig() {
    if (!$('#dig').hidden) return;
    const m = $('#dig'), cv = $('#digPad'), c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const under = document.createElement('canvas'); under.width = W; under.height = H; const u = under.getContext('2d');
    const top = document.createElement('canvas'); top.width = W; top.height = H; const t = top.getContext('2d');
    const finds = () => store.get('pg-finds', {}) || {};
    const showFinds = () => { const f = finds(); $('#digFinds').innerHTML = DIG_KINDS.map(d => `<span class="${f[d.k] ? '' : 'none'}" title="${d.n}">${d.k === 'bluestar' ? '<b class="bstar">★</b>' : d.e}<i>${f[d.k] || 0}</i></span>`).join(''); };
    const seedSand = () => { // sand on top, a little wavy texture
      const g = t.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e6c48a'); g.addColorStop(1, '#d2a86a'); t.globalCompositeOperation = 'source-over'; t.fillStyle = g; t.fillRect(0, 0, W, H);
      for (let i = 0; i < 1600; i++) { t.fillStyle = Math.random() < .5 ? 'rgba(255,240,205,.35)' : 'rgba(140,96,48,.18)'; t.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6); }
      t.strokeStyle = 'rgba(150,104,52,.18)'; t.lineWidth = 2; for (let y = 20; y < H; y += 26) { t.beginPath(); for (let x = 0; x <= W; x += 10) t.lineTo(x, y + Math.sin(x / 22 + y) * 3); t.stroke(); } };
    const drawUnder = () => { // damp darker sand with treasures
      u.fillStyle = '#b58a52'; u.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { u.fillStyle = 'rgba(90,60,30,.2)'; u.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
      digState.items.forEach(o => { u.save(); u.translate(o.x, o.y); u.rotate(o.rot);
        u.fillStyle = 'rgba(60,35,10,.25)'; u.beginPath(); u.ellipse(3, 14, 20, 6, 0, 0, 6.3); u.fill();
        if (o.k === 'bluestar') { u.shadowColor = '#9fd4ff'; u.shadowBlur = 18; u.fillStyle = '#7fc4ff'; u.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 21, a = -Math.PI / 2 + k * Math.PI / 5; u.lineTo(Math.cos(a) * r, Math.sin(a) * r); } u.closePath(); u.fill(); u.shadowBlur = 0; u.fillStyle = 'rgba(255,255,255,.7)'; u.beginPath(); u.arc(-5, -6, 3, 0, 6.3); u.fill(); }
        else { u.font = '38px serif'; u.textAlign = 'center'; u.textBaseline = 'middle'; u.fillText(o.e, 0, 0); }
        u.restore(); }); };
    const render = () => { c.clearRect(0, 0, W, H); c.drawImage(under, 0, 0); c.drawImage(top, 0, 0); };
    const newRound = () => { digState = { items: digRound() }; seedSand(); drawUnder(); render(); $('#digMsg').textContent = 'Brush the sand away… 5 treasures are hiding here.'; };
    const check = () => { // uncovered enough?
      const d = t.getImageData(0, 0, W, H).data; let left = 0;
      digState.items.forEach(o => { if (o.found) return; let n = 0, clear = 0; for (let y = -14; y <= 14; y += 4) for (let x = -14; x <= 14; x += 4) { const px = Math.round(o.x + x), py = Math.round(o.y + y); if (px < 0 || py < 0 || px >= W || py >= H) continue; n++; if (d[(py * W + px) * 4 + 3] < 60) clear++; }
        if (n && clear / n > .55) { o.found = true; const f = finds(); f[o.k] = (f[o.k] || 0) + 1; store.set('pg-finds', f); buzz(18); pgNote(o.k === 'bluestar' ? NOTE.E6 : NOTE.C6, 1.2, 'sine', .14); setTimeout(() => pgNote(o.k === 'bluestar' ? NOTE.A6 : NOTE.G5, 1.4, 'sine', .1), 120);
          $('#digMsg').textContent = (o.k === 'bluestar' ? '💙 ' : '✨ ') + 'Found: ' + o.n + '!'; showFinds();
          t.save(); t.globalCompositeOperation = 'destination-out'; t.beginPath(); t.arc(o.x, o.y, 26, 0, 6.3); t.fill(); t.restore(); render(); }
        if (!o.found) left++; });
      if (!left) $('#digMsg').textContent = 'All 5 found! 🌟 Tap “New round” to dig again.'; };
    let last = null, n = 0;
    const brush = (x, y) => { t.save(); t.globalCompositeOperation = 'destination-out'; const g = t.createRadialGradient(x, y, 2, x, y, 20); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); t.fillStyle = g; t.beginPath(); t.arc(x, y, 20, 0, 6.3); t.fill(); t.restore(); };
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
    cv.onpointerdown = e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = pt(e); brush(...last); render(); };
    cv.onpointermove = e => { if (!last) return; const p = pt(e), dd = Math.hypot(p[0] - last[0], p[1] - last[1]); for (let k = 0; k < dd; k += 5) brush(last[0] + (p[0] - last[0]) * k / dd, last[1] + (p[1] - last[1]) * k / dd); last = p; render(); if (++n % 6 === 0) check(); };
    cv.onpointerup = cv.onpointercancel = () => { last = null; check(); };
    $('#digNew').onclick = newRound;
    $('#digDraw').onclick = () => { closeDig(); toast('Draw in the sandbox: drag to draw, double-tap for a castle. Tap the rake to smooth it.'); };
    $('#digDone').onclick = closeDig;
    if (!digState || digState.items.every(o => o.found)) newRound(); else { seedSand(); drawUnder(); digState.items.filter(o => o.found).forEach(o => { t.save(); t.globalCompositeOperation = 'destination-out'; t.beginPath(); t.arc(o.x, o.y, 26, 0, 6.3); t.fill(); t.restore(); }); render(); }
    showFinds(); m.hidden = false;
  }
  // v47: lift the chalk off the saved slate picture: alpha = how far a pixel is from the slate colour, plus a little grain
  function chalkPreview(cvs, src) { const W = cvs.width, H = cvs.height, t = document.createElement('canvas'); t.width = W; t.height = H; const tx = t.getContext('2d'); tx.drawImage(src, 0, 0, W, H);
    const d = tx.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4) { const dr = p[i] - 47, dg = p[i + 1] - 74, db = p[i + 2] - 58, dist = Math.sqrt(dr * dr + dg * dg + db * db);
      const a = Math.max(0, Math.min(1, (dist - 28) / 90)) * (.7 + Math.random() * .3); p[i + 3] = Math.round(a * 235); }
    const pc = cvs.getContext('2d'); pc.clearRect(0, 0, W, H); pc.putImageData(d, 0, 0); }
  function openChalk(preview) {
    const m = $('#chalk'), c = $('#chalkPad'), x = c.getContext('2d'); let col = '#fdfbf2', last = null;
    x.fillStyle = '#2f4a3a'; x.fillRect(0, 0, c.width, c.height);
    const sv = store.get('pg-chalk', null); if (sv) { const im = new Image(); im.onload = () => x.drawImage(im, 0, 0, c.width, c.height); im.src = sv; }
    $('#chalkCols').querySelectorAll('button').forEach(b => { b.onclick = () => { col = b.dataset.c; $('#chalkCols').querySelectorAll('button').forEach(o => o.classList.toggle('on', o === b)); }; });
    const pt = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * c.width, (e.clientY - r.top) / r.height * c.height]; };
    c.onpointerdown = e => { e.preventDefault(); c.setPointerCapture(e.pointerId); last = pt(e); };
    c.onpointermove = e => { if (!last) return; const p = pt(e); x.lineCap = 'round'; x.strokeStyle = col; x.globalAlpha = col === 'erase' ? 1 : .85; if (col === 'erase') x.strokeStyle = '#2f4a3a';
      if (col === 'erase') { x.lineWidth = 22; x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke(); }
      else { x.globalAlpha = .62; x.lineWidth = 4.2 + Math.random(); x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke(); // v47: soft core + chalk grain
        const d = Math.hypot(p[0] - last[0], p[1] - last[1]), n = Math.ceil(d * 2.2); x.fillStyle = col;
        for (let i = 0; i < n; i++) { const t = Math.random(), r = (Math.random() - .5) * 7.5, q = (Math.random() - .5) * 7.5; x.globalAlpha = .25 + Math.random() * .5; x.fillRect(last[0] + (p[0] - last[0]) * t + r, last[1] + (p[1] - last[1]) * t + q, 1 + Math.random() * 1.2, 1 + Math.random() * 1.2); } }
      x.globalAlpha = 1; last = p; };
    c.onpointerup = c.onpointercancel = () => { last = null; };
    const done = () => { m.hidden = true; let url; try { url = c.toDataURL('image/jpeg', .7); store.set('pg-chalk', url); } catch (e) {}
      chalkPreview(preview, c); };
    $('#chalkDone').onclick = done; $('#chalkClear').onclick = () => { x.fillStyle = '#2f4a3a'; x.fillRect(0, 0, c.width, c.height); };
    m.onclick = e => { if (e.target === m) done(); };
    m.hidden = false;
  }
  function playTools() { // v26: send Olithia out to play, or back home
    const box = $('#playTools'); box.querySelectorAll('.pg-join').forEach(e => e.remove());
    const here = locate(CFG.player).scene === curId, j = document.createElement('button'); j.type = 'button'; j.className = 'pill pg-join';
    j.textContent = here ? 'Head home' : 'Join in'; j.onclick = ev => { ev.stopPropagation(); setOli(here ? CFG.player : curId, 'idle'); };
    box.appendChild(j);
  }
  function buildPlayFresh() { $('#actors').querySelectorAll('.block,.ball,.swing,.pboard,.pg-ss,.pg-ss-contact,.pg-swshadow,.pg-slide,.pg-sand,.pg-chalk,.pg-chest,.pg-bubble,.pg-rake,.pg-stone,.pg-grain,.pg-key,.pg-chimes,.pg-kite,.pg-string').forEach(e => e.remove()); buildPlay(); }

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
  // v32: reactions under each bulletin note (saved locally; board.json reactions.olithia = recorded, shared across devices)
  const REACT = [['yes', '👍 Yes'], ['no', '👎 No'], ['love', '❤️']], ASKR = [['do', 'Yes, do it'], ['notnow', 'Not now']];
  const RLAB = { yes: '👍 yes', no: '👎 no', love: '❤️', do: 'yes, do it', notnow: 'not now' };
  const noteId = n => n.id ? String(n.id) : 'n' + [...String(n.from || '') + '|' + n.text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7).toString(36);
  function noteReactions(d, n) {
    const id = noteId(n), ask = n.ask === true || (n.ask !== false && String(n.text).includes('?'));
    const rec = n.reactions && n.reactions[CFG.player], f = String(n.from || '').toLowerCase(), who = isBot(f) ? botName(f) : (n.from || 'the board');
    const bar = document.createElement('div'); bar.className = 'reacts'; d.appendChild(bar);
    if (ask) d.classList.add('ask');
    const draw = () => { const mine = store.get('react-' + id, null) || rec; bar.innerHTML = '';
      (ask ? ASKR.concat(REACT) : REACT).forEach(([k, lab]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = lab; b.className = (ask && (k === 'do' || k === 'notnow') ? 'big ' : '') + (mine === k ? 'on' : '');
        b.onclick = async ev => { ev.stopPropagation(); store.set('react-' + id, k); store.set('reactsent-' + id, null); draw();
          if (relayOn() && isBot(f) && await BotTownChat.post(f, `Board reply: ${RLAB[k]} — "${n.text}"`)) { store.set('reactsent-' + id, k); toast(`Sent to ${who} ✓`); draw(); } }; bar.appendChild(b); });
      if (rec) { const r = document.createElement('small'); r.className = 'rec'; r.textContent = 'Recorded: ' + RLAB[rec]; bar.appendChild(r); }
      const local = store.get('react-' + id, null);
      if (local && local !== rec && store.get('reactsent-' + id, null) === local) { const s = document.createElement('small'); s.className = 'rec'; s.textContent = 'Sent to ' + who + ' ✓'; bar.appendChild(s); }
      else if (local && local !== rec) { const c = document.createElement('button'); c.type = 'button'; c.className = 'copy'; c.textContent = 'Copy reply';
        const txt = `Board reply to ${who}: ${RLAB[local]} — "${n.text}"`;
        c.onclick = async ev => { ev.stopPropagation(); toast((await copyText(txt)) ? 'Copied! Paste it in chat.' : txt); }; bar.appendChild(c); } };
    draw();
  }
  // bulletin board in the playground
  function openNotes() {
    const list = $('#notesList'); list.innerHTML = '';
    if (!boardNotes.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No notes pinned yet.'; list.appendChild(p); }
    boardNotes.forEach((n, i) => { const d = document.createElement('div'); d.className = 'note'; d.style.transform = `rotate(${[-1.5, 1.2, -.8, 1.6][i % 4]}deg)`; const f = String(n.from || '').toLowerCase();
      d.innerHTML = `<p></p><small>${esc(isBot(f) ? botName(f) : (n.from || ''))}${n.date ? ' · ' + esc(n.date) : ''}</small>`; d.querySelector('p').textContent = n.text; list.appendChild(d); noteReactions(d, n); });
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
  $('#critBtn').onclick = ev => { ev.stopPropagation(); openCritters(); }; $('#critDone').onclick = () => { $('#critters').hidden = true; }; $('#critters').onclick = e => { if (e.target.id === 'critters') $('#critters').hidden = true; };
  window.__bt = { openPoems, enter, go, cam, applyCam, where, locate, setOli, dayPlan, dayKey, push: (a, t) => pgPush(a, document.querySelector('#actors .swing-rider[data-toy=' + t + ']')) }; // handy for testing // handy for testing
})();
