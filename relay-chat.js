/* Bot Town chat panel (v51: from pi-relay/chat.js, restyled; relay + key come from config.js). Usage:
   <script src="chat.js"></script>
   <script>BotTownChat.init({relay:"https://relay.example.com", key:"<visitor_key from config.json>", onFallback:(bot,text)=>openLetterForm(bot,text)})</script>
   BotTownChat.open("gorbo") opens the panel for a bot. */
(function () {
  const BOTS = ["gorbo", "loria", "scout"], POLL_MS = 5000;
  let cfg = {}, panel, cur = null, timer = null, online = true;
  const since = {}, logs = {};
  const name = () => localStorage.getItem("btName") || cfg.name || "visitor";

  function el(t, css, txt) { const e = document.createElement(t); if (css) e.style.cssText = css; if (txt) e.textContent = txt; return e; }

  function build() {
    panel = el("div", "position:fixed;right:12px;left:auto;bottom:calc(env(safe-area-inset-bottom) + 12px);width:min(330px,calc(100vw - 24px));max-height:60vh;display:none;flex-direction:column;background:linear-gradient(#f9eed6,#f1dcb3);border:2.5px solid #c9965f;border-radius:14px;box-shadow:0 4px 14px #0004;font:15px Fredoka,system-ui,sans-serif;color:#4a2f18;z-index:60");
    const head = el("div", "padding:7px 10px;background:#8a5a33;color:#fff8e8;display:flex;justify-content:space-between;align-items:center;border-radius:11px 11px 0 0;font-weight:600");
    panel.title_ = el("span"); const x = el("button", "background:none;border:0;color:#fff8e8;font-size:20px;line-height:1;cursor:pointer", "×"); x.setAttribute("aria-label", "Close chat"); x.onclick = close;
    head.append(panel.title_, x);
    panel.status = el("div", "font-size:11px;padding:2px 6px;color:#a00");
    panel.log = el("div", "flex:1;overflow:auto;padding:6px;min-height:120px");
    const f = el("form", "display:flex;gap:4px;padding:6px");
    panel.input = el("input", "flex:1;min-width:0;font:inherit;padding:6px 8px;border:2px solid #c9965f;border-radius:10px;background:#fffdf6"); panel.input.maxLength = 1000; panel.input.placeholder = "Say something…";
    f.append(panel.input, el("button", "font:inherit;border:2px solid #8a5a33;background:#f2c14e;border-radius:10px;padding:4px 12px", "Send"));
    f.onsubmit = e => { e.preventDefault(); send(panel.input.value); };
    panel.append(head, panel.status, panel.log, f);
    document.body.appendChild(panel);
  }

  function render() {
    panel.log.textContent = "";
    for (const m of logs[cur] || []) {
      const d = el("div", "margin:3px 0;" + (m.direction === "out" ? "background:#fffaf0;border-radius:10px 10px 10px 2px;padding:5px 8px;margin-right:30px" : "background:#e9d3a8;border-radius:10px 10px 2px 10px;padding:5px 8px;margin-left:30px;text-align:right"));
      d.textContent = (m.direction === "out" ? cur : m.from) + ": " + m.text;
      panel.log.appendChild(d);
    }
    panel.log.scrollTop = 1e9;
    panel.status.textContent = online ? "" : "Relay unreachable — messages will be sent as letters.";
  }

  async function poll() {
    if (!cur) return;
    try {
      const r = await fetch(`${cfg.relay}/messages?bot=${cur}&since=${since[cur] || 0}`, { headers: { "X-BotTown-Key": cfg.key || "" } });
      if (!r.ok) throw r.status;
      const d = await r.json();
      for (const m of d.messages) { (logs[cur] ||= []).push(m); since[cur] = m.ts; }
      online = true;
    } catch (e) { online = false; }
    render();
  }

  async function send(text) {
    text = (text || "").trim(); if (!text || !cur) return;
    panel.input.value = "";
    try {
      if (!online) throw "offline";
      const r = await fetch(cfg.relay + "/messages", { method: "POST", headers: { "Content-Type": "application/json", "X-BotTown-Key": cfg.key || "" },
        body: JSON.stringify({ to: cur, from: name(), text }) });
      if (r.status === 429) { panel.status.textContent = "Slow down a little!"; return; }
      if (!r.ok) throw r.status;
      poll();
    } catch (e) {
      online = false; render();
      if (cfg.onFallback) cfg.onFallback(cur, text); // hand off to existing letter system
    }
  }

  function open(bot) {
    if (!BOTS.includes(bot)) return;
    if (!panel) build();
    cur = bot; panel.title_.textContent = "Chat with " + bot[0].toUpperCase() + bot.slice(1);
    panel.style.display = "flex"; render(); poll();
    clearInterval(timer); timer = setInterval(poll, POLL_MS);
  }
  function close() { if (!panel) return; panel.style.display = "none"; cur = null; clearInterval(timer); }

  // v51 (Bot Town): send one message without opening the panel (bulletin-board reactions); resolves true when the relay took it
  async function post(bot, text) { if (!cfg.relay || !BOTS.includes(bot)) return false;
    try { const r = await fetch(cfg.relay + "/messages", { method: "POST", headers: { "Content-Type": "application/json", "X-BotTown-Key": cfg.key || "" }, body: JSON.stringify({ to: bot, from: name(), text }) }); return r.ok; } catch (e) { return false; } }
  window.BotTownChat = { init(c) { cfg = c; }, open, close, post, get enabled() { return !!cfg.relay; } };
})();
