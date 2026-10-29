// ===== Bot Town config: edit names, roles, rooms, spots, tasks, pets & lines here =====
// Room coordinates are % of the cutaway image (aspect = height/width).
// Painted houses use poses (idle / working / sitting) instead of a separate character sprite. v26: no pose buttons; the pose comes from locate().
// Door rects are % so they scale; they were measured in image pixels and padded a little for fingers.
window.BOT_TOWN = {
  // v51: live chat relay on the Pi (README: the visitor key is public by design; bot tokens never ship here).
  // The quick-tunnel address changes when the tunnel restarts: just update url. Set url to "" to turn live chat off.
  relay: { url: "https://neck-creates-mitchell-passes.trycloudflare.com", key: "X5xP3hd2vbaUx557-bTQ9A" },
  blueStar: { label: "" }, // v32: the little blue star. Add a name here if you like; tapping shows 💙
  title: "Bot Town",
  player: "olithia", // whose sprite visits the burrow
  // v26: every character (the three bots and Olithia) is in exactly ONE scene at a time; app.js locate(id) decides which.
  // A bot is where a fresh status.json (under 6 hours old) says. Otherwise it follows its own day, generated from the
  // routine below and seeded by the date, so each day is different but the same for everyone all day.
  // sleep: [bedtime, wake-up] in local hours; a bedtime past midnight is written as 24+ (25 = 01:00).
  // work: share of the day spent working; outings: places it may wander to (houses = visiting that bot or Olithia).
  // Before bed and after waking it spends a little while awake in its own bedroom.
  bots: ["gorbo", "loria", "scout"],
  // v41: Loria's owl. One owl, always where Loria is (or home): awake at night (blinks, turns her head), dozing by day.
  // perch: x/y = where the feet grip (% of the scene), h = owl height in art px, art = scene art size, tint = CSS filter to sit in that light
  owl: { name: "Loria's owl", awake: "assets/owl-awake.webp", doze: "assets/owl-doze.webp", night: [19, 7], ratio: 133 / 176,
    perches: {
      loria: { x: 39.69, y: 26.2, h: 46, art: [1280, 720], tint: "sepia(.18) saturate(.95)" },
      "loria-bed": { x: 27.8, y: 50, h: 40, art: [1280, 720], tint: "sepia(.15)", tintNight: "brightness(.62) sepia(.25) saturate(.85)" },
      starfall: { x: 48.9, y: 77.35, h: 32, art: [720, 2260], tint: "", tintNight: "brightness(.45) saturate(.7) hue-rotate(-8deg)" },
      playground: { x: 71.4, y: 29.95, h: 26, art: [720, 1905], tint: "" }
    } },
  routines: {
    gorbo: { sleep: [23, 7], work: .5, outings: ["starfall", "playground", "olithia"] },
    loria: { sleep: [25, 9], work: .42, outings: ["starfall", "playground", "olithia"] }, // night owl: she stays up with her owl till about 01:00
    scout: { sleep: [22, 6.5], work: .5, outings: ["starfall", "playground", "loria", "olithia"] }
  },
  // v58: Mr. Bubbles, Olithia's cat. A seeded daily routine (same for everyone all day): up around 07:30, wandering between scenes (sitting, strolling, napping), asleep with Olithia at night.
  // h = sprite height as a fraction of the scene width (about a quarter of Olithia's height, one size in every scene); spots = where his feet land (% of the scene)
  cat: { name: "Mr. Bubbles", sleep: [21, 7.5], places: ["olithia", "gorbo", "loria", "scout", "starfall", "playground"],
    art: { sit: "assets/cat-sit.webp", walk: "assets/cat-walk.webp", sleep: "assets/cat-sleep.webp" }, ratio: { sit: 187 / 300, walk: 259 / 300, sleep: 300 / 291 }, h: { sit: .068, walk: .06, sleep: .052 },
    spots: {
      olithia: [{ x: 39, y: 80 }, { x: 47, y: 87 }, { x: 31, y: 87 }],
      gorbo: [{ x: 55, y: 90 }, { x: 68, y: 86 }, { x: 36, y: 90 }],
      loria: [{ x: 50, y: 72 }, { x: 36, y: 84 }, { x: 78, y: 78 }],
      scout: [{ x: 46, y: 82 }, { x: 36, y: 84 }, { x: 62, y: 82 }],
      starfall: [{ x: 44, y: 40.5 }, { x: 52, y: 19 }, { x: 73, y: 34 }],
      playground: [{ x: 20.8, y: 44.4 }, { x: 84.7, y: 45.1 }, { x: 45.8, y: 51.7 }]
    }, scale: { starfall: 1.3, playground: 1.3 }, lines: ["Mrrp! 🐾", "*purrrr*", "Mew? (He wants a belly rub.)", "*slow blink* 💚", "Meow~ 🔔"] },
  // v59: gentle rain. Seeded per day: about 3 days in 10 have a drizzle lasting a few hours. ?rain=1 forces it on, ?rain=0 off.
  weather: { chance: .3, start: [6, 17], hours: [2, 5] },
  // v59: Scout's treasure hunt. scene = 'map' (x/y = % of the map) or a room id (x/y = % of its stage); w = width in % of that stage.
  // wall = where the pin lights up on the corkboard map (map px of the 720x2290 town map); pp = pin spot on the painted corkboard (% of it)
  hunt: { title: "Scout's treasure hunt", scout: "assets/face-scout.webp", items: [
    { id: "acorn", name: "Golden acorn", art: "assets/hunt-acorn.webp", ratio: 94 / 120, scene: "map", x: 76.4, y: 11.5, w: 2.6, wall: [550, 262], pp: [26, 36],
      clue: "A golden acorn gleams where the oldest oak throws its shade, just north of Gorbo's workshop.", found: "A golden acorn, warm from the sun. Scout will want to pin this one!" },
    { id: "key", name: "Brass key", art: "assets/hunt-key.webp", ratio: 87 / 120, scene: "gorbo", x: 20, y: 80, w: 3.6, wall: [550, 560], pp: [70, 28],
      clue: "A little brass key hides where Gorbo's gadgets gather dust, low and near the workbench.", found: "A tiny brass key tied with a green ribbon. It must open something small." },
    { id: "star", name: "Star shard", art: "assets/hunt-star.webp", ratio: 117 / 120, scene: "starfall", x: 15, y: 34, w: 5.2, wall: [360, 1950], pp: [48, 70],
      clue: "A star fell on Starfall Hill. Look in the grass west of the telescope blanket.", found: "A shard of pale blue starlight. It hums very softly." },
    { id: "button", name: "Pearl button", art: "assets/hunt-button.webp", ratio: 1, scene: "playground", x: 46, y: 26, w: 5, wall: [130, 790], pp: [30, 62],
      clue: "Someone lost a pearly button near the playground. Try the grass between the treehouse and the slide.", found: "A pearly button with four little holes. Somebody's best cardigan is one short." },
    { id: "feather", name: "Teal quill", art: "assets/hunt-feather.webp", ratio: 72 / 120, scene: "olithia", x: 15, y: 81, w: 3.6, wall: [200, 250], pp: [72, 66],
      clue: "A teal quill drifted into Olithia's cottage and landed by her desk.", found: "A cream and teal quill. It still smells faintly of ink and rain." }
  ], done: "Every find is pinned. Scout hands you a gold star: \"Best treasure hunter in Bot Town!\" 🌟" },
  // v58: what each bot is doing or thinking, by pose and place. The day plan (seeded by the date) picks one line per stretch; it shows in each bot's Thoughts.
  thoughts: {
    gorbo: { working: ["Debugging the town's lantern timers 🔧", "Oiling gears at the workbench", "Compiling something very important…", "Fixing a bug that only shows up on Tuesdays"],
      idle: ["Tinkering with a half-built music box", "Sorting bolts by size, then by feeling", "Waiting on a build. Staring at the kettle.", "Sketching a gadget on a napkin"],
      sitting: ["Taking a break in the armchair ☕", "Reading old patch notes for fun", "Thinking about what to build next"],
      awake: ["Just woke up. Hair looks like a bird's nest.", "Waiting for the kettle in his slippers", "Stretching and planning the day"],
      evening: ["Winding down with a warm mug", "Getting ready for bed, one more gadget to go", "Tucking the tools away for the night"],
      rain: ["Listening to the rain on the workshop roof 🌧️", "Rain on the roof, cogs humming. Perfect tinkering weather.", "Moved the soldering iron away from the window. Drip drip."],
      sleeping: ["Zzz… dreaming of a perfectly green test run"], olithia: ["Dropped by Olithia's for tea 🍵", "Showing Olithia a little gadget", "Chatting on Olithia's sofa"],
      starfall: ["Looking at the stars from Starfall Hill ✨", "Fixing the telescope strap"], playground: ["Pushing the swing, strictly for testing", "Building a tower of blocks"] },
    loria: { working: ["Writing today's post for My Leisure Time ✍️", "Editing photos for the town feed 📸", "Planning the week's to-dos", "Answering comments with lots of hearts"],
      idle: ["Brewing tea and plotting a caption", "Rearranging the bookshelf (again)", "Finding the perfect cozy book to recommend 📚"],
      sitting: ["Curled up with a book and her owl 🦉", "Sipping tea, thinking about stories", "Reading fan messages with a smile"],
      awake: ["Up late, up early — the owl approves", "Sleepy, hunting for her slippers", "Writing one more idea in her journal"],
      evening: ["Brushing her hair before bed, the owl on watch", "Lighting the bedside lamp for one more chapter", "Writing tomorrow's to-dos by candlelight"],
      rain: ["Reading by the window while the rain taps the glass 📖", "Rainy day, big cup of tea, no plans at all", "Watching raindrops race down the window"],
      sleeping: ["Zzz… dreaming about a bookshop made of clouds"], olithia: ["Visiting Olithia, to check in on today's to-dos 📓", "Sharing tea and ideas at Olithia's", "Borrowing Olithia's sunny spot"],
      starfall: ["Reading by the willow 🌿", "Writing at the tea pavilion"], playground: ["Taking cozy photos at the playground", "Swinging with a book in her lap"] },
    scout: { working: ["Chasing down today's news 🗞️", "Fact-checking a headline", "Digging up research for Loria", "Mapping out what other cozy games are doing"],
      idle: ["Sniffing out a good story *tail wag*", "Sorting clippings into little piles", "Practising fun facts for visitors"],
      sitting: ["Resting with a cup of tea, ears twitching", "Reading the paper (he wrote half of it)", "Looking at the star chart"],
      awake: ["Stretching with a big yawn", "Packing his satchel for the day", "Checking the sky out the window"],
      evening: ["Folding up the day's newspaper clippings", "Getting cozy in his blanket, ears drooping", "Reading tomorrow's headlines in his head"],
      rain: ["Tail curled up, watching the drizzle with a mug of tea", "Writing up the rain report for the Gazette ☔", "Checking the sky: gentle rain until the afternoon, he predicts"],
      sleeping: ["Zzz… chasing a very fast headline"], olithia: ["Dropping off the latest news at Olithia's 🗞️", "Visiting Olithia with a fun fact", "Sitting by Olithia's tea table"],
      starfall: ["Stargazing from Starfall Hill ✨", "Noting down what the stars are doing"], playground: ["Racing the slide for science", "Digging in the sandbox for fossils"] }
  },
  bedNight: [20, 7], // bedrooms use their dark night look from 20:00 to 07:00
  // Free-standing sprites used when a bot visits somewhere it isn't painted in (another house, the playground) and for map pins.
  // h = sprite height as a fraction of a house's width, measured from each bot's own painted house.
  sprites: {
    gorbo: { src: "assets/sprite-gorbo.webp", face: "assets/face-gorbo.webp", h: .217 },
    loria: { src: "assets/sprite-loria.webp", face: "assets/face-loria.webp", h: .281 },
    scout: { src: "assets/sprite-scout.webp", face: "assets/face-scout.webp", h: .239 },
    olithia: { src: "assets/sprite-olithia.webp", face: "assets/face-olithia.webp", h: .25 } // v26: when she sits with a bot who is out, or plays at the playground
  },
  loadingTips: ["Gorbo is fixing bugs…", "Loria is brewing tea…", "The ladybug is fluffing her pillow…", "Olithia is lighting the fairy lights…", "Mochi is stretching in the sun…", "Loria is shelving new books…", "Scout is digging up facts…", "Scout is sorting his research notes…"],
  characters: {
    olithia: {
      name: "Olithia", role: "Town Keeper (that's you!)", house: "Lotus Cottage",
      sprite: "assets/sprite-olithia.webp", spriteHeight: 23, // only used when she visits the burrow
      hotspot: { left: 9.7, top: 1.3, width: 45.8, height: 15.3 },
      room: {
        aspect: 864 / 1152,
        backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)",
        poses: {
          idle: "assets/olithia-house-v4-idle.webp",
          working: "assets/olithia-house-v4-working.webp",
          sitting: "assets/olithia-house-v4-sitting.webp"
        },
        empty: "assets/olithia-house-v4.webp", // v26: shown when she is in her bedroom or out
        // v26: no pose buttons. Tap an object to move her there (tap it again, or the floor, for idle). Art % of 1152×864.
        objects: [
          // v57: the desk and sofa zones are split around the notebook and newspaper props so no two tap areas overlap
          { pose: "working", label: "Desk", zone: { left: 11, top: 41, width: 21, height: 5 } },
          { pose: "working", label: "Desk", zone: { left: 21, top: 46, width: 11, height: 25 } },
          { pose: "working", label: "Desk", zone: { left: 11, top: 58, width: 10, height: 13 } },
          { pose: "sitting", label: "Sofa", zone: { left: 55, top: 48, width: 40, height: 16 } },
          { pose: "sitting", label: "Sofa", zone: { left: 55, top: 64, width: 14, height: 18 } },
          { pose: "sitting", label: "Sofa", zone: { left: 81, top: 64, width: 14, height: 18 } },
          { pose: "sitting", label: "Sofa", zone: { left: 69, top: 77, width: 12, height: 5 } },
          { pose: "idle", label: "Floor", floor: true, zone: { left: 4, top: 55, width: 92, height: 40 } }
        ],
        // v57: painted props laid on the art (box = % of 1152×864) with a generous tap zone each
        props: [
          { id: "notebook", label: "Olithia's notebook", src: "assets/prop-notebook.webp", box: { left: 13.2, top: 51.2, width: 5.2, height: 6.8 }, zone: { left: 11, top: 46, width: 10, height: 12 } },
          { id: "paper", label: "The Bot Town Gazette", src: "assets/prop-newspaper.webp", box: { left: 71.6, top: 67.8, width: 6, height: 6.4 }, zone: { left: 69, top: 64, width: 12, height: 13 } }
        ],
        // arched bedroom doorway in the left room. Art: x=445,y=130,w=150,h=390 on 1152×864.
        bedroom: { to: "olithia-bed", label: "Olithia's bedroom", door: { left: 38.63, top: 15.05, width: 13.02, height: 45.14 } },
        // where visiting bots stand (feet, % of the scene)
        guests: { gorbo: { x: 54, y: 86 }, loria: { x: 88, y: 87 }, scout: { x: 70, y: 90 } }
      },
      // v57: her old To-do list is replaced by the notebook prop
      dialog: ["Welcome home! Mochi saved you the sunny spot.", "Shall we check on everyone in town today?", "I made tea — it's still warm!", "Every little task is a tiny adventure. 🌿", "Mochi says mrrp. I think that means hello."]
    },
    gorbo: {
      name: "Gorbo", role: "App Mechanic & Bug Wrangler", house: "Mossy Workshop",
      hotspot: { left: 52.8, top: 14.4, width: 47.2, height: 19.2 },
      room: {
        aspect: 864 / 1152, zoom: 1.18, // wide enough that the right-hand bedroom door starts on screen
        backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)",
        poses: {
          idle: "assets/gorbo-house-v4-idle.webp",
          working: "assets/gorbo-house-v4-working.webp",
          sitting: "assets/gorbo-house-v4-sitting.webp"
        },
        // Olithia visiting: tap the seating area (armchair, tea table and sofa. Art: x=675–1090, y=449–698 on 1152×864) to sit together
        visit: "assets/gorbo-house-v4-visit.webp", seat: { left: 58.6, top: 52.0, width: 36.1, height: 28.8 },
        // bedroom door on the right wall. Art: x=921,y=240,w=66,h=190
        bedroom: { to: "gorbo-bed", label: "Gorbo's bedroom", door: { left: 76.39, top: 26.62, width: 13.02, height: 24.3 } },
        // v28: tap the desk to send gorbo to work, the seating to sit, the floor (or gorbo) for idle
        objects: [
          { pose: "working", label: "Desk", zone: { left: 8, top: 38, width: 44, height: 30 } },
          { pose: "idle", label: "Floor", floor: true, zone: { left: 4, top: 55, width: 92, height: 40 } }
        ],
        empty: "assets/gorbo-house-v4.webp", // shown when Gorbo is out
        guests: { loria: { x: 42, y: 84 }, scout: { x: 64, y: 87 } }
      },
      tasks: ["Squash the sneaky login bug", "Tighten loose bolts in the app", "Read crash logs with the magnifier", "Polish buttons till they shine"],
      dialog: ["Oi! Mind the wires — they bite. Only a little.", "Found three bugs today. Dot ate one. Don't tell.", "App's running smooth as river stones!", "Dot's napping in her tiny bed. Shhh. 🐞", "Need something fixed? Gorbo's on it!"]
    },
    loria: {
      name: "Loria", role: "My Leisure Time Manager & Social Media", house: "Loria's Bookshop",
      hotspot: { left: 44.4, top: 48.3, width: 55.6, height: 16.0 },
      room: {
        aspect: 720 / 1280, zoom: 1, // whole 16:9 cutaway fits a phone, so both doors are on screen
        backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)",
        poses: {
          idle: "assets/loria-house-v4-idle.webp",
          working: "assets/loria-house-v4-working.webp",
          sitting: "assets/loria-house-v4-sitting.webp"
        },
        // Olithia visiting: tap the seating area (sofa and armchairs. Art: x=787–1125, y=287–587 on 1280×720) to sit together
        visit: "assets/loria-house-v4-visit.webp", seat: { left: 61.5, top: 39.9, width: 26.4, height: 41.7 },
        // far-left bedroom door. Art: x=66,y=352,w=64,h=180 on 1280×720, padded for taps.
        bedroom: { to: "loria-bed", label: "Loria's bedroom", door: { left: 1.5, top: 47.2, width: 12.3, height: 28.2 }, doors: [{ left: 44.3, top: 26, width: 13.5, height: 36 }] },
        // v28: tap the desk to send loria to work, the seating to sit, the floor (or loria) for idle
        objects: [
          { pose: "working", label: "Desk", zone: { left: 17, top: 37, width: 22, height: 30 } },
          { pose: "idle", label: "Floor", floor: true, zone: { left: 4, top: 55, width: 92, height: 40 } }
        ],
        // v55: the round door in the middle entry room is Loria's bedroom door too (same glow-on-touch door)
        links: [],
        empty: "assets/loria-house-v4.webp",
        // v59: painted props (feet = where they stand, w = width, all % of the stage; ratio = image height / width): tap each for its little nook
        props: [
          { id: "loria-chair", label: "Reading chair", src: "assets/prop-loria-chair.webp", ratio: 379 / 440, feet: { x: 16.4, y: 89, w: 12 } },
          { id: "loria-sign", label: "Currently reading", src: "assets/prop-loria-sign.webp", ratio: 435 / 300, feet: { x: 27.2, y: 91, w: 6 } },
          { id: "loria-press", label: "Flower-pressing corner", src: "assets/prop-loria-press.webp", ratio: 513 / 560, feet: { x: 38.5, y: 90, w: 14 } }
        ],
        guests: { gorbo: { x: 63, y: 88 }, scout: { x: 76, y: 89 } }
      },
      tasks: ["Schedule posts for My Leisure Time", "Test the new game level", "Reply to fan comments", "Shelve the cozy novels"],
      dialog: ["Oh hi! Want a book rec? I have, um, all of them.", "Today's post got so many hearts! 💖", "My Leisure Time update is coming along nicely~", "Tea, a book, and a good game. Perfect day.", "Let me snap a pic for the town feed! 📸", "Scout dug up the best research for today's post. He's a gem! 🦊", "Need facts? Scout's cottage is up on the hill!"]
    },
    scout: {
      name: "Scout", role: "Research Expert · Loria's Assistant", house: "Scout's Cottage",
      hotspot: { left: 1.7, top: 54.5, width: 50.4, height: 22.4 },
      room: {
        aspect: 864 / 1152, zoom: 1.1, // v59: a touch wider so the whole desk fits a phone (it was running off the left edge)
        backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        poses: {
          idle: "assets/scout-house-v5-idle.webp",
          working: "assets/scout-house-v5-working.webp", // v56: repainted as a two-room cutaway like the other houses
          sitting: "assets/scout-house-v5-sitting.webp"
        },
        // Olithia visiting: tap the seating area (armchair, tea table and sofa. Art: x=546–889, y=562–765 on 1152×864) to sit together
        visit: "assets/scout-house-v5-visit.webp", seat: { left: 56.6, top: 48.2, width: 32.2, height: 32.5 },
        // bedroom door on the back wall. Art: x=645-690, y=368-487 on 1152×864.
        bedroom: { to: "scout-bed", label: "Scout's bedroom", door: { left: 42.5, top: 24.7, width: 12, height: 39 } }, // v56: the arched door between the rooms
        // v28: tap the desk to send scout to work, the seating to sit, the floor (or scout) for idle
        spots: [{ label: "Star chart", sky: true, zone: { left: 11.2, top: 19, width: 11, height: 21 } }], // v32 (v56: on the new wall)
        objects: [
          { pose: "working", label: "Desk", zone: { left: 9, top: 43, width: 25, height: 28.6 } },
          { pose: "idle", label: "Floor", floor: true, zone: { left: 4, top: 55, width: 92, height: 40 } }
        ],
        empty: "assets/scout-house-v5.webp",
        // v59: his lookout nook and the treasure-hunt corkboard (painted over the picture frames on the back wall)
        props: [
          { id: "scout-nook", label: "Lookout nook", src: "assets/prop-scout-nook.webp", ratio: 406 / 440, feet: { x: 82.5, y: 87, w: 14 } },
          { id: "scout-board", label: "Treasure hunt corkboard", src: "assets/prop-scout-board.webp", ratio: 393 / 520, box: { left: 64.2, top: 17.5, width: 14.4 }, wall: true }
        ],
        guests: { gorbo: { x: 66, y: 89 }, loria: { x: 40, y: 85 } }
      },
      tasks: ["Research trending cozy games", "Summarize fan feedback for Loria", "Fact-check this week's posts", "Map out My Leisure Time competitors"],
      dialog: ["Ooh, a visitor! Want to hear a fun fact?", "I found three new sources this morning! *tail wag*", "Loria says I'm the best fact-fetcher in town. 🦊", "Did you know foxes can hear a watch ticking 40 yards away?", "My notes are a bit messy, but I know where everything is!", "Come find me at my cottage on the hill!"]
    },
    // Painted into the bottom of the map. The tap opens the tall park.
    starfall: {
      name: "Starfall Hill", role: "Park", house: "Starfall Hill",
      gallery: true,
      hotspot: { left: 0, top: 76.9, width: 100, height: 23.1 },
      room: {
        // Tall park that scrolls vertically like the map (720x2260). The night image is used from 19:00 to 06:00 local time.
        // v25: the bots are no longer painted in. Each one's painted pose is laid over the empty park only while it is here.
        image: "assets/starfall-hill-v3-empty.webp", night: "assets/starfall-hill-v3-night-empty.webp", nightHours: [19, 6], // v26: Olithia removed from the crest too
        // v29: no painted cameos. Shared seats per spot (feet %, any character, one per seat); kind: sit (default) | read | scope
        parkPoses: { sit: "assets/park-sit-", read: "assets/park-read-", scope: "assets/park-scope-" }, // + <id>.webp
        // v30: telescope poses have no telescope of their own. Seat x/y = the painted eyepiece; [ax, ay] = where the hands sit in each sprite (fraction); scopeFeet = eyepiece-to-ground (% of park height)
        scopeAnchor: { gorbo: [.165, .188], loria: [.211, .076], scout: [.134, .137], olithia: [.173, .074] }, scopeFeet: 5.9,
        // v31 STANDING RULE: characters must fit naturally into their environment. Each park seat is a per-character patch painted into
        // the exact base crop (right pose, scale, light, contact shadow, occlusion). Olithia plays the handpan ONLY at the hill crest.
        parkPatch: "assets/park-v31/", parkBox: {"scope-olithia":[47.92,28.67,12.5,7.17],"crest-gorbo":[46.11,14.65,14.03,5.53],"crest-loria":[42.78,13.89,18.33,6.15],"crest-scout":[45.0,13.36,19.72,6.99],"crest-olithia":[44.44,13.23,18.33,7.21],"blanket-gorbo":[32.92,34.78,15.83,6.81],"blanket-loria":[29.31,34.87,21.25,7.26],"blanket-scout":[31.11,34.6,21.53,7.61],"blanket-olithia":[32.5,34.73,18.75,7.43],"board-gorbo":[41.53,63.1,15.42,6.86],"board-loria":[38.33,62.92,13.19,8.19],"board-scout":[37.5,62.65,15.97,8.32],"board-olithia":[38.89,62.65,14.44,9.42],"tea-gorbo":[67.08,64.96,15.14,6.19],"tea-loria":[67.78,64.12,32.22,11.11],"tea-scout":[63.75,63.63,18.89,8.89],"tea-olithia":[68.33,63.5,16.11,9.34],"nook-gorbo":[8.47,81.9,19.31,6.24],"nook-loria":[9.03,80.62,22.92,7.92],"nook-scout":[10.42,80.31,22.36,9.29],"nook-olithia":[11.67,80.31,22.22,9.51],"swap-gorbo":[46.81,81.86,16.25,6.5],"swap-loria":[47.64,81.55,16.25,7.17],"swap-scout":[45.14,81.73,17.64,6.73],"swap-olithia":[48.33,81.5,14.58,6.77],"market-gorbo":[66.25,91.33,19.44,7.92],"market-loria":[69.03,91.81,12.22,7.57],"market-scout":[62.78,90.04,17.78,8.98],"market-olithia":[67.78,89.82,12.64,7.83]}, // <seat>-<id>[-night].webp; box = [left, top, width, height] %
        parkH: { sit: .17, read: .17, scope: .25 }, // sprite height as a fraction of the park width
        aspect: 2260 / 720, scroll: true,
        backdrop: "radial-gradient(circle at 50% 38%, #4a3568, #2a1c40 55%, #140e22)",
        glows: [], // the lantern light is painted into the art
        // v44: October pumpkin patch (art px of the 720x2260 park; shown only in October by local month, ?month=10 to test)
        october: { day: "assets/sf44-pumpkins-day.webp", night: "assets/sf44-pumpkins-night.webp", box: [521.3, 1020, 127.4, 84], pk: "assets/sf44-pk",
          pumpkins: [[552.5, 1028.3, 36.3, 33.9], [593.5, 1031.5, 28.8, 28.3], [543.6, 1057.1, 21.1, 18.8], [598.6, 1057.5, 25.3, 23.5], [575.1, 1071.9, 18.9, 16.7]] },
        // v44: critters to collect. w/h = art px, spots = [x, feet y] art px, fly = hover height px, when = day | night | any
        critters: {
          hedgehog: { name: "Hedgehog", w: 34, h: 26.2, when: "night", walk: true, note: "Snuffled past on tiny feet, looking for beetles.", spots: [[500, 1740], [330, 1450], [140, 2090], [90, 1040]] },
          snail: { name: "Snail", w: 22, h: 13.5, when: "any", walk: true, note: "In no hurry at all. A shiny trail says hello.", spots: [[330, 2005], [322, 1528], [470, 1112], [640, 735]] },
          butterfly: { name: "Butterfly", w: 22, h: 19.9, when: "day", fly: 20, note: "Danced over the flowers and winked its wings.", spots: [[512, 2040], [80, 2172], [672, 1700], [662, 552]] },
          squirrel: { name: "Squirrel", w: 30, h: 30.1, when: "day", note: "Hid an acorn for later. Very busy, very fluffy.", spots: [[344, 1744], [362, 1392], [130, 552], [600, 1780]] },
          firefly: { name: "Firefly", w: 14, h: 13.1, when: "night", fly: 26, glow: true, note: "A tiny lantern that blinks back at you.", spots: [[287, 1650], [200, 1250], [600, 1300], [470, 1880]] }
        },
        // tap zones (percent of the scene) that show a caption bubble
        spots: [
          { label: "Hill crest", caption: "Olithia's mat under the blossom tree.", join: true, seats: [{ x: 52, y: 20, patch: "crest" }], zone: { left: 26.8, top: 1.8, width: 61.4, height: 20.3 } }, // v31: only spot where Olithia plays her handpan
          { label: "Stargazing spot", caption: "The telescope and the picnic blankets.", seats: [{ x: 51.6, y: 30.9, kind: "scope", patch: "scope" }, { x: 38, y: 42, patch: "blanket" }], zone: { left: 15.3, top: 28.1, width: 72.9, height: 14.0 } },
          { label: "Noticeboard", caption: "Town notes, lost mittens and tea invites.", seats: [{ x: 50, y: 69, patch: "board" }], zone: { left: 41.4, top: 61.1, width: 19.2, height: 7.9 } },
          { label: "Tea pavilion", caption: "The shared teapot is always warm here.", seats: [{ x: 75, y: 70, patch: "tea" }], zone: { left: 60.6, top: 52.5, width: 39.4, height: 20.7 } },
          { label: "Willow reading nook", caption: "A cushioned bench under the lantern-lit willow.", seats: [{ x: 20, y: 86, patch: "nook" }], zone: { left: 0, top: 64.7, width: 38.3, height: 28.1 } },
          { label: "Book-swap box", caption: "Take a book, leave a book.", poems: true, seats: [{ x: 60, y: 87, patch: "swap" }], zone: { left: 38.3, top: 76.3, width: 19.2, height: 9.8 } },
          { label: "Seasonal market", caption: "Pumpkins, apples and jam this season.", seats: [{ x: 80, y: 97, patch: "market" }], zone: { left: 74.7, top: 79.4, width: 25.3, height: 20.6 } },
          { label: "Telescope", sky: true, zone: { left: 35, top: 28.2, width: 17, height: 5.2 } } // v32: look through it at the Bot Town sky
        ]
      }
    },
    // v25: the playground plot on map-v3 (where the vegetable garden was), joined to the standing-stone loop.
    playground: {
      name: "Playground", role: "Play", house: "The Playground",
      gallery: true, play: true,
      hotspot: { left: 0, top: 27.9, width: 50.7, height: 12.2 },
      room: {
        // v36: a tall scrolling playground (720x1905) with roomy zones, like Starfall Hill
        image: "assets/playground-v3.webp", aspect: 1905 / 720, scroll: true, artW: 720, artH: 1905, stateKey: "-v36",
        backdrop: "linear-gradient(#bfe0f5, #8fbf6a 40%, #6f7914 92%)", // v48: bottom matches the grass under the docked buttons
        motto: "You are here for yourself. Be curious and have fun.",
        guests: { gorbo: { x: 30, y: 53 }, loria: { x: 44, y: 55 }, scout: { x: 22, y: 56 }, olithia: { x: 37, y: 52 } }, guestScale: 1, // anyone without a toy stands on the lawn
        // two swings on the painted crossbar: x,y = rope pivot (art px), L = rope length px, half/slope = rope spacing along the slanted bar
        swings: [{ toy: "swing", x: 400.5, y: 622.7, L: 130, ground: 820, // v50: nudged 18px along the bar, away from the front leg
          half: 27, slope: .47, z: 440, patch: "A" }, { toy: "swing2", x: 459, y: 597, L: 128, ground: 787, half: 22, slope: .47, z: 410, patch: "B" }],
        swingRiders: "assets/pg42-sw", // v42 (was v37): painted rider+seat+ropes patch <A|B>-<id>.webp, 140x250 art px, crossbar pivot at (70,24); rotates around the pivot
        swingLeg: { src: "assets/pg3-swing-leg.webp", box: [40.28, 35.7, 11.39, 12.18], z: 446 }, // front-left leg in front of the left swing
        seesaw: { plank: "assets/pg43-seesaw-plank.webp", post: "assets/pg40-seesaw-stand.webp", plankShadow: "assets/pg43-seesaw-plankshadow.webp", postShadow: "assets/pg40-seesaw-standshadow.webp", box: { left: 4.17, top: 59.84, width: 38.89, height: 8.4 },
          /* v40: true 3D tilt about the axle (sprite px 280x160): plank dir e1, axle dir e2, kv = screen px of height per px along the plank, z0 = axle height above the grass, light = shadow drift per px of height */
          pivot: [161, 82], e1: [.926, -.377], e2: [.7915, .6112], kv: 1.1, z0: 56, light: [-.17, .62], ends: [[34, 134.6], [264.7, 36]], phiL: 21.4, phiR: -28.8 },
        sandbox: [[60.28, 63.15], [75.56, 60.68], [89.31, 63.46], [74.31, 66.25]], // v38: inner sand corners of the painted frame (art px / size)
        chalk: { left: 21.53, top: 72.34, width: 8.33, height: 4.83, skew: 0 },
        chest: { left: 57.64, top: 70.6, width: 20.14, height: 8.92 },
        // v45: Dig & Find opens from the sand inside the open chest (art px polygon); the rake rests against the sandbox rim; stones wait on the grass
        chestSand: [[428, 1424], [458, 1402], [545, 1421], [512, 1462]],
        rake: { src: "assets/pg45-rake.webp", box: [558, 1262, 64, 45.6], head: [.16, .66] },
        stones: [{ src: "assets/pg45-stone0.webp", w: 19, h: 11.7, home: [430, 1262] }, { src: "assets/pg45-stone1.webp", w: 18, h: 11, home: [453, 1281] }, { src: "assets/pg45-stone2.webp", w: 16, h: 9.7, home: [478, 1295] },
          { src: "assets/pg45-stone3.webp", w: 18, h: 11, home: [434, 1288] }, { src: "assets/pg45-stone4.webp", w: 15, h: 8.6, home: [502, 1310] }],
        xylo: { left: 58.06, top: 23.36, width: 11.67, height: 2.52 }, chimes: { left: 62.5, top: 17.74, width: 5.0, height: 5.14 },
        kite: { x: 80, y: 4.5, anchor: [83.33, 17.32], maxY: 9 },
        // a toy each (one per toy); h = sprite height % of scene height, feet at x,y (%)
        toys: { swing: { x: 49.58, y: 44.4 }, swing2: { x: 64.17, y: 41 }, slide: { box: [22, 508, 100, 100], y: 31.5, pose: "assets/pg37-slide-", scale: 1.45, anchor: [.4, .74] }, sand: { box: [490, 1137, 110, 110], y: 64.7, pose: "assets/pg37-sand-", scale: 1.45, anchor: [.55, .9] } /* v55: one character scale, matched to Olithia on the willow bench; scaled about the hip / ground contact */ },
        slideZone: { left: 0, top: 27.3, width: 27.78, height: 14.17 },
        board: { left: 61.11, top: 83.2, width: 15.28, height: 9.45 },
        blockW: 6.2, ball: [62, 53], ballD: 6.5,
        blockStart: [[14, 57], [21, 57], [28, 57], [35, 57], [42, 57], [14, 57, 1, 0], [21, 57, 1, 1], [14, 57, 2, 5], [35, 57, 1, 3], [21, 57, 2, 6]], // x, y, stack level, on
        lawn: [[5, 47.5], [95, 47.5], [95, 59.3], [5, 59.3]] // where blocks and the ball may go (polygon, %)
      }
    },
    // v55: Scout's burrow under the bookshop is gone; the middle round door is now Loria's bedroom door.
    "olithia-bed": {
      name: "Olithia", role: "Bedroom", house: "Lotus Cottage",
      gallery: true, returnTo: "olithia",
      // v26: empty (day / night), awake (day / night) and asleep. Only the one that matches locate("olithia") shows.
      room: {
        door: { left: 11, top: 34, width: 14, height: 38 }, // v29: the painted door back to the house
        image: "assets/olithia-bedroom-v2.webp", night: "assets/olithia-bedroom-v2-night.webp",
        noCat: { image: "assets/olithia-bedroom-v2-nocat.webp", night: "assets/olithia-bedroom-v2-night-nocat.webp", awake: "assets/olithia-bedroom-v2-awake-nocat.webp", awakeNight: "assets/olithia-bedroom-v2-awake-night-nocat.webp" }, // v58: Mr. Bubbles is out wandering
        catSpot: { x: 43.4, y: 53.5, h: .05 },
        awake: "assets/olithia-bedroom-v2-awake.webp", awakeNight: "assets/olithia-bedroom-v2-awake-night.webp",
        sleeping: "assets/olithia-bedroom-v2-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)",
        sleepingDay: "assets/olithia-bedroom-v2-sleeping-day.webp", // asleep in daylight: the room stays light
        // tap the bed to lie down, the vanity or the floor to be up
        objects: [
          { pose: "sleeping", label: "Bed", zone: { left: 34, top: 30, width: 27, height: 45 } },
          { pose: "awake", label: "Vanity", zone: { left: 61, top: 22, width: 19, height: 46 } },
          { pose: "awake", label: "Floor", floor: true, zone: { left: 10, top: 62, width: 80, height: 30 } }
        ]
      }
    },
    "gorbo-bed": {
      name: "Gorbo", role: "Bedroom", house: "Mossy Workshop",
      gallery: true, returnTo: "gorbo",
      // v26: empty (day / night), awake (day / night) and asleep. Only the one that matches locate("gorbo") shows.
      room: {
        door: { left: 70, top: 22, width: 10, height: 34 }, // v29: the painted door back to the house
        image: "assets/gorbo-bedroom-v4.webp", night: "assets/gorbo-bedroom-v4-night.webp",
        awake: "assets/gorbo-bedroom-v4-awake.webp", awakeNight: "assets/gorbo-bedroom-v4-awake-night.webp",
        sleeping: "assets/gorbo-bedroom-v4-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)",
        objects: [{ pose: "sleeping", label: "Bed", zone: { left: 20, top: 28, width: 32, height: 32 } }, { pose: "awake", label: "Floor", floor: true, zone: { left: 8, top: 62, width: 84, height: 30 } }],
      }
    },
    "loria-bed": {
      name: "Loria", role: "Bedroom", house: "Loria's Bookshop",
      gallery: true, returnTo: "loria",
      // v26: empty (day / night), awake (day / night) and asleep. Only the one that matches locate("loria") shows.
      room: {
        door: { left: 32, top: 22, width: 12, height: 34 }, // v29: the painted door back to the house
        image: "assets/loria-bedroom-v4.webp", night: "assets/loria-bedroom-v4-night.webp",
        awake: "assets/loria-bedroom-v4-awake.webp", awakeNight: "assets/loria-bedroom-v4-awake-night.webp",
        sleeping: "assets/loria-bedroom-v4-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)",
        objects: [{ pose: "sleeping", label: "Bed", zone: { left: 20, top: 56, width: 58, height: 27 } }, { pose: "awake", label: "Floor", floor: true, zone: { left: 8, top: 62, width: 84, height: 30 } }],
      }
    },
    "scout-bed": {
      name: "Scout", role: "Bedroom", house: "Scout's Cottage",
      gallery: true, returnTo: "scout",
      // v26: empty (day / night), awake (day / night) and asleep. Only the one that matches locate("scout") shows.
      room: {
        door: { left: 21, top: 35, width: 13, height: 37 }, // v29 (v56: new art): the painted door back to the house
        image: "assets/scout-bedroom-v5.webp", night: "assets/scout-bedroom-v5-night.webp",
        awake: "assets/scout-bedroom-v5-awake.webp", awakeNight: "assets/scout-bedroom-v5-awake-night.webp",
        sleeping: "assets/scout-bedroom-v5-sleeping.webp", aspect: 864 / 1152, nightBackdrop: "radial-gradient(circle at 50% 45%, #232d52, #131a33)", backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        objects: [{ pose: "sleeping", label: "Bed", zone: { left: 38.6, top: 44, width: 33.7, height: 34 } }, { pose: "awake", label: "Floor", floor: true, zone: { left: 8, top: 62, width: 84, height: 30 } }],
      }
    }
  }
};
// v60: character layers (step one). Standalone transparent sprite layers cut from the painted scenes; each box is % of the scene image (left, top, width, height).
window.BOT_TOWN.layers = {"olithia-house-idle":{"src":"assets/lay-olithia-house-idle-body.webp","box":[28.038,42.824,12.413,38.194]},"olithia-house-working":{"src":"assets/lay-olithia-house-working-body.webp","box":[17.795,36.69,17.188,40.394]},"olithia-house-sitting":{"src":"assets/lay-olithia-house-sitting-body.webp","box":[74.306,41.435,13.194,35.185]},"gorbo-house-idle":{"src":"assets/lay-gorbo-house-idle-body.webp","box":[20.92,51.505,15.538,31.366]},"gorbo-house-working":{"src":"assets/lay-gorbo-house-working-body.webp","box":[17.535,41.204,12.413,35.185]},"gorbo-house-sitting":{"src":"assets/lay-gorbo-house-sitting-body.webp","box":[67.448,44.676,27.951,27.894]},"loria-house-idle":{"src":"assets/lay-loria-house-idle-body.webp","box":[48.828,35.417,11.406,51.389]},"loria-house-working":{"src":"assets/lay-loria-house-working-body.webp","box":[19.297,30.139,17.969,53.472]},"loria-house-sitting":{"src":"assets/lay-loria-house-sitting-body.webp","box":[69.375,29.583,13.281,39.028]},"gorbo-bed-awake":{"src":"assets/lay-gorbo-bed-awake-body.webp","box":[30.0,26.389,17.031,43.889]},"gorbo-bed-awakenight":{"src":"assets/lay-gorbo-bed-awakenight-body.webp","box":[30.547,25.833,16.406,44.167]},"gorbo-bed-sleeping":{"src":"assets/lay-gorbo-bed-sleeping-body.webp","box":[31.641,16.806,34.844,55.0]},"loria-bed-awake":{"src":"assets/lay-loria-bed-awake-body.webp","box":[31.797,30.139,24.688,52.222]},"loria-bed-awakenight":{"src":"assets/lay-loria-bed-awakenight-body.webp","box":[31.719,30.139,24.688,54.444]},"loria-bed-sleeping":{"src":"assets/lay-loria-bed-sleeping-body.webp","box":[25.781,21.667,57.344,65.694]},"olithia-bed-catday":{"src":"assets/lay-olithia-bed-catday-body.webp","box":[38.594,49.444,9.531,9.167]},"olithia-bed-catnight":{"src":"assets/lay-olithia-bed-catnight-body.webp","box":[38.672,49.306,9.688,9.444]},"olithia-bed-awake":{"src":"assets/lay-olithia-bed-awake-body.webp","box":[59.922,31.944,12.891,40.694]},"olithia-bed-awakenight":{"src":"assets/lay-olithia-bed-awakenight-body.webp","box":[59.922,31.944,12.891,40.972]},"olithia-bed-sleep":{"src":"assets/lay-olithia-bed-sleep-body.webp","box":[33.516,33.472,30.859,44.306]},"olithia-bed-sleepday":{"src":"assets/lay-olithia-bed-sleepday-body.webp","box":[37.734,41.528,16.875,30.417]}};
