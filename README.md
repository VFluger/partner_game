# Between Us

A private, in-browser game for two partners to discover the kinks and fantasies they share.

- **No accounts, no server.** Open `index.html` (or host the folder on GitHub Pages / any static host). Progress is kept in `sessionStorage` only, so a refresh is safe but closing the tab erases everything.
- **Setup:** both partners enter a name, pick male/female and choose which topics to include.
- **Play:** pass the phone back and forth. Each question gets **Yes**, **Curious** or **No**. Questions about one partner doing something to the other are asked in both directions and matched separately.
- **Add your own questions** at any point while playing. The partner who added one answers it right away, and the other partner gets it on their turn.
- **Results:** a question is shown only when *both* of you said at least Curious (Yes + Yes, Yes + Curious, or Curious + Curious), together with what each of you picked. If either of you said No, it stays hidden.

Keyboard shortcuts while answering: `Y`/`1` yes, `C`/`2` curious, `N`/`3` no, `Backspace` back.

Questions live in `questions.js`. Add or edit entries there.

## Hosting

The site is plain static files, ready for GitHub Pages (Settings → Pages → deploy from `main`, root folder). It will be served at <https://vfluger.github.io/partner_game/>, which is the URL used in the canonical link, Open Graph tags, `robots.txt` and `sitemap.xml`. Update those if you host it somewhere else.
