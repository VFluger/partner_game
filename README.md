# Between Us

A private, in-browser game for two partners to discover the kinks and fantasies they share.

- **No accounts, no server.** Open `index.html` (or host the folder on GitHub Pages / any static host). Progress is kept in `sessionStorage` only, so a refresh is safe but closing the tab erases everything.
- **Setup:** both partners enter a name and pick male/female, choose which topics to include, and agree on what the results show.
- **Play:** pass the phone back and forth. Each question gets **Yes**, **Curious** or **No**. Questions about one partner doing something to the other are asked in both directions and matched separately.
- **Add your own questions** at any point while playing. The partner who added one answers it right away, and the other partner gets it on their turn.
- **Results:** anything you said Yes or Curious to is shown with what each of you picked, grouped into *both in*, *worth exploring*, *curious together* and (optionally) *one-sided*.

Keyboard shortcuts while answering: `Y`/`1` yes, `C`/`2` curious, `N`/`3` no, `Backspace` back.

Questions live in `questions.js`. Add or edit entries there.
