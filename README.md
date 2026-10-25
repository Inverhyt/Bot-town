# Bot Town 🌿

A cozy phone web game (installable PWA). Plain HTML/CSS/JS — no build step.

## Deploy on GitHub Pages
1. Create a new GitHub repository (public).
2. Upload **all files in this folder** to the **repo root** (index.html, style.css, app.js, config.js, music.js, sw.js, manifest.json, README.md and the `assets/` folder). Easiest: unzip `bot-town-site.zip` and drag its contents into GitHub's "Add file → Upload files" page.
3. Go to **Settings → Pages**, set **Source: Deploy from a branch**, choose **main** and **/ (root)**, then **Save**.
4. After a minute your game is live at `https://<your-username>.github.io/<repo-name>/`.
5. Open it on your phone and choose **Add to Home Screen** to install it. It works offline after the first visit.

## Editing
- **config.js**: everything per character: names, roles, house names, map tap areas, room art (`aspect`, `zoom`), spots (work / hangout / visitor / door), `links` between houses, tasks, dialog, pets, loading tips.
- Characters: Olithia (Lotus Cottage), Gorbo (Mossy Workshop, with Dot the ladybug), Loria (Bookshop) and Scout (burrow under Loria's: reach it from the glowing round door in Loria's entry room, the "Down to Scout's burrow" button, or the yellow lantern beside Loria's house on the map).
- **music.js**: generated ambient tracks.
- After changing files, bump `CACHE` in `sw.js` (e.g. `bot-town-v9`) so installed phones fetch the update.

## Testing tips
- `?hour=22` previews the night tint. `?loaddelay=3000` slows the loading screen.
- Run locally: `python3 -m http.server` then open http://localhost:8000.
