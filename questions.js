// Question bank.
//
// Two kinds of questions:
//   - Shared:      { id, cat, text }               — the same for both partners.
//   - Directional: { id, cat, give, receive, label, when? }
//       Something one partner does to the other. It is asked twice (once for
//       each direction), so "Alex spanks Sam" and "Sam spanks Alex" are matched
//       separately. `give` is shown to the giver, `receive` to the receiver.
//       `label` is what the results screen shows ({g} = giver, {r} = receiver).
//       `when(giverGender, receiverGender)` can hide directions that don't apply.
//
// Placeholders in give/receive: {p} = the partner's name, {them} / {their} = their pronouns.

const CATEGORIES = [
  { id: 'sensual', name: 'Sensual', emoji: '🕯️' },
  { id: 'talk', name: 'Talk & tease', emoji: '💬' },
  { id: 'adventure', name: 'Places & adventure', emoji: '🌙' },
  { id: 'toys', name: 'Toys & props', emoji: '🎁' },
  { id: 'power', name: 'Power play', emoji: '👑' },
  { id: 'bondage', name: 'Restraint & sensation', emoji: '🎀' },
  { id: 'impact', name: 'Impact', emoji: '🖐️' },
  { id: 'roleplay', name: 'Roleplay', emoji: '🎭' },
  { id: 'explore', name: 'Going further', emoji: '🔥' },
];

const CUSTOM_CATEGORY = { id: 'custom', name: 'Added by you', emoji: '✨' };

const isMale = (g) => g === 'male';
const isFemale = (g) => g === 'female';

