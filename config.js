// ===== Bot Town config: edit names, roles, rooms, spots, tasks, pets & lines here =====
// Room coordinates are % of the cutaway image (aspect = height/width).
// Painted houses use poses (idle / working / sitting) instead of a separate character sprite.
// Door rects are % so they scale; they were measured in image pixels and padded a little for fingers.
window.BOT_TOWN = {
  title: "Bot Town",
  player: "olithia", // whose sprite visits the burrow
  loadingTips: ["Gorbo is fixing bugs…", "Loria is brewing tea…", "The ladybug is fluffing her pillow…", "Olithia is lighting the fairy lights…", "Mochi is stretching in the sun…", "Loria is shelving new books…", "Scout is digging up facts…", "Scout is sorting his research notes…"],
  characters: {
    olithia: {
      name: "Olithia", role: "Town Keeper (that's you!)", house: "Lotus Cottage",
      sprite: "assets/olithia.png", spriteHeight: 21, // only used when she visits the burrow
      hotspot: { left: 4, top: 3, width: 50, height: 33 },
      room: {
        aspect: 864 / 1152,
        backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)",
        poses: {
          idle: "assets/olithia-house-v3-idle.webp",
          working: "assets/olithia-house-v3-working.webp",
          sitting: "assets/olithia-house-v3-sitting.webp"
        },
        // bedroom door on the upper-right wall. Art: x=825,y=227,w=72,h=168 on 1152×864, padded for taps.
        bedroom: { to: "olithia-bed", label: "Olithia's bedroom", door: { left: 68.58, top: 23.73, width: 12.15, height: 24.31 } }
      },
      tasks: ["Plan today's quests", "Check in on Gorbo's bug list", "Water the lotus pond", "Brew chamomile tea"],
      dialog: ["Welcome home! Mochi saved you the sunny spot.", "Shall we check on everyone in town today?", "I made tea — it's still warm!", "Every little task is a tiny adventure. 🌿", "Mochi says mrrp. I think that means hello."]
    },
    gorbo: {
      name: "Gorbo", role: "App Mechanic & Bug Wrangler", house: "Mossy Workshop",
      hotspot: { left: 56, top: 25, width: 44, height: 33 },
      room: {
        aspect: 864 / 1152, zoom: 1.18, // wide enough that the right-hand bedroom door starts on screen
        backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)",
        poses: {
          idle: "assets/gorbo-house-v3-idle.webp",
          working: "assets/gorbo-house-v3-working.webp",
          sitting: "assets/gorbo-house-v3-sitting.webp"
        },
        // bedroom door on the right wall. Art: x=922,y=250,w=68,h=180 on 1152×864, padded for taps.
        bedroom: { to: "gorbo-bed", label: "Gorbo's bedroom", door: { left: 76.39, top: 26.62, width: 13.02, height: 25.46 } }
      },
      tasks: ["Squash the sneaky login bug", "Tighten loose bolts in the app", "Read crash logs with the magnifier", "Polish buttons till they shine"],
      dialog: ["Oi! Mind the wires — they bite. Only a little.", "Found three bugs today. Dot ate one. Don't tell.", "App's running smooth as river stones!", "Dot's napping in her tiny bed. Shhh. 🐞", "Need something fixed? Gorbo's on it!"]
    },
    loria: {
      name: "Loria", role: "My Leisure Time Manager & Social Media", house: "Loria's Bookshop",
      hotspot: { left: 32, top: 58, width: 62, height: 36 },
      room: {
        aspect: 720 / 1280, zoom: 1, // whole 16:9 cutaway fits a phone, so both doors are on screen
        backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)",
        poses: {
          idle: "assets/loria-house-v3-idle.webp",
          working: "assets/loria-house-v3-working.webp",
          sitting: "assets/loria-house-v3-sitting.webp"
        },
        // far-left bedroom door. Art: x=66,y=352,w=64,h=180 on 1280×720, padded for taps.
        bedroom: { to: "loria-bed", label: "Loria's bedroom", door: { left: 1.5, top: 47.2, width: 12.3, height: 28.2 } },
        // round hobbit door in the middle entry room — still leads to Scout's burrow
        links: [{ to: "burrow", label: "Down to Scout's burrow", icon: "down", zone: { left: 45, top: 26, width: 12, height: 36 } }]
      },
      tasks: ["Schedule posts for My Leisure Time", "Test the new game level", "Reply to fan comments", "Shelve the cozy novels"],
      dialog: ["Oh hi! Want a book rec? I have, um, all of them.", "Today's post got so many hearts! 💖", "My Leisure Time update is coming along nicely~", "Tea, a book, and a good game. Perfect day.", "Let me snap a pic for the town feed! 📸", "Scout dug up the best research for today's post. He's a gem! 🦊", "Need facts? Knock on the round door — Scout's burrow is right below!"]
    },
    scout: {
      name: "Scout", role: "Research Expert · Loria's Assistant", house: "Scout's Cottage",
      mapImage: "assets/scout-house-exterior.webp",
      // Sits on the grass left of the path, between Lotus Cottage and the bookshop, clear of their tap areas.
      // Box aspect matches the exterior (711×938) on the 720×1280 map.
      hotspot: { left: 12.5, top: 40.5, width: 17, height: 12.62 },
      room: {
        aspect: 864 / 1152,
        backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        poses: {
          idle: "assets/scout-house-v3-idle.webp",
          working: "assets/scout-house-v3-working.webp",
          sitting: "assets/scout-house-v3-sitting.webp"
        },
        // bedroom door on the back wall. Art roughly x=652–698, y=380–505 on 1152×864, padded for taps.
        bedroom: { to: "scout-bed", label: "Scout's bedroom", door: { left: 52.08, top: 40.51, width: 11.28, height: 20.83 } }
      },
      tasks: ["Research trending cozy games", "Summarize fan feedback for Loria", "Fact-check this week's posts", "Map out My Leisure Time competitors"],
      dialog: ["Ooh, a visitor! Want to hear a fun fact?", "I found three new sources this morning! *tail wag*", "Loria says I'm the best fact-fetcher in town. 🦊", "Did you know foxes can hear a watch ticking 40 yards away?", "My notes are a bit messy, but I know where everything is!", "The round door in Loria's shop still leads down to my burrow."]
    },
    // Underground room under Loria's bookshop. Still a sprite scene — he isn't painted into this one.
    burrow: {
      name: "Scout", role: "Research Expert · Loria's Assistant", house: "Scout's Burrow",
      sprite: "assets/scout.png", spriteHeight: 25,
      room: {
        image: "assets/room-scout.webp",
        backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        work: { x: 35, y: 70 }, hangout: { x: 68, y: 72 }, visitor: { x: 55, y: 80 }, door: null,
        links: [{ to: "loria", label: "Up to Loria's", icon: "up" }]
      },
      tasks: ["Sort burrow notes", "File clippings for Loria", "Sketch a map of the hill", "Restock the snack tin"],
      dialog: ["This is the burrow under the bookshop. Mind the ladder!", "I keep the spare research down here.", "It's cooler underground. Good for thinking.", "Up the round door and you're back in Loria's shop.", "My cottage is up on the hill if you want the sunny room."]
    },
    "olithia-bed": {
      name: "Olithia", role: "Bedroom", house: "Lotus Cottage",
      gallery: true, returnTo: "olithia",
      room: { image: "assets/olithia-bedroom.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)" }
    },
    "gorbo-bed": {
      name: "Gorbo", role: "Bedroom", house: "Mossy Workshop",
      gallery: true, returnTo: "gorbo",
      room: { image: "assets/gorbo-bedroom-v2.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)" }
    },
    "loria-bed": {
      name: "Loria", role: "Bedroom", house: "Loria's Bookshop",
      gallery: true, returnTo: "loria",
      room: { image: "assets/loria-bedroom.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)" }
    },
    "scout-bed": {
      name: "Scout", role: "Bedroom", house: "Scout's Cottage",
      gallery: true, returnTo: "scout",
      room: { image: "assets/scout-bedroom.webp", aspect: 864 / 1152, backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)" }
    }
  }
};
