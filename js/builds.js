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
    live: false,                      // set to true while streaming to show the red "Live now" box
    liveTitle: "",                    // optional stream title shown when live is true
    schedule: "",                     // optional, e.g. "Mon–Fri · 7pm ET"
    tagline: "Every Operations loadout I run on stream. Copy the code, import it in the Gunsmith, deploy.",
    showSampleNotice: true,           // set to false once the real builds are in
    promo: {
      url: "https://www.midasbuy.com/goddess/dfm",
      eyebrow: "Midasbuy top-up",
      bonus: "+35%",
      headline: "More coins",
      text: "Top up Delta Force coins on Midasbuy through Goddess's link and get up to 35% more.",
      button: "Get coins on Midasbuy"
    },
    socials: [
      { label: "Twitch", url: "https://www.twitch.tv/goddess" }
    ]
  },

  // SAMPLE BUILDS: placeholders so the layout can be seen. Replace with Goddess's real codes.
  builds: [
    { id: "k416", weapon: "K416", category: "Assault Rifle", featured: true,
      code: "K416 Assault Rifle-Operations (Extraction Mode)-SAMPLE-REPLACE-ME",
      note: "Sample note. Replace with what Goddess says about this build." },
    { id: "m4a1", weapon: "M4A1", category: "Assault Rifle",
      code: "M4A1 Assault Rifle-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" },
    { id: "ak-12", weapon: "AK-12", category: "Assault Rifle",
      code: "AK-12 Assault Rifle-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" },
    { id: "vector", weapon: "Vector", category: "SMG",
      code: "Vector Submachine Gun-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" },
    { id: "mp7", weapon: "MP7", category: "SMG",
      code: "MP7 Submachine Gun-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" },
    { id: "sr-25", weapon: "SR-25", category: "Marksman Rifle",
      code: "SR-25 Marksman Rifle-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" },
    { id: "awm", weapon: "AWM", category: "Sniper Rifle",
      code: "AWM Sniper Rifle-Operations (Extraction Mode)-SAMPLE-REPLACE-ME" }
  ]
};
