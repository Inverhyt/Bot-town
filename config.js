// ===== Bot Town config: edit names, roles, rooms, spots, tasks, pets & lines here =====
// Room coordinates are % of the cutaway image (aspect = height/width).
// Painted houses use poses (idle / working / sitting) instead of a separate character sprite.
// Door rects are % so they scale; they were measured in image pixels and padded a little for fingers.
window.BOT_TOWN = {
  title: "Bot Town",
  player: "olithia", // whose sprite visits the burrow
  sleepHours: [22, 7], // local time: bedrooms show their sleeping image from 22:00 until 07:00
  loadingTips: ["Gorbo is fixing bugs…", "Loria is brewing tea…", "The ladybug is fluffing her pillow…", "Olithia is lighting the fairy lights…", "Mochi is stretching in the sun…", "Loria is shelving new books…", "Scout is digging up facts…", "Scout is sorting his research notes…"],
  characters: {
    olithia: {
      name: "Olithia", role: "Town Keeper (that's you!)", house: "Lotus Cottage",
      sprite: "assets/olithia.png", spriteHeight: 21, // only used when she visits the burrow
      hotspot: { left: 9.7, top: 1.3, width: 45.8, height: 15.3 },
      room: {
        aspect: 864 / 1152,
        backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)",
        poses: {
          idle: "assets/olithia-house-v4-idle.webp",
          working: "assets/olithia-house-v4-working.webp",
          sitting: "assets/olithia-house-v4-sitting.webp"
        },
        // arched bedroom doorway in the left room. Art: x=445,y=130,w=150,h=390 on 1152×864.
        bedroom: { to: "olithia-bed", label: "Olithia's bedroom", door: { left: 38.63, top: 15.05, width: 13.02, height: 45.14 } }
      },
      tasks: ["Plan today's quests", "Check in on Gorbo's bug list", "Water the lotus pond", "Brew chamomile tea"],
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
        bedroom: { to: "gorbo-bed", label: "Gorbo's bedroom", door: { left: 76.39, top: 26.62, width: 13.02, height: 24.3 } }
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
        bedroom: { to: "loria-bed", label: "Loria's bedroom", door: { left: 1.5, top: 47.2, width: 12.3, height: 28.2 } },
        // round hobbit door in the middle entry room — still leads to Scout's burrow
        links: [{ to: "burrow", label: "Down to Scout's burrow", icon: "down", zone: { left: 45, top: 26, width: 12, height: 36 } }]
      },
      tasks: ["Schedule posts for My Leisure Time", "Test the new game level", "Reply to fan comments", "Shelve the cozy novels"],
      dialog: ["Oh hi! Want a book rec? I have, um, all of them.", "Today's post got so many hearts! 💖", "My Leisure Time update is coming along nicely~", "Tea, a book, and a good game. Perfect day.", "Let me snap a pic for the town feed! 📸", "Scout dug up the best research for today's post. He's a gem! 🦊", "Need facts? Knock on the round door — Scout's burrow is right below!"]
    },
    scout: {
      name: "Scout", role: "Research Expert · Loria's Assistant", house: "Scout's Cottage",
      hotspot: { left: 1.7, top: 54.5, width: 50.4, height: 22.4 },
      room: {
        aspect: 864 / 1152,
        backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        poses: {
          idle: "assets/scout-house-v4-idle.webp",
          working: "assets/scout-house-v4-working.webp",
          sitting: "assets/scout-house-v4-sitting.webp"
        },
        // Olithia visiting: tap the seating area (armchair, tea table and sofa. Art: x=546–889, y=562–765 on 1152×864) to sit together
        visit: "assets/scout-house-v4-visit.webp", seat: { left: 47.4, top: 65.1, width: 29.8, height: 23.4 },
        // bedroom door on the back wall. Art: x=645-690, y=368-487 on 1152×864.
        bedroom: { to: "scout-bed", label: "Scout's bedroom", door: { left: 55.1, top: 41.7, width: 6.9, height: 15.6 } }
      },
      tasks: ["Research trending cozy games", "Summarize fan feedback for Loria", "Fact-check this week's posts", "Map out My Leisure Time competitors"],
      dialog: ["Ooh, a visitor! Want to hear a fun fact?", "I found three new sources this morning! *tail wag*", "Loria says I'm the best fact-fetcher in town. 🦊", "Did you know foxes can hear a watch ticking 40 yards away?", "My notes are a bit messy, but I know where everything is!", "The round door in Loria's shop still leads down to my burrow."]
    },
    // Painted into the bottom of the map. The tap opens the tall park.
    starfall: {
      name: "Starfall Hill", role: "Park", house: "Starfall Hill",
      gallery: true,
      hotspot: { left: 0, top: 76.9, width: 100, height: 23.1 },
      room: {
        // Tall park that scrolls vertically like the map (720x2260). The night image is used from 19:00 to 06:00 local time.
        image: "assets/starfall-hill-v2.webp", night: "assets/starfall-hill-v2-night.webp", nightHours: [19, 6],
        aspect: 2260 / 720, scroll: true,
        backdrop: "radial-gradient(circle at 50% 38%, #4a3568, #2a1c40 55%, #140e22)",
        glows: [], // the lantern light is painted into the art
        // tap zones (percent of the scene) that show a caption bubble
        spots: [
          { label: "Hill crest", caption: "Olithia plays her handpan under the blossom tree.", zone: { left: 26.8, top: 1.8, width: 61.4, height: 20.3 } },
          { label: "Stargazing spot", caption: "Scout's telescope and the picnic blankets.", zone: { left: 15.3, top: 28.1, width: 72.9, height: 14.0 } },
          { label: "Noticeboard", caption: "Town notes, lost mittens and tea invites.", zone: { left: 41.4, top: 61.1, width: 19.2, height: 7.9 } },
          { label: "Tea pavilion", caption: "Gorbo and Dot keep the shared teapot warm.", zone: { left: 60.6, top: 52.5, width: 39.4, height: 20.7 } },
          { label: "Willow reading nook", caption: "Loria reads under the lantern-lit willow.", zone: { left: 0, top: 64.7, width: 38.3, height: 28.1 } },
          { label: "Book-swap box", caption: "Take a book, leave a book.", zone: { left: 38.3, top: 76.3, width: 19.2, height: 9.8 } },
          { label: "Seasonal market", caption: "Pumpkins, apples and jam this season.", zone: { left: 74.7, top: 79.4, width: 25.3, height: 20.6 } }
        ]
      }
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
      room: { image: "assets/olithia-bedroom-v2.webp", sleeping: "assets/olithia-bedroom-v2-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)" }
    },
    "gorbo-bed": {
      name: "Gorbo", role: "Bedroom", house: "Mossy Workshop",
      gallery: true, returnTo: "gorbo",
      room: { image: "assets/gorbo-bedroom-v4.webp", sleeping: "assets/gorbo-bedroom-v4-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)" }
    },
    "loria-bed": {
      name: "Loria", role: "Bedroom", house: "Loria's Bookshop",
      gallery: true, returnTo: "loria",
      room: { image: "assets/loria-bedroom-v4.webp", sleeping: "assets/loria-bedroom-v4-sleeping.webp", aspect: 720 / 1280, backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)" }
    },
    "scout-bed": {
      name: "Scout", role: "Bedroom", house: "Scout's Cottage",
      gallery: true, returnTo: "scout",
      room: { image: "assets/scout-bedroom-v4.webp", sleeping: "assets/scout-bedroom-v4-sleeping.webp", aspect: 864 / 1152, backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)" }
    }
  }
};
