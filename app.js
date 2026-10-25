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
    mail: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')
  };
  $('#back').innerHTML = IC.back; $('#musicBtn').innerHTML = IC.music; $('#mapMusic').innerHTML = IC.music; $('#camBtn').innerHTML = IC.cam; $('#mailBtn').innerHTML = IC.mail;
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
  const poseMemory = {};
  let live = null; // fresh Gorbo status; null when status.json is missing or older than 6 hours
  let letters = [];
  const stage = $('#stage'), vp = $('#viewport');
  let W = 0, H = 0, cam = { x: 0, y: 0, s: 1 };
  const tasksDone = id => store.get('tasks-' + id, []);
  const isBusy = id => { const o = store.get('busy-' + id, null); return o !== null ? o : (C[id].tasks || []).some((_, i) => !tasksDone(id)[i]); };

  // Bedrooms show their sleeping image at night, or when the owner is set to sleep
  // (localStorage bt-asleep-<id> = true/false overrides the clock; ?sleep=1 / ?sleep=0 to test).
  const sleepParam = new URLSearchParams(location.search).get('sleep');
  function isAsleep(id) {
    if (sleepParam !== null) return sleepParam === '1';
    const o = store.get('asleep-' + id, null); if (o !== null) return !!o;
    return inHours(CFG.sleepHours || [22, 7]);
  }
  function inHours([from, to]) {
    const h = new Date().getHours();
    return from > to ? (h >= from || h < to) : (h >= from && h < to);
  }
  // ?night=1 / ?night=0 forces the park's night image for testing
  const nightParam = new URLSearchParams(location.search).get('night');
  const isNight = () => nightParam !== null ? nightParam === '1' : inHours(cur.room.nightHours || [19, 6]);
  function roomURL() {
    if (cur.room.poses) return (visiting && cur.room.visit) || cur.room.poses[pose] || cur.room.poses.idle;
    if (cur.room.sleeping && isAsleep(cur.returnTo || curId)) return cur.room.sleeping;
    if (cur.room.night && isNight()) return cur.room.night;
    return cur.room.image;
  }
  function applyBackdrop() {
    const url = roomURL();
    const night = !!((cur.room.sleeping && url === cur.room.sleeping) || (cur.room.night && url === cur.room.night));
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
    curId = id; cur = C[id]; visiting = false;
    pose = cur.room.poses ? (poseMemory[id] || 'idle') : 'idle';
    if (id === 'gorbo' && live && live.pose) pose = live.pose;
    $('#house').style.opacity = '';
    showRoom(applyBackdrop(), false);
    $('#roomImg').alt = cur.house; $('#roomFade').alt = '';
    $('#houseName').textContent = cur.house; $('#houseRole').textContent = `${cur.name} · ${cur.role}`;
    $('#chat').hidden = true; $('#log').innerHTML = ''; hideBubble();
    const painted = !!cur.room.poses, gallery = !!cur.gallery;
    $('#house').classList.toggle('has-poses', painted);
    $('#house').classList.toggle('gallery', gallery);
    $('#poses').hidden = !painted;
    $('#tbBusy').hidden = painted || gallery;
    $('#tbVisit').hidden = painted || gallery;
    $('#tbVisit').disabled = id === CFG.player || !cur.room.visitor;
    $('#tasks').hidden = gallery || !cur.tasks;
    $('#statusChip').hidden = gallery;
    $('#tasks').classList.add('collapsed');
    $('#back').setAttribute('aria-label', cur.returnTo ? ('Back to ' + C[cur.returnTo].house) : 'Back to map');
    $('#map').classList.remove('active'); $('#house').classList.add('active');
    layout(); buildActors(); resetCam(false); buildLinks();
    if (cur.tasks) renderTasks();
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
    if (cur.gallery) return;
    if (cur.room.poses) {
      const done = tasksDone(curId), next = (cur.tasks || []).find((_, i) => !done[i]);
      const line = pose === 'working'
        ? ['Working on', next || 'Tidying up']
        : pose === 'sitting'
          ? ['Sitting', next ? 'Taking a cozy break' : 'All tasks done! Tea time']
          : ['Relaxing', next ? 'A quiet idle moment' : 'All tasks done! Tea time'];
      if (visiting && cur.room.visit) { line[0] = 'Sitting together'; line[1] = `Tea with ${C[CFG.player].name}`; }
      $('#statusChip').innerHTML = `<b>${line[0]}</b>${line[1]}`;
      $('#poses').querySelectorAll('button').forEach(b => {
        const on = b.dataset.pose === pose;
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
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
  $('#poses').onclick = e => {
    const btn = e.target.closest('button'); if (!btn || !cur || !cur.room.poses) return;
    const next = btn.dataset.pose; if (!next || next === pose) return;
    pose = next; poseMemory[curId] = next; visiting = false;
    showRoom(cur.room.poses[next], true);
    updateMode(true);
  };
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
    const bed = cur.room.bedroom;
    if (bed) addZone(bed.door, bed.label, () => travel(bed.to, { door: true }), 'Bedroom');
    (cur.room.spots || []).forEach(s => { const el = addZone(s.zone, s.label, () => showBubble(el, s.label, s.caption)); el.classList.remove('glow'); }); // invisible until tapped
    if (cur.room.visit && cur.room.seat && curId !== CFG.player) addZone(cur.room.seat, `Sit with ${cur.name}`, toggleSeat, 'Sit together');
  }
  // Painted houses: Olithia sits with the host (the -visit image); tap again to go back to the host's pose.
  function toggleSeat() {
    visiting = !visiting;
    showRoom(roomURL(), true);
    updateMode(true);
  }
  function buildLinks() {
    buildDoors();
    const links = cur.room.links || [], btn = $('#linkBtn'); btn.hidden = !links.length;
    links.forEach((l, i) => {
      if (i === 0) { btn.innerHTML = (IC[l.icon] || '') + `<span>${l.label}</span>`; btn.onclick = () => travel(l.to, { replace: true, door: true }); }
      const el = document.createElement('div');
      if (l.zone) { el.className = 'link zone glow'; Object.assign(el.style, { left: l.zone.left + '%', top: l.zone.top + '%', width: l.zone.width + '%', height: l.zone.height + '%' }); }
      else if (l.badge) { el.className = 'link badge'; Object.assign(el.style, { left: l.badge.x + '%', top: l.badge.y + '%' }); el.innerHTML = IC.ladder; }
      else return;
      el.setAttribute('role', 'button'); el.setAttribute('aria-label', l.label);
      el.onclick = ev => { ev.stopPropagation(); travel(l.to, { replace: true, door: true }); };
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
    if (actors.main) poke(actors.main); $('#chathead').textContent = cur.name;
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
    const tips = CFG.loadingTips || [];
    const urls = ['assets/map-v2.webp', ...Object.values(C).flatMap(c => [c.sprite, c.mapImage, c.room && c.room.image, c.room && c.room.sleeping, c.room && c.room.night, c.room && c.room.visit, ...Object.values(c.room.poses || {}), ...(c.pets || []).filter(p => p.sprite).map(p => p.sprite)])].filter(Boolean);
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
      const park = curId === 'starfall';
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

  // ---------- Gorbo's live status and the town post ----------
  const LIVE_PLACES = ['gorbo', 'olithia', 'loria', 'scout', 'starfall'];
  const LIVE_POSES = ['working', 'idle', 'sitting'];
  const LIVE_MAX = 6 * 60 * 60 * 1000;
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
  function readIds() { const ids = store.get('read-letters', []); return Array.isArray(ids) ? ids : []; }
  function applyLive() {
    const chip = $('#liveChip');
    if (live && live.note) { chip.hidden = false; chip.textContent = 'Gorbo: ' + live.note; }
    else chip.hidden = true;
    const pin = $('#gorboHere');
    const spot = live && live.place && C[live.place] && C[live.place].hotspot;
    if (spot) {
      const h = C[live.place].hotspot;
      pin.hidden = false;
      pin.style.left = (h.left + h.width / 2) + '%';
      pin.style.top = (h.top + h.height / 2) + '%';
    } else pin.hidden = true;
    if (live && live.pose) {
      poseMemory.gorbo = live.pose;
      if (curId === 'gorbo' && cur && cur.room.poses && pose !== live.pose) {
        pose = live.pose;
        if (!visiting) { showRoom(roomURL(), true); updateMode(true); }
      }
    }
  }
  async function pullStatus() {
    try {
      const res = await fetch('status.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('status');
      const data = await res.json();
      const t = Date.parse(data && data.updated);
      const g = data && data.gorbo;
      if (!Number.isFinite(t) || Date.now() - t > LIVE_MAX || !g) live = null;
      else live = {
        place: LIVE_PLACES.includes(g.place) ? g.place : null,
        pose: LIVE_POSES.includes(g.pose) ? g.pose : null,
        note: typeof g.note === 'string' ? g.note.trim() : ''
      };
    } catch (e) { live = null; }
    applyLive();
  }
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
    rows.forEach(l => {
      const b = document.createElement('button'); b.type = 'button';
      const small = document.createElement('small'); small.textContent = (l.from || 'Gorbo') + (l.date ? ' · ' + l.date : '');
      b.append(document.createTextNode(l.title || 'A letter'), small);
      b.onclick = () => openLetter(l);
      list.appendChild(b);
    });
    paintMailDot();
  }
  function openLetter(l) {
    const seen = readIds(); if (!seen.includes(l.id)) store.set('read-letters', seen.concat(l.id));
    $('#mailTitle').textContent = l.title || 'A letter';
    $('#mailMeta').textContent = (l.from || 'Gorbo') + (l.date ? ' · ' + l.date : '');
    fillText($('#mailBody'), l.body || '');
    showMail('read'); paintMailDot();
  }
  async function pullLetters() {
    try {
      const res = await fetch('letters.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('letters');
      const data = await res.json();
      letters = Array.isArray(data) ? data : [];
    } catch (e) { letters = letters.length ? letters : []; }
    renderLetters();
  }
  function pullLive() { pullStatus(); pullLetters(); }
  $('#mailBtn').onclick = () => { $('#mail').hidden = false; showMail('home'); renderLetters(); $('#mailSent').hidden = true; };
  $('#mailClose').onclick = () => { $('#mail').hidden = true; };
  $('#mail').onclick = e => { if (e.target === $('#mail')) $('#mail').hidden = true; };
  $('#mailCompose').onclick = () => { showMail('write'); $('#mailSent').hidden = true; };
  $('#mailBack').onclick = () => showMail('home');
  $('#mailWriteBack').onclick = () => showMail('home');
  $('#mailText').addEventListener('input', () => { $('#mailSend').disabled = !$('#mailText').value.trim(); });
  $('#mailSend').disabled = true;
  $('#mailSend').onclick = async () => {
    const text = $('#mailText').value.trim(); if (!text) return;
    const payload = 'Letter to Gorbo:\n' + text;
    const sent = $('#mailSent');
    if (navigator.share) {
      try { await navigator.share({ text: payload }); sent.hidden = false; sent.textContent = 'Passed to the share sheet. Paste it into your Gorbo chat if it is still waiting there.'; return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(payload);
      sent.hidden = false; sent.textContent = 'Copied. Paste it into your Gorbo chat. It begins with “Letter to Gorbo:”.';
    } catch (e) {
      sent.hidden = false; sent.textContent = 'Copy this into your Gorbo chat:\n' + payload;
    }
  };

  // ---------- day/night tint ----------
  function tint() {
    const q = new URLSearchParams(location.search).get('hour'), h = q !== null ? +q : new Date().getHours() + new Date().getMinutes() / 60; let bg = 'transparent';
    if (h < 5 || h >= 21) bg = 'rgba(60,70,150,.45)'; else if (h < 7) bg = 'rgba(255,170,150,.25)'; else if (h >= 19.5) bg = 'rgba(120,90,170,.35)'; else if (h >= 18) bg = 'rgba(255,140,80,.22)';
    $('#tint').style.background = bg;
  }
  tint(); setInterval(tint, 60000);
  setInterval(() => { if (cur && (cur.room.sleeping || cur.room.night)) showRoom(applyBackdrop(), true); }, 60000); // crossfade at bedtime / wake-up
  pullLive(); setInterval(pullLive, 60000);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  window.__bt = { enter, go, cam, applyCam }; // handy for testing
})();
