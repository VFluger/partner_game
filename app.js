(() => {
  'use strict';

  const STORE_KEY = 'between-us-v1';
  const ANSWERS = {
    yes: { label: 'Yes', hint: "I'm into it", rank: 2 },
    curious: { label: 'Curious', hint: "Maybe — let's talk", rank: 1 },
    no: { label: 'No', hint: 'Not for me', rank: 0 },
  };
  const GENDERS = [
    {
      id: 'female',
      label: 'Female',
      icon: '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V22M8.5 18.5h7"/>',
    },
    {
      id: 'male',
      label: 'Male',
      icon: '<circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6M15 4h5v5"/>',
    },
  ];
  const PRONOUNS = {
    female: { them: 'her', their: 'her' },
    male: { them: 'him', their: 'his' },
  };

  const QMAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
  const CMAP = Object.fromEntries([...CATEGORIES, CUSTOM_CATEGORY].map((c) => [c.id, c]));

  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');

  // ---------- state ----------

  function freshState(players) {
    return {
      phase: 'welcome',
      players: players || [
        { name: '', gender: 'female' },
        { name: '', gender: 'male' },
      ],
      cats: CATEGORIES.map((c) => c.id),
      custom: {},
      items: [],
      answers: [{}, {}],
      turn: 0,
      stack: [],
      lastDone: null,
    };
  }

  // Progress lives in sessionStorage only, so a refresh doesn't lose the game
  // but closing the tab wipes it.
  function load() {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function save() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(S));
    } catch {
      /* private mode etc. — the game still works, it just won't survive a refresh */
    }
  }
  function wipe() {
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }

  let S = load() || freshState();

  // ---------- helpers ----------

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const other = (i) => 1 - i;
  const name = (i) => S.players[i].name;
  const getQ = (id) => S.custom[id] || QMAP[id];

  function fill(tpl, partnerIndex) {
    const p = S.players[partnerIndex];
    const pr = PRONOUNS[p.gender] || PRONOUNS.female;
    return tpl.replace(/\{p\}/g, p.name).replace(/\{them\}/g, pr.them).replace(/\{their\}/g, pr.their);
  }

  function expand(q, cat) {
    if (q.give) {
      return [0, 1]
        .filter((g) => !q.when || q.when(S.players[g].gender, S.players[other(g)].gender))
        .map((g) => ({ key: `${q.id}@${g}`, id: q.id, cat, g }));
    }
    return [{ key: q.id, id: q.id, cat }];
  }

  function buildItems() {
    return QUESTIONS.filter((q) => S.cats.includes(q.cat)).flatMap((q) => expand(q, q.cat));
  }

  const pending = (i) => S.items.filter((it) => !(it.key in S.answers[i]));
  const answeredCount = (i) => S.items.filter((it) => it.key in S.answers[i]).length;

  // What player i sees for an item.
  function promptFor(item, i) {
    const q = getQ(item.id);
    if (item.g === undefined) return { text: q.text };
    const giving = item.g === i;
    const text = fill(giving ? q.give : q.receive, other(i));
    const dir = giving ? `You → ${name(other(i))}` : `${name(other(i))} → you`;
    return { text, dir };
  }

  // Neutral title for the results screen.
  function titleFor(item) {
    const q = getQ(item.id);
    if (item.g === undefined) return { text: q.text };
    const g = name(item.g);
    const r = name(other(item.g));
    if (q.label) return { text: q.label.replace(/\{g\}/g, g).replace(/\{r\}/g, r) };
    return { text: q.give, dir: `${g} → ${r}` };
  }

  function go(phase) {
    S.phase = phase;
    save();
    render();
    window.scrollTo(0, 0);
  }

  // ---------- screens ----------

  function renderWelcome() {
    return `
      <section class="screen center welcome">
        <div class="logo" aria-hidden="true">💞</div>
        <h1>Between Us</h1>
        <p class="lead">A private little game for two. Find out what you're <em>both</em> curious about — without the awkward asking.</p>
        <ol class="steps">
          <li><b>Take turns</b> answering on this device. Each question gets a <span class="pill yes">Yes</span> <span class="pill curious">Curious</span> or <span class="pill no">No</span>.</li>
          <li><b>Add your own</b> questions any time while playing — your partner will get them too.</li>
          <li><b>Reveal together</b> and see only the things you <em>both</em> said Yes or Curious to.</li>
        </ol>
        <p class="fine">🔒 No accounts, nothing uploaded. Everything stays in this browser tab and disappears when you close it.</p>
        <label class="check">
          <input type="checkbox" id="adult" ${S.adult ? 'checked' : ''}>
          <span>We're both adults (18+) and playing this together, by choice.</span>
        </label>
        <button class="btn primary big" data-action="to-setup" ${S.adult ? '' : 'disabled'}>Let's play</button>
      </section>`;
  }

  function renderSetup() {
    const count = buildItems().length;
    const partner = (i) => `
      <fieldset class="card partner g-${S.players[i].gender}">
        <legend>Partner ${i + 1}</legend>
        <label class="field">
          <span>Name</span>
          <input type="text" maxlength="24" autocomplete="off" placeholder="${i ? 'e.g. Sam' : 'e.g. Alex'}"
                 data-input="name" data-i="${i}" value="${esc(S.players[i].name)}">
        </label>
        <div class="seg" role="radiogroup" aria-label="Partner ${i + 1} is">
          ${GENDERS.map(
            (g) => `<button type="button" role="radio" aria-checked="${S.players[i].gender === g.id}"
              class="${S.players[i].gender === g.id ? 'on' : ''}" data-action="gender" data-i="${i}" data-g="${g.id}">
              <svg class="g-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g.icon}</svg>${g.label}</button>`
          ).join('')}
        </div>
      </fieldset>`;

    const ready = S.players.every((p) => p.name.trim()) && count > 0;
    return `
      <section class="screen setup">
        <h1 class="small">Who's playing?</h1>
        <div class="partners">${partner(0)}${partner(1)}</div>

        <h2 class="section">Topics</h2>
        <p class="muted">Tap to leave out anything you'd rather skip entirely.</p>
        <div class="chips">
          ${CATEGORIES.map((c) => {
            const on = S.cats.includes(c.id);
            return `<button type="button" class="chip ${on ? 'on' : ''}" aria-pressed="${on}" data-action="cat" data-cat="${c.id}">
              <span aria-hidden="true">${c.emoji}</span> ${c.name}</button>`;
          }).join('')}
        </div>


        <div class="sticky-cta">
          <button class="btn primary big" data-action="start" ${ready ? '' : 'disabled'}>
            Start · ${count} questions each
          </button>
          ${ready ? '' : `<p class="muted center-text">${count ? 'Enter both names to start.' : 'Pick at least one topic.'}</p>`}
        </div>
      </section>`;
  }

  function renderHandoff() {
    const i = S.turn;
    const left = pending(i).length;
    const returning = answeredCount(i) > 0;
    const done = S.lastDone;
    return `
      <section class="screen center handoff p${i}">
        ${done !== null ? `<p class="done-note">✓ Thanks, ${esc(name(done))}!</p>` : ''}
        <div class="handoff-icon" aria-hidden="true">📱</div>
        <h1>Pass it to <span class="name p${i}">${esc(name(i))}</span></h1>
        <p class="lead">${esc(name(other(i)))}, no peeking 👀</p>
        ${
          returning
            ? `<p class="muted">${esc(name(other(i)))} added ${left} new question${left === 1 ? '' : 's'} while playing. Answer ${left === 1 ? 'it' : 'those'} and you're done.</p>`
            : `<p class="muted">${left} questions. Go with your gut — "Curious" is a perfectly good answer.</p>`
        }
        <button class="btn primary big" data-action="begin-turn">I'm ${esc(name(i))} — start</button>
      </section>`;
  }

  function renderPlay() {
    const i = S.turn;
    const list = pending(i);
    const total = S.items.length;
    const answered = answeredCount(i);

    const header = `
      <header class="bar">
        <span class="who p${i}">${esc(name(i))}</span>
        <span class="count">${Math.min(answered + 1, total)} / ${total}</span>
        <button class="icon-btn" data-action="quit" aria-label="Quit game" title="Quit">✕</button>
      </header>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${answered}">
        <div style="width:${(answered / total) * 100}%"></div>
      </div>`;

    if (!list.length) {
      return `
        <section class="screen play">
          ${header}
          <div class="card q done">
            <div class="big-emoji" aria-hidden="true">🎉</div>
            <h2 class="qtext">All done, ${esc(name(i))}!</h2>
            <p class="muted">Anything else you'd like to ask? Add it now — ${esc(name(other(i)))} will answer it too.</p>
          </div>
          <div class="row">
            <button class="btn ghost" data-action="back" ${S.stack.length ? '' : 'disabled'}>← Change last</button>
            <button class="btn ghost" data-action="add">+ Add a question</button>
          </div>
          <button class="btn primary big" data-action="finish-turn">${
            pending(other(i)).length ? `Hand over to ${esc(name(other(i)))}` : 'Finish'
          }</button>
        </section>`;
    }

    const item = list[0];
    const q = getQ(item.id);
    const cat = CMAP[item.cat] || CUSTOM_CATEGORY;
    const p = promptFor(item, i);
    return `
      <section class="screen play">
        ${header}
        <div class="card q" data-key="${esc(item.key)}">
          <div class="tag"><span aria-hidden="true">${cat.emoji}</span> ${esc(cat.name)}</div>
          <h2 class="qtext">${esc(p.text)}</h2>
          ${p.dir ? `<div class="dir">${esc(p.dir)}</div>` : ''}
          ${q.by !== undefined ? `<div class="by">Added by ${q.by === i ? 'you' : esc(name(q.by))}</div>` : ''}
        </div>
        <div class="answers">
          ${Object.entries(ANSWERS)
            .map(
              ([k, a]) => `<button class="ans ${k}" data-action="answer" data-val="${k}">
                <b>${a.label}</b><small>${a.hint}</small></button>`
            )
            .join('')}
        </div>
        <div class="row">
          <button class="btn ghost" data-action="back" ${S.stack.length ? '' : 'disabled'}>← Back</button>
          <button class="btn ghost" data-action="add">+ Add a question</button>
        </div>
      </section>`;
  }

  function renderReveal() {
    return `
      <section class="screen center reveal">
        <div class="logo" aria-hidden="true">💌</div>
        <h1>You're both done</h1>
        <p class="lead">Sit together for this one, ${esc(name(0))} & ${esc(name(1))}.</p>
        <p class="muted">You'll only see the things you <em>both</em> said Yes or Curious to. A No from either of you stays private.</p>
        <button class="btn primary big" data-action="show-results">Reveal 💞</button>
      </section>`;
  }

  function computeResults() {
    const rows = S.items.map((item) => {
      const a = S.answers[0][item.key];
      const b = S.answers[1][item.key];
      return { item, a, b, ra: ANSWERS[a].rank, rb: ANSWERS[b].rank };
    });
    const groups = [
      { id: 'both', title: "You're both in", emoji: '🔥', note: 'You both said yes. What are you waiting for?', rows: [] },
      { id: 'explore', title: 'Worth exploring', emoji: '💫', note: 'One yes, one curious — a great place to start.', rows: [] },
      { id: 'curious', title: 'Curious together', emoji: '🌱', note: 'Neither of you is sure yet. Talk it through, go slow.', rows: [] },
    ];
    // Shown only when both are at least curious; a No from either side hides it.
    for (const r of rows) {
      if (!r.ra || !r.rb) continue;
      const sum = r.ra + r.rb;
      groups[sum === 4 ? 0 : sum === 3 ? 1 : 2].rows.push(r);
    }
    return { groups: groups.filter((g) => g.rows.length), total: rows.length };
  }

  function renderResults() {
    const { groups, total } = computeResults();
    const matches = groups.reduce((n, g) => n + g.rows.length, 0);
    const chip = (i, v) =>
      `<span class="ans-chip ${v}"><span class="dot p${i}" aria-hidden="true"></span>${esc(name(i))} · ${ANSWERS[v].label}</span>`;

    const body = groups.length
      ? groups
          .map(
            (g) => `
        <section class="group ${g.id}">
          <h2 class="section"><span aria-hidden="true">${g.emoji}</span> ${g.title} <span class="n">${g.rows.length}</span></h2>
          <p class="muted">${g.note}</p>
          <ul class="results">
            ${g.rows
              .map(({ item, a, b }) => {
                const t = titleFor(item);
                const cat = CMAP[item.cat] || CUSTOM_CATEGORY;
                return `<li class="card result">
                  <div class="r-title"><span class="r-emoji" aria-hidden="true">${cat.emoji}</span>
                    <span>${esc(t.text)}${t.dir ? ` <span class="dir inline">${esc(t.dir)}</span>` : ''}</span></div>
                  <div class="r-answers">${chip(0, a)}${chip(1, b)}</div>
                </li>`;
              })
              .join('')}
          </ul>
        </section>`
          )
          .join('')
      : `<div class="card empty"><p>No overlaps this time.</p><p class="muted">That's useful to know too. Try adding your own questions next round.</p></div>`;

    return `
      <section class="screen results-screen">
        <header class="results-head">
          <h1 class="small"><span class="name p0">${esc(name(0))}</span> & <span class="name p1">${esc(name(1))}</span></h1>
          <p class="stat"><b>${matches}</b> shared interest${matches === 1 ? '' : 's'} out of ${total} questions</p>
        </header>
        ${body}
        <div class="end-actions">
          <button class="btn ghost" data-action="copy">Copy results</button>
          <button class="btn ghost" data-action="again">Play again</button>
          <button class="btn danger" data-action="reset">Erase everything</button>
        </div>
      </section>`;
  }

  // ---------- modals ----------

  function openAddModal() {
    const i = S.turn;
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal">
        <form class="modal card" role="dialog" aria-modal="true" aria-labelledby="add-title" id="add-form">
          <h2 id="add-title">Add a question</h2>
          <p class="muted">You'll answer it next, and ${esc(name(other(i)))} will get it on ${(PRONOUNS[S.players[other(i)].gender] || PRONOUNS.female).their} turn. Nobody sees anyone's answers until the end.</p>
          <div class="seg wide" role="radiogroup" aria-label="Question type">
            <button type="button" role="radio" aria-checked="true" class="on" data-kind="shared">Something we do together</button>
            <button type="button" role="radio" aria-checked="false" data-kind="dir">One does it to the other</button>
          </div>
          <div data-kind-panel="shared">
            <label class="field"><span>Question</span>
              <input type="text" name="text" maxlength="120" placeholder="e.g. Skinny dipping at night"></label>
          </div>
          <div data-kind-panel="dir" hidden>
            <label class="field"><span>The one doing it</span>
              <input type="text" name="give" maxlength="120" placeholder="e.g. Giving a sensual foot rub"></label>
            <label class="field"><span>The one receiving it</span>
              <input type="text" name="receive" maxlength="120" placeholder="e.g. Getting a sensual foot rub"></label>
            <p class="muted small-print">It's asked both ways — ${esc(name(i))} → ${esc(name(other(i)))} and ${esc(name(other(i)))} → ${esc(name(i))}.</p>
          </div>
          <p class="error" hidden></p>
          <div class="row">
            <button type="button" class="btn ghost" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn primary">Add & answer</button>
          </div>
        </form>
      </div>`;

    const form = modalRoot.querySelector('form');
    let kind = 'shared';
    form.querySelectorAll('[data-kind]').forEach((b) =>
      b.addEventListener('click', () => {
        kind = b.dataset.kind;
        form.querySelectorAll('[data-kind]').forEach((x) => {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-checked', x === b);
        });
        form.querySelectorAll('[data-kind-panel]').forEach((p) => (p.hidden = p.dataset.kindPanel !== kind));
        form.querySelector(`[data-kind-panel="${kind}"] input`).focus();
      })
    );
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (n) => form.elements[n].value.trim();
      const err = form.querySelector('.error');
      let q;
      if (kind === 'shared') {
        if (!val('text')) return showErr(err, 'Type a question first.');
        q = { text: val('text') };
      } else {
        if (!val('give') || !val('receive')) return showErr(err, 'Fill in both sides.');
        q = { give: val('give'), receive: val('receive') };
      }
      addCustom(q);
      closeModal();
    });
    setTimeout(() => form.querySelector('input[name="text"]').focus(), 30);
  }

  function showErr(el, msg) {
    el.textContent = msg;
    el.hidden = false;
  }

  function closeModal() {
    modalRoot.innerHTML = '';
  }

  function confirmModal(title, text, okLabel, onOk) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal card" role="alertdialog" aria-modal="true" aria-labelledby="c-title">
          <h2 id="c-title">${title}</h2>
          <p class="muted">${text}</p>
          <div class="row">
            <button type="button" class="btn ghost" data-action="close-modal">Cancel</button>
            <button type="button" class="btn danger" id="c-ok">${okLabel}</button>
          </div>
        </div>
      </div>`;
    const ok = modalRoot.querySelector('#c-ok');
    ok.addEventListener('click', () => {
      closeModal();
      onOk();
    });
    ok.focus();
  }

  function addCustom(q) {
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    S.custom[id] = { ...q, by: S.turn };
    const newItems = q.give
      ? [S.turn, other(S.turn)].map((g) => ({ key: `${id}@${g}`, id, cat: 'custom', g }))
      : [{ key: id, id, cat: 'custom' }];
    // Slot it in right before the current question so the author answers it next.
    const current = pending(S.turn)[0];
    const at = current ? S.items.indexOf(current) : S.items.length;
    S.items.splice(at, 0, ...newItems);
    save();
    render();
  }

  // ---------- actions ----------

  function answer(val) {
    const item = pending(S.turn)[0];
    if (!item) return;
    S.answers[S.turn][item.key] = val;
    S.stack.push(item.key);
    save();
    render();
  }

  function back() {
    const key = S.stack.pop();
    if (key === undefined) return;
    delete S.answers[S.turn][key];
    save();
    render();
  }

  function finishTurn() {
    S.lastDone = S.turn;
    S.stack = [];
    const nxt = other(S.turn);
    if (pending(nxt).length) {
      S.turn = nxt;
      go('handoff');
    } else {
      go('reveal');
    }
  }

  function resultsText() {
    const { groups } = computeResults();
    const lines = [`Between Us — ${name(0)} & ${name(1)}`, ''];
    for (const g of groups) {
      lines.push(`${g.emoji} ${g.title}`);
      for (const { item, a, b } of g.rows) {
        const t = titleFor(item);
        lines.push(`• ${t.text}${t.dir ? ` (${t.dir})` : ''} — ${name(0)}: ${ANSWERS[a].label}, ${name(1)}: ${ANSWERS[b].label}`);
      }
      lines.push('');
    }
    if (!groups.length) lines.push('No overlaps this time.');
    return lines.join('\n').trim();
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  const actions = {
    'to-setup': () => go('setup'),
    gender: (el) => {
      S.players[+el.dataset.i].gender = el.dataset.g;
      save();
      render();
    },
    cat: (el) => {
      const c = el.dataset.cat;
      S.cats = S.cats.includes(c) ? S.cats.filter((x) => x !== c) : [...S.cats, c];
      save();
      render();
    },
    start: () => {
      S.players.forEach((p) => (p.name = p.name.trim()));
      S.items = buildItems();
      S.answers = [{}, {}];
      S.custom = {};
      S.turn = 0;
      S.stack = [];
      S.lastDone = null;
      go('handoff');
    },
    'begin-turn': () => go('play'),
    answer: (el) => answer(el.dataset.val),
    back,
    add: openAddModal,
    'close-modal': (el, e) => {
      if (e.target === el) closeModal();
    },
    'finish-turn': finishTurn,
    quit: () =>
      confirmModal('Quit this game?', 'All answers so far will be erased.', 'Quit & erase', () => {
        S = freshState(S.players);
        S.adult = true;
        go('setup');
      }),
    'show-results': () => go('results'),
    copy: async () => {
      try {
        await navigator.clipboard.writeText(resultsText());
        toast('Copied to clipboard');
      } catch {
        toast("Couldn't copy — try selecting the text");
      }
    },
    again: () => {
      S = freshState(S.players);
      S.adult = true;
      go('setup');
    },
    reset: () =>
      confirmModal('Erase everything?', 'Names and answers will be wiped from this browser.', 'Erase', () => {
        wipe();
        S = freshState();
        render();
      }),
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el, e);
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.input === 'name') {
      S.players[+el.dataset.i].name = el.value;
      save();
      // Update just the start button so the input keeps focus.
      const btn = app.querySelector('[data-action="start"]');
      const ready = S.players.every((p) => p.name.trim()) && S.cats.length;
      if (btn) btn.disabled = !ready;
      const hint = app.querySelector('.sticky-cta .muted');
      if (hint) hint.hidden = !!ready;
    } else if (el.id === 'adult') {
      S.adult = el.checked;
      save();
      app.querySelector('[data-action="to-setup"]').disabled = !el.checked;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modalRoot.firstChild) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (S.phase !== 'play' || e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'y' || k === '1') answer('yes');
    else if (k === 'c' || k === 'm' || k === '2') answer('curious');
    else if (k === 'n' || k === '3') answer('no');
    else if (k === 'backspace' || k === 'arrowleft') back();
    else return;
    e.preventDefault();
  });

  // ---------- render ----------

  const SCREENS = {
    welcome: renderWelcome,
    setup: renderSetup,
    handoff: renderHandoff,
    play: renderPlay,
    reveal: renderReveal,
    results: renderResults,
  };

  function render() {
    app.innerHTML = (SCREENS[S.phase] || renderWelcome)();
    // The site footer only shows on the welcome and results screens, never mid-game.
    document.body.dataset.phase = S.phase;
  }

  render();
})();
