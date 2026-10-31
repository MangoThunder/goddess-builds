/*
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE to change the site. No other file needs touching.
 * ─────────────────────────────────────────────────────────────
 *
 *  config  – streamer name, Twitch channel, socials, promo
 *  builds  – one object per loadout. Copy an existing one and change it.
 *
 *  Build fields
 *    id          unique, lowercase letters/numbers/hyphens (used in share links)
 *    weapon      gun name, e.g. "K416"
 *    category    e.g. "Assault Rifle", "SMG" (each value becomes a filter chip)
 *    code        the full import code exactly as the game gives it, e.g.
 *                "K416 Assault Rifle-Operations (Extraction Mode)-6LP2O4O014H9D6PDMV79E"
 *    image       optional, Gunsmith screenshot, e.g. "images/guns/k416.webp"
 *    calibration optional, Calibrate-screen screenshot, e.g. "images/guns/k416-calibration.webp"
 *    note        optional, a sentence from the streamer about the build
 *    clip        optional, link to a Twitch/YouTube clip of the build
 *    featured    optional, true = listed first
 *    updated     optional, "YYYY-MM-DD"
 */
window.GUN_BUILDS = {
  config: {
    name: "Goddess",
    avatar: "images/avatar.png",      // profile picture (blank = initials)
    game: "Delta Force",
    mode: "Operations",
    twitch: "goddess",                // twitch.tv/<this>
    live: "auto",                     // "auto" = red "Live now" box turns on by itself while streaming; true/false forces it
    liveTitle: "",                    // optional; blank = use the current Twitch stream title
    schedule: "",                     // optional, e.g. "Mon–Fri · 7pm ET"
    tagline: "Every Operations loadout I run on stream. Copy the code, import it in the Gunsmith, deploy.",
    showSampleNotice: false,          // true shows a "sample builds" banner
    promo: {
      url: "https://www.midasbuy.com/goddess/dfm",
      eyebrow: "Midasbuy top-up",
      bonus: "+35%",
      headline: "More coins",
      text: "Top up Delta Force coins on Midasbuy through Goddess's link and get up to 35% more.",
      button: "Get coins on Midasbuy"
    },
    socials: [
      { label: "Twitch", url: "https://www.twitch.tv/goddess" },
      { label: "TikTok", url: "https://www.tiktok.com/@goddessdf" }
    ]
  },

  builds: [
    { id: "k437", weapon: "K437", category: "Assault Rifle", featured: true,
      image: "images/guns/k437.webp",
      calibration: "images/guns/k437-calibration.webp",
      code: "K437 Assault Rifle-Operations (Extraction Mode)-6LP9HB40CMO768CQQSIJQ" },
    { id: "k437-red-dot", weapon: "K437 Red Dot", category: "Assault Rifle",
      image: "images/guns/k437-red-dot.webp",
      calibration: "images/guns/k437-red-dot-calibration.webp",
      code: "K437 Assault Rifle-Operations (Extraction Mode)-6LI9ISC0CMO768CQQSIJQ" },
    { id: "ar-57", weapon: "AR-57", category: "Assault Rifle",
      image: "images/guns/ar-57.webp",
      calibration: "images/guns/ar-57-calibration.webp",
      code: "AR-57 Assault Rifle-Operations (Extraction Mode)-6LBBJF00CMO768CQQSIJQ" },
    { id: "mdr", weapon: "MDR", category: "Assault Rifle",
      image: "images/guns/mdr.webp",
      calibration: "images/guns/mdr-calibration.webp",
      code: "MDR Assault Rifle-Operations (Extraction Mode)-6LPFVFO0CMO768CQQSIJQ" },
    { id: "m7", weapon: "M7", category: "Battle Rifle",
      image: "images/guns/m7.webp",
      calibration: "images/guns/m7-calibration.webp",
      code: "M7 Battle Rifle-Operations (Extraction Mode)-6LPFVIO0CMO768CQQSIJQ" }
  ]
};
