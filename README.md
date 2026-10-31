# Goddess Loadouts

Delta Force Operations loadout codes from [Goddess](https://www.twitch.tv/goddess)'s stream.

A static site with no build step: open `index.html` or host the folder anywhere (GitHub Pages works).

## Editing

Everything you normally change lives in `js/builds.js`:

- `config`: name, Twitch channel, live status, schedule, socials, and the Midasbuy promo
- `builds`: one entry per gun (weapon, category, import code, optional screenshots, note, clip)

Screenshots go in `images/guns/` and are referenced from each build's `image` and `calibration` fields.
