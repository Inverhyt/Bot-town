// ===== Bot Town config: edit names, roles, rooms, spots, tasks, pets & lines here =====
// Room coordinates (x, y) are % of the cutaway image (aspect = height/width, default 3/4; zoom = starting camera zoom); character spots are where their FEET stand.
window.BOT_TOWN = {
  title: "Bot Town",
  player: "olithia", // whose sprite visits other houses
  loadingTips: ["Gorbo is fixing bugs…", "Loria is brewing tea…", "The ladybug is fluffing her pillow…", "Olithia is lighting the fairy lights…", "Mochi is stretching in the sun…", "Loria is shelving new books…", "Scout is digging up facts…", "Scout is sorting his research notes…"],
  characters: {
    olithia: {
      name: "Olithia", role: "Town Keeper (that's you!)", house: "Lotus Cottage",
      sprite: "assets/olithia.png", spriteHeight: 21, // % of room height
      hotspot: { left: 4, top: 3, width: 50, height: 33 }, // tap area on the map, % of map image
      room: { image: "assets/room-olithia.webp", backdrop: "radial-gradient(circle at 50% 45%, #fff1d6, #f3cfa0 55%, #c98f5e)",
        work: { x: 40, y: 83 }, hangout: { x: 67, y: 80 }, visitor: null, door: { x: 55, y: 80 } },
      tasks: ["Plan today's quests", "Check in on Gorbo's bug list", "Water the lotus pond", "Brew chamomile tea"],
      dialog: ["Welcome home! Mochi saved you the sunny spot.", "Shall we check on everyone in town today?", "I made tea — it's still warm!", "Every little task is a tiny adventure. 🌿", "Mochi says mrrp. I think that means hello."],
      pets: [{ name: "Mochi", kind: "attach", box: { left: 0, top: 58, width: 30, height: 42 },
        lines: ["Mrrp! 🐾", "*purrs loudly*", "Mochi demands chin scratches.", "Mew? (Is that tuna?)", "*slow blink* = I love you"] }]
    },
    gorbo: {
      name: "Gorbo", role: "App Mechanic & Bug Wrangler", house: "Mossy Workshop",
      sprite: "assets/gorbo.png", spriteHeight: 22,
      hotspot: { left: 56, top: 25, width: 44, height: 33 },
      room: { image: "assets/room-gorbo.webp", backdrop: "radial-gradient(circle at 50% 45%, #f1ead0, #c9c79a 55%, #7d8a5a)",
        work: { x: 30, y: 74 }, hangout: { x: 71, y: 77 }, visitor: { x: 60, y: 80 }, door: { x: 55, y: 79 } },
      tasks: ["Squash the sneaky login bug", "Tighten loose bolts in the app", "Read crash logs with the magnifier", "Polish buttons till they shine"],
      dialog: ["Oi! Mind the wires — they bite. Only a little.", "Found three bugs today. Dot ate one. Don't tell.", "App's running smooth as river stones!", "Dot's napping in her tiny bed. Shhh. 🐞", "Need something fixed? Gorbo's on it!"],
      pets: [{ name: "Dot", kind: "sprite", sprite: "assets/dot.png", x: 15.5, y: 21.5, size: 3.4, // x,y = where she sits (bottom-center), size = % of room width
        lines: ["*bzz* Hi friend!", "I'm fluffing my pillow!", "Gorbo snores. Very loud.", "Bug report: I am a bug. 🐞", "Zzz… five more minutes…"] }]
    },
    loria: {
      name: "Loria", role: "My Leisure Time Manager & Social Media", house: "Loria's Bookshop",
      sprite: "assets/loria.png", spriteHeight: 27,
      hotspot: { left: 32, top: 58, width: 62, height: 36 },
      room: { image: "assets/room-loria.webp", aspect: 9 / 16, zoom: 1.9, // 16:9 art: study | entry with round door | lounge
        backdrop: "radial-gradient(circle at 50% 45%, #fff0dc, #f2c7a0 55%, #b9674a)",
        work: { x: 29, y: 70 }, hangout: { x: 73, y: 71 }, visitor: { x: 82, y: 77 }, door: { x: 52, y: 73 },
        links: [{ to: "scout", label: "Down to Scout's burrow", icon: "down", zone: { left: 47, top: 29, width: 8, height: 30 } }] }, // zone = the round hobbit door in the lounge
      tasks: ["Schedule posts for My Leisure Time", "Test the new game level", "Reply to fan comments", "Shelve the cozy novels"],
      dialog: ["Oh hi! Want a book rec? I have, um, all of them.", "Today's post got so many hearts! 💖", "My Leisure Time update is coming along nicely~", "Tea, a book, and a good game. Perfect day.", "Let me snap a pic for the town feed! 📸", "Scout dug up the best research for today's post. He's a gem! 🦊", "Need facts? Knock on the round door — Scout's burrow is right below!"],
      pets: [{ name: "Marmalade", kind: "hotspot", left: 22.5, top: 44, width: 7, height: 6.5,
        lines: ["*yawns* …the desk is warm.", "Mrow. Do not move my notebook.", "Purr purr purr.", "I am helping. (sleeping on the papers)", "Marmalade approves of you."] }]
    },
    scout: {
      name: "Scout", role: "Research Expert · Loria's Assistant", house: "Scout's Burrow",
      sprite: "assets/scout.png", spriteHeight: 25,
      mapMarker: "lantern", // small glowing lantern beside Loria's house instead of a full house
      hotspot: { left: 80, top: 82, width: 11, height: 7 },
      room: { image: "assets/room-scout.webp", backdrop: "radial-gradient(circle at 50% 45%, #fff6c8, #f5d36a 55%, #c9952a)",
        work: { x: 35, y: 70 }, hangout: { x: 68, y: 72 }, visitor: { x: 55, y: 80 }, door: null,
        links: [{ to: "loria", label: "Up to Loria's", icon: "up" }] }, // button only
      tasks: ["Research trending cozy games", "Summarize fan feedback for Loria", "Fact-check this week's posts", "Map out My Leisure Time competitors"],
      dialog: ["Ooh, a visitor! Want to hear a fun fact?", "I found three new sources this morning! *tail wag*", "Loria says I'm the best fact-fetcher in town. 🦊", "Did you know foxes can hear a watch ticking 40 yards away?", "My notes are a bit messy, but I know where everything is!", "Right upstairs is Loria's shop. I bring her research every day."]
    }
  }
};
