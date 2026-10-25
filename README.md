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
- After changing files, bump `CACHE` in `sw.js` (currently `bot-town-v24`) so installed phones fetch the update. `status.json` and `letters.json` are fetched with `no-store` and are not part of that cache.
- **status.json** (repo root) is Gorbo's live whereabouts. The game reads it on load and every 60 seconds. If it is missing, or `updated` is more than 6 hours old, the game keeps the usual clock-based rooms.

```json
{"updated":"2026-10-25T06:24:23Z","gorbo":{"place":"gorbo","pose":"working","note":"Building the town post office"}}
```

`place` is `gorbo`, `olithia`, `loria`, `scout` or `starfall`. `pose` is `working`, `idle` or `sitting`. `note` is the short line shown as `Gorbo: …`.
- **letters.json** is an array of letters. Read letters are remembered on the phone (`bt-read-letters`).

```json
[{"id":"2026-10-25-post-office","date":"2026-10-25","from":"Gorbo","title":"The houses are painted","body":"Olithia,\n\nTonight…"}]
```
- Rooms have a few pixels of tilt (or finger) parallax, drifting motes, lamp glow, and a breathing vignette. The map has slow clouds. `prefers-reduced-motion` turns the motion off.

## Testing tips
- `?hour=22` previews the night tint. `?loaddelay=3000` slows the loading screen.
- Run locally: `python3 -m http.server` then open http://localhost:8000.
