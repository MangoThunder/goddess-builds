# Goddess Loadouts

Delta Force Operations loadout codes from [Goddess](https://www.twitch.tv/goddess)'s stream.

A static site with no build step: open `index.html` or host the folder anywhere (GitHub Pages works).

## Editing

Everything you normally change lives in `js/builds.js`:

- `config`: name, Twitch channel, live status, schedule, socials, and the Midasbuy promo
- `builds`: one entry per gun (weapon, category, import code, optional screenshots, note, clip)

Screenshots go in `images/guns/` and are referenced from each build's `image` and `calibration` fields.

## Security

- `index.html` sets a Content Security Policy: the page only runs its own scripts, loads fonts from Google Fonts,
  and talks to nothing but decapi.me (for the Twitch live check).
- Every link and image path in `js/builds.js` must be an `https://`/`http://` link or a file in this repo.
  Anything else (like `javascript:`) is dropped and a warning shows in the browser console.
- All text from `builds.js` and from Twitch is shown as plain text, never as HTML.
