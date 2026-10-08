# Between Us

A private, in-browser game for two partners to discover the kinks and fantasies they share.

- **No accounts, no server.** Open `index.html` (or host the folder on GitHub Pages / any static host). Progress is kept in `sessionStorage` only, so a refresh is safe but closing the tab erases everything.
- **Setup:** both partners enter a name, pick male/female and choose which topics to include.
- **Play:** pass the phone back and forth over two rounds each (Alex, Sam, Alex, Sam). Each question gets **Yes**, **Curious** or **No**. Every partner gets their own shuffled order. Questions about one partner doing something to the other are asked in both directions and matched separately.
- **Add your own questions** while playing (except in the very last round). The author answers it straight away, and it is shuffled into the other partner's next round. It looks exactly like a built-in question: no label, and the author picks a normal topic for it. Because a random handful of built-in questions is always held back for each partner's second round, round 2 never looks like "answer the new questions".
- **Results:** a question is shown only when *both* of you said at least Curious (Yes + Yes, Yes + Curious, or Curious + Curious), together with what each of you picked. If either of you said No, it stays hidden.

Keyboard shortcuts while answering: `Y`/`1` yes, `C`/`2` curious, `N`/`3` no, `Backspace` back.

Questions live in `questions.js`. Add or edit entries there.

## Hosting

The site is plain static files, ready for GitHub Pages (Settings → Pages → deploy from `main`, root folder). It will be served at <https://vfluger.github.io/partner_game/>, which is the URL used in the canonical link, Open Graph tags, `robots.txt` and `sitemap.xml`. Update those if you host it somewhere else.
