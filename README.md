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
- After changing files, bump `CACHE` in `sw.js` (currently `bot-town-v22`) so installed phones fetch the update.
- Rooms have a few pixels of tilt (or finger) parallax, drifting motes, lamp glow, and a breathing vignette. The map has slow clouds. `prefers-reduced-motion` turns the motion off.

## Testing tips
- `?hour=22` previews the night tint. `?loaddelay=3000` slows the loading screen.
- Run locally: `python3 -m http.server` then open http://localhost:8000.
