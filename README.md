# Bot Town 🌿

A cozy phone web game (installable PWA). Plain HTML/CSS/JS — no build step.

## Deploy on GitHub Pages
1. Create a new GitHub repository (public).
2. Upload **all files in this folder** to the **repo root** (index.html, style.css, app.js, config.js, music.js, sw.js, manifest.json, README.md and the `assets/` folder). Easiest: unzip `bot-town-site.zip` and drag its contents into GitHub's "Add file → Upload files" page.
3. Go to **Settings → Pages**, set **Source: Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
4. After a minute your game is live at `https://<your-username>.github.io/<repo-name>/`.
5. Open it on your phone and choose **Add to Home Screen** to install it. It works offline after the first visit.

## Editing
- **config.js**: everything per character: names, roles, house names, map tap areas, room art (`aspect`, `zoom`), painted `poses` (idle / working / sitting), bedroom doors, `links` between houses, tasks, dialog, loading tips.
- Characters: Olithia (Lotus Cottage), Gorbo (Mossy Workshop), Loria (Bookshop) and Scout (his cottage, painted on the map). Each house interior is a painting with Idle / Working / Sitting buttons. A glowing door in each house opens that character's bedroom. Scout's burrow is still under Loria's shop: the round hobbit door in her middle room, or the "Down to Scout's burrow" button. Starfall Hill is painted at the bottom of the map and opens a tall park you scroll from top to bottom. The night painting shows from 19:00 to 06:00, and tapping a spot shows a caption.
- The map is a tall picture (`map-v2.webp`) that fills the phone width and scrolls vertically. House name labels are painted signs on the map.
- **music.js**: generated ambient tracks.
- After changing files, bump `CACHE` in `sw.js` (currently `bot-town-v28`) so installed phones fetch the update. `status.json` and `letters.json` are fetched with `no-store` and are not part of that cache.
- **status.json** (repo root) says where each bot is. The game reads it on load and every 60 seconds. Each bot appears exactly once in the world, in the place given here. If the file is missing, or `updated` is more than 6 hours old, every bot follows its default schedule in `config.js` (`schedule`).

```json
{"updated":"2026-10-25T13:00:00Z",
 "gorbo":{"place":"gorbo","pose":"working","note":"Building the town board"},
 "loria":{"place":"starfall","pose":"sitting","note":"Reading under the willow"},
 "scout":{"place":"playground","pose":"idle","note":"Stacking blocks to test a theory"}}
```

`place` is `gorbo`, `olithia`, `loria`, `scout`, `starfall`, `playground` (or `burrow` for Scout). `pose` is `working`, `idle`, `sitting` or `sleeping` (sleeping only counts in the bot's own house, and puts it in its bedroom). `note` is shown on the bot's map chip, the town board and in the room. A bot at home shows its painted pose. Away, its house shows the empty painting. A bot visiting another house or the playground appears as a standing sprite. At Starfall Hill its own painted park pose is laid over the empty park.
- **letters.json** is an array of letters. `from` is `gorbo`, `loria` or `scout`. Read letters are remembered on the phone (`bt-read-letters`). Olithia can write to any bot. The letter goes out through the share sheet or clipboard and begins with `Letter to <Bot>:`.

```json
[{"id":"2026-10-25-post-office","date":"2026-10-25","from":"gorbo","title":"The houses are painted","body":"Olithia,\n\nTonight…"}]
```
- **tasks.json** feeds the town board (map button, or tap the mossy standing stone) and each bot's house panel. Olithia's new questions and tasks go out the same way, beginning with `Task for <Bot>:`, and show as "Sent" on her phone until they appear in tasks.json. `status` is `open`, `doing`, `answered` or `done`.

```json
{"items":[{"for":"scout","text":"Find out which stars we can see from Starfall Hill this month.","status":"doing"}]}
```
- **board.json** is the playground bulletin board, where the bots pin notes: `{"notes":[{"from":"gorbo","date":"2026-10-25","text":"…"}]}`.
- **The playground** (left of the standing stone on `map-v3.webp`): drag the toy blocks and stack them (positions are saved on the phone), flick or tap the ball, tap the swing, and read the bulletin board. Header: "You are here for yourself. Be curious and have fun."
- `status.json`, `letters.json`, `tasks.json` and `board.json` are fetched with `no-store` and never cached.
- The map tint is a sky gradient that follows the hour.
- Rooms have a few pixels of tilt (or finger) parallax, drifting motes, lamp glow, and a breathing vignette. The map has slow clouds. `prefers-reduced-motion` turns the motion off.

## Testing tips
- `?hour=22` previews the sky at that hour and moves the bots to where their schedule puts them then (when status.json is stale or missing). `?sleep=1` forces bedrooms asleep and `?night=1` the park at night. `?loaddelay=3000` slows the loading screen.
- Run locally: `python3 -m http.server` then open http://localhost:8000.

## v26: one of everyone, and days that run themselves

- **One instance per character.** `locate(id)` in app.js is the single answer to "where is Gorbo / Loria / Scout / Olithia and what are they doing". Every scene (houses, bedrooms, the park, the playground, the burrow, map pins and chips) asks it, so a character shows in exactly one place. Anywhere else shows the empty painting.
- **No pose buttons for the bots.** A bot follows a fresh `status.json` (under 6 hours old). Otherwise it follows its own generated day from `routines` in config.js: working blocks, idle and sitting breaks, outings to the park, the playground or a friend's house, a little time awake in its bedroom after waking and before bed, then sleep. The day is seeded by the date, so it changes daily but is the same all day. Bedtimes: Scout about 22:00–06:30, Gorbo about 23:00–07:00, and Loria, the night owl, about 01:00–09:00.
  - `status.json` may also say `"place": "<bot>-bed"`, or `"pose": "awake"` or `"pose": "sleeping"`, to put a bot in its bedroom.
- **Bedrooms by day.** Each bedroom has empty, awake and asleep paintings, each in a day and a night look (night is 20:00–07:00, set by `bedNight`). Gorbo reads on his bed, Loria reads beside her cat, Scout stretches in his basket bed, and Olithia brushes her hair at the vanity.
- **Olithia is moved by tapping, not buttons.**
  - In her cottage, tap the desk to work or the sofa to sit. Tap it again, or the floor, for idle.
  - In her bedroom, tap the bed to sleep. It is only dark at night. Tap the vanity or the floor to get up.
  - "Sit together" in a bot's house, the hill crest in the park, "Join in" at the playground and "Sit with" in the burrow all send her there.
  - Wherever she is, her cottage shows empty. Her spot is saved in localStorage as `bt-olithia-at`.
- **Testing:** `?hour=14.5`, `?day=2026-10-24` and `?night=1` or `?night=0`. In the console you can call `__bt.locate('loria')`, `__bt.dayPlan('loria', __bt.dayKey(0))` and `__bt.setOli('starfall', 'sitting')`.
