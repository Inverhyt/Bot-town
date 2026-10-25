// Gentle generated ambient loops (Web Audio API) — no downloaded music.
window.BotMusic = (() => {
  let ctx, master, timer, nextTime = 0, step = 0, current = null, rain;
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
  }
  function tone(f, t, dur, { type = 'sine', vol = .1, atk = .02, rel = .6 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(.0001, t + atk + dur + rel);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + atk + dur + rel + .05);
  }
  function noiseBuf() { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; } return b; }
  function hat(t) { const s = ctx.createBufferSource(); s.buffer = noiseBuf(); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = ctx.createGain(); g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + .1); }
  function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .15); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .35); }
  function schedule() {
    const tr = TRACKS[current], beat = 60 / tr.bpm;
    while (nextTime < ctx.currentTime + .4) {
      const t = nextTime, bar = Math.floor(step / 8) % 4, chord = PROG[bar], e = step % 8; // 8 eighth-notes per bar
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
  function startRain() { const s = ctx.createBufferSource(); s.buffer = noiseBuf(); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = .4; const g = ctx.createGain(); g.gain.value = .12; s.connect(f); f.connect(g); g.connect(master); s.start(); rain = s; }
  function play(id) {
    stop(); if (!id || !TRACKS[id]) return;
    init(); ctx.resume(); current = id; step = 0; nextTime = ctx.currentTime + .1;
    if (id === 'rain') startRain();
    schedule(); timer = setInterval(schedule, 100);
  }
  function stop() { clearInterval(timer); timer = null; if (rain) { try { rain.stop(); } catch (e) {} rain = null; } current = null; }
  let air = null;
  function setAir(on) {
    try {
      if (!on) {
        if (!air) return false;
        const a = air; air = null;
        a.g.gain.cancelScheduledValues(ctx.currentTime);
        a.g.gain.linearRampToValueAtTime(.0001, ctx.currentTime + .35);
        setTimeout(() => { try { a.src.stop(); a.oscs.forEach(o => o.stop()); } catch (e) {} }, 400);
        return false;
      }
      init(); ctx.resume();
      if (air) return true;
      const g = ctx.createGain(); g.gain.value = .0001; g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + .9); g.connect(master);
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
      const ng = ctx.createGain(); ng.gain.value = .04;
      src.connect(f); f.connect(ng); ng.connect(g); src.start();
      const oscs = [];
      [[174.6, .018, .06], [220, .014, .045], [261.6, .009, .035]].forEach(([freq, vol, rate]) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
        const og = ctx.createGain(); og.gain.value = vol;
        const lfo = ctx.createOscillator(); lfo.frequency.value = rate;
        const lg = ctx.createGain(); lg.gain.value = 2;
        lfo.connect(lg); lg.connect(o.detune);
        o.connect(og); og.connect(g); o.start(); lfo.start();
        oscs.push(o, lfo);
      });
      air = { g, src, oscs };
      return true;
    } catch (e) { return false; }
  }
  return { TRACKS, play, stop, setAir, get current() { return current; }, get air() { return !!air; } };
})();