const QUESTIONS = [
  // Sensual
  { id: 'massage', cat: 'sensual', give: 'Giving {p} a slow, full-body massage', receive: 'Getting a slow, full-body massage from {p}', label: '{g} gives {r} a full-body massage' },
  { id: 'bath', cat: 'sensual', text: 'Taking a bath or shower together' },
  { id: 'slow', cat: 'sensual', text: 'Slow, candlelit sex with lots of eye contact' },
  { id: 'morning', cat: 'sensual', text: 'Morning sex' },
  { id: 'quickie', cat: 'sensual', text: 'A spontaneous quickie' },
  { id: 'kissall', cat: 'sensual', give: 'Kissing {p} all over, taking your time', receive: 'Being kissed all over by {p}', label: '{g} kisses {r} all over' },
  { id: 'oral', cat: 'sensual', give: 'Going down on {p}', receive: '{p} going down on you', label: '{g} goes down on {r}' },
  { id: 'sixtynine', cat: 'sensual', text: 'Sixty-nine' },

  // Talk & tease
  { id: 'dirtytalk', cat: 'talk', text: 'Talking dirty during sex' },
  { id: 'sexting', cat: 'talk', text: 'Sexting and flirty messages during the day' },
  { id: 'nudes', cat: 'talk', give: 'Sending {p} nude or sexy photos', receive: 'Getting nude or sexy photos from {p}', label: '{g} sends {r} sexy photos' },
  { id: 'fantasies', cat: 'talk', text: 'Telling each other our fantasies in detail' },
  { id: 'praise', cat: 'talk', give: 'Praising {p} during sex ("good girl", "good boy"…)', receive: 'Being praised by {p} during sex', label: '{g} praises {r} during sex' },
  { id: 'porn', cat: 'talk', text: 'Watching porn or reading erotica together' },
  { id: 'strip', cat: 'talk', give: 'Doing a striptease or lap dance for {p}', receive: 'Getting a striptease or lap dance from {p}', label: '{g} does a striptease for {r}' },
  { id: 'lingerie', cat: 'talk', give: 'Dressing up in lingerie or something sexy for {p}', receive: '{p} dressing up in lingerie or something sexy for you', label: '{g} dresses up sexy for {r}' },

  // Places & adventure
  { id: 'outdoors', cat: 'adventure', text: 'Sex outdoors somewhere secluded' },
  { id: 'risky', cat: 'adventure', text: 'Sex somewhere we might get caught' },
  { id: 'mirror', cat: 'adventure', text: 'Sex in front of a mirror' },
  { id: 'filming', cat: 'adventure', text: 'Filming or photographing ourselves (just for us)' },
  { id: 'positions', cat: 'adventure', text: 'Working through a list of new positions' },
  { id: 'hotel', cat: 'adventure', text: 'A weekend away in a hotel just for sex' },
  { id: 'mutualmast', cat: 'adventure', text: 'Watching each other masturbate' },

  // Toys & props
  { id: 'vibrator', cat: 'toys', text: 'Using a vibrator together' },
  { id: 'remote', cat: 'toys', give: 'Controlling a remote toy that {p} wears out in public', receive: 'Wearing a remote toy in public while {p} controls it', label: '{g} controls a remote toy {r} wears in public' },
  { id: 'toyshop', cat: 'toys', text: 'Shopping for new toys together' },
  { id: 'edible', cat: 'toys', text: 'Massage oil, flavoured lube or edible body paint' },
  { id: 'strapon', cat: 'toys', give: 'Using a strap-on on {p}', receive: '{p} using a strap-on on you', label: '{g} uses a strap-on on {r}', when: (g) => !isMale(g) },
  { id: 'furniture', cat: 'toys', text: 'A sex swing, wedge pillow or other "furniture"' },

  // Power play
  { id: 'dom', cat: 'power', give: 'Being dominant and taking charge of {p}', receive: 'Being submissive and letting {p} take charge', label: '{g} dominates {r}' },
  { id: 'pin', cat: 'power', give: 'Pinning {p} down', receive: 'Being pinned down by {p}', label: '{g} pins {r} down' },
  { id: 'hair', cat: 'power', give: "Pulling {p}'s hair", receive: 'Having your hair pulled by {p}', label: "{g} pulls {r}'s hair" },
  { id: 'edging', cat: 'power', give: 'Deciding when {p} is allowed to finish (edging)', receive: '{p} deciding when you are allowed to finish (edging)', label: '{g} controls when {r} finishes' },
  { id: 'degrade', cat: 'power', give: 'Calling {p} dirty or degrading names', receive: 'Being called dirty or degrading names by {p}', label: '{g} calls {r} dirty names' },
  { id: 'bite', cat: 'power', give: 'Biting {p} or leaving marks', receive: 'Being bitten or marked by {p}', label: '{g} bites and marks {r}' },

  // Restraint & sensation
  { id: 'tie', cat: 'bondage', give: 'Tying {p} up or handcuffing {them}', receive: 'Being tied up or handcuffed by {p}', label: '{g} ties up {r}' },
  { id: 'blindfold', cat: 'bondage', give: 'Blindfolding {p}', receive: 'Being blindfolded by {p}', label: '{g} blindfolds {r}' },
  { id: 'temp', cat: 'bondage', give: 'Using ice cubes or warm wax on {p}', receive: '{p} using ice cubes or warm wax on you', label: '{g} uses ice or wax on {r}' },
  { id: 'feather', cat: 'bondage', give: 'Teasing {p} with a feather or your fingertips', receive: 'Being teased with a feather or fingertips by {p}', label: '{g} teases {r} with a feather' },
  { id: 'gag', cat: 'bondage', give: 'Gagging {p}', receive: 'Being gagged by {p}', label: '{g} gags {r}' },
  { id: 'clamps', cat: 'bondage', give: 'Using nipple clamps on {p}', receive: '{p} using nipple clamps on you', label: '{g} uses nipple clamps on {r}' },

  // Impact
  { id: 'spank', cat: 'impact', give: 'Spanking {p}', receive: 'Being spanked by {p}', label: '{g} spanks {r}' },
  { id: 'paddle', cat: 'impact', give: 'Using a paddle, crop or flogger on {p}', receive: '{p} using a paddle, crop or flogger on you', label: '{g} uses a paddle or flogger on {r}' },
  { id: 'scratch', cat: 'impact', give: "Scratching {p}'s back", receive: 'Having your back scratched by {p}', label: "{g} scratches {r}'s back" },

  // Roleplay
  { id: 'strangers', cat: 'roleplay', text: 'Pretending to be strangers meeting at a bar' },
  { id: 'scenario', cat: 'roleplay', text: 'Roleplay scenarios (boss & assistant, teacher & student…)' },
  { id: 'costume', cat: 'roleplay', text: 'Dressing up in costumes or uniforms' },
  { id: 'fantasyact', cat: 'roleplay', text: "Acting out one of our fantasies, fully planned" },
  { id: 'seduce', cat: 'roleplay', give: 'Playing the seducer while {p} plays hard to get', receive: 'Playing hard to get while {p} seduces you', label: '{g} seduces {r}, who plays hard to get' },

  // Going further
  { id: 'analplay', cat: 'explore', give: 'Anal play on {p} (fingers or small toys)', receive: '{p} giving you anal play (fingers or small toys)', label: '{g} gives {r} anal play' },
  { id: 'anal', cat: 'explore', give: 'Having anal sex with {p}', receive: 'Having anal sex with {p} (receiving)', label: '{g} has anal sex with {r}', when: (g) => !isFemale(g) },
  { id: 'finish', cat: 'explore', give: "Finishing on {p}'s body", receive: '{p} finishing on your body', label: "{g} finishes on {r}'s body", when: (g) => !isFemale(g) },
  { id: 'threesome', cat: 'explore', text: 'A threesome' },
  { id: 'club', cat: 'explore', text: 'Visiting a sex club or party (even just to watch)' },
  { id: 'swap', cat: 'explore', text: 'Swapping partners with another couple' },
  { id: 'watchother', cat: 'explore', give: 'Watching {p} with someone else', receive: 'Being with someone else while {p} watches', label: '{g} watches {r} with someone else' },
];
