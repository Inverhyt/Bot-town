// Gentle generated ambient loops (Web Audio API) — no downloaded music.
window.BotMusic = (() => {
  let ctx, master, vbus, noise, timer, nextTime = 0, step = 0, current = null, rain;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]; // Fmaj7 Em7 Dm7 Cmaj7
  const TRACKS = {
    hearth: { name: "Hearth Glow", bpm: 64 },
    rain: { name: "Rainy Window", bpm: 76 },
    musicbox: { name: "Music Box", bpm: 92 }
  };
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    master = ctx.createGain(); master.gain.value = 0.22; master.connect(lp); lp.connect(ctx.destination);
    // Force a true stereo bus so mono sources are always centred (never left-only on WebKit/iOS).
    [master, lp].forEach(n => { n.channelCount = 2; n.channelCountMode = 'explicit'; n.channelInterpretation = 'speakers'; });
    noise = noiseBuf();
    // Soft violin bus: gentle generated stereo hall reverb.
    vbus = ctx.createGain(); vbus.gain.value = 1; vbus.connect(master);
    const rv = ctx.createConvolver(), len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    rv.buffer = ir; const wet = ctx.createGain(); wet.gain.value = .35; vbus.connect(rv); rv.connect(wet); wet.connect(master);
  }
  // Bowed string: two detuned saws, warm low-pass, delayed vibrato, slow attack.
  function violin(f, t, dur, vol = .035) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(), body = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = .5;
    body.type = 'peaking'; body.frequency.value = 3000; body.gain.value = -6; body.Q.value = 1;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .004, t + .6);
    lfo.connect(lg);
    const end = t + dur + 1.2;
    [-4, 4].forEach(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; lg.connect(o.frequency); o.connect(lp); o.start(t); o.stop(end); });
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .45); g.gain.setValueAtTime(vol, t + dur); g.gain.linearRampToValueAtTime(0, end);
    lp.connect(body); body.connect(g); g.connect(vbus); lfo.start(t); lfo.stop(end);
  }
  // 8-bar melody (C major, fits Fmaj7-Em7-Dm7-Cmaj7); [eighth, midi, length in beats]
  const VIOLIN = [[[0, 72, 3], [6, 69, 1]], [[0, 71, 3], [6, 67, 1]], [[0, 69, 2], [4, 65, 2]], [[0, 67, 3.5]],
                  [[0, 69, 2], [4, 72, 2]], [[0, 74, 3], [6, 71, 1]], [[0, 72, 2], [4, 69, 2]], [[0, 64, 3.5]]];
  function tone(f, t, dur, { type = 'sine', vol = .1, atk = .02, rel = .6 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(.0001, t + atk + dur + rel);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + atk + dur + rel + .05);
  }
  function noiseBuf() { const b = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let last = 0; for (let i = 0; i < d.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; } } return b; }
  function hat(t) { const s = ctx.createBufferSource(); s.buffer = noise; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = ctx.createGain(); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + .1); }
  function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .15); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .35); }
  function schedule() {
    const tr = TRACKS[current], beat = 60 / tr.bpm;
    while (nextTime < ctx.currentTime + .4) {
      const t = nextTime, bar = Math.floor(step / 8) % 4, chord = PROG[bar], e = step % 8; // 8 eighth-notes per bar
      const vb = VIOLIN[Math.floor(step / 8) % 8], vv = { hearth: .035, rain: .026, musicbox: .02 }[current];
      vb.forEach(([at, m, len]) => { if (at === e) violin(hz(m), t, beat * len, vv); });
      if (current === 'hearth') {
        if (e === 0) chord.forEach((m, i) => { tone(hz(m), t, beat * 3, { type: i % 2 ? 'triangle' : 'sine', vol: .07, atk: 1, rel: 2 }); });
        if (e === 0) tone(hz(chord[0] - 12), t, beat * 3, { vol: .09, atk: .6, rel: 1.5 });
        if (e === 4 || e === 6) tone(hz(chord[(step / 2) % 4 | 0] + 12), t, .2, { vol: .025, atk: .05, rel: 1.2 });
      } else if (current === 'rain') {
        if (e === 0 || e === 3) chord.forEach(m => tone(hz(m), t, .15, { type: 'triangle', vol: .05, atk: .01, rel: .9 }));
        if (e === 0) tone(hz(chord[0] - 12), t, beat * 1.5, { vol: .1, rel: .4 });
        if (e === 0 || e === 4) kick(t);
        if (e % 2 === 1) hat(t);
      } else {
        const notes = [...chord, chord[2] + 12, chord[1] + 12, chord[0] + 12, chord[3]];
        tone(hz(notes[e] + 12), t, .05, { vol: .045, atk: .005, rel: .8 });
        tone(hz(notes[e] + 24), t, .02, { vol: .012, atk: .005, rel: .4 });
        if (e === 0) tone(hz(chord[0] - 12), t, beat * 3, { vol: .06, atk: .3, rel: 1 });
      }
      nextTime += beat / 2; step++;
    }
  }
  function startRain() { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = .4; const g = ctx.createGain(); g.gain.value = .12; s.connect(f); f.connect(g); g.connect(master); s.start(); rain = s; }
  function play(id) {
    stop(); if (!id || !TRACKS[id]) return;
    init(); ctx.resume(); current = id; step = 0; nextTime = ctx.currentTime + .1;
    if (id === 'rain') startRain();
    schedule(); timer = setInterval(schedule, 100);
  }
  function stop() { clearInterval(timer); timer = null; if (rain) { try { rain.stop(); } catch (e) {} rain = null; } current = null; }
  return { TRACKS, play, stop, get current() { return current; } };
})();
