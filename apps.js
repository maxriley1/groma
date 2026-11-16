// The departures: every app on the page comes from this list. Add an app by adding an entry.
//   status:  'Live' (BOARDING) · 'Pending' (store launch waiting on review) · 'Beta' (ON TIME) · 'Building' (SCHEDULED)
//   ios / android:  null (not planned), { state: 'pending', note } or { state: 'live', url }
//     A live store URL must be https on apps.apple.com or play.google.com.
//   web: false when url is an info page, not a web version (hides the Web chip)
//   video: optional gameplay clip in video/ (.mp4), shown on the boarding pass instead of the screenshot
//   art: card image in img/ (artFit: 'icon' shows it as a centred app icon instead of filling the card)
//   bg: a hex colour or linear-gradient(<deg>deg,#rrggbb,#rrggbb); ink: a hex colour.
window.SITE = {
  // Leave empty to hide the Contact link and button.
  contactEmail: 'hello@gromaintel.com',
};

window.APPS = [
  {
    id: 'jellydrop',
    name: 'Jelly Drop',
    code: 'JLY',
    dest: 'PUZZLE',
    tagline: 'Drop jellies, merge twins, grow a King. 100 levels, 15 skins, free to play.',
    status: 'Pending',
    version: '2.1',
    url: 'https://jellydrop.gromaintel.com/',
    cta: 'PLAY NOW',
    ios: { state: 'pending', note: 'In review' },
    android: { state: 'pending', note: 'Coming soon' },
    bg: 'linear-gradient(150deg,#ff7aa8,#c2307a)',
    ink: '#ffffff',
    art: 'img/jellydrop-icon.png',
    artFit: 'icon',
    shot: 'img/jellydrop-shot.jpg',
  },
  {
    id: 'terminaltycoon',
    name: 'Terminal Tycoon',
    code: 'TTY',
    dest: 'TYCOON',
    tagline: 'Start with one gate and grow a mega-airport. Fix the queues, sign airlines, win the league. Free, offline, no ads. Coming December.',
    status: 'Pending',
    version: '1.0',
    url: 'https://terminaltycoon.jellydrop.workers.dev/',
    cta: 'ABOUT THE GAME',
    web: false,
    ios: { state: 'pending', note: 'Coming December' },
    android: { state: 'pending', note: 'Coming December' },
    bg: 'linear-gradient(150deg,#ffb347,#e2601a)',
    ink: '#0b0c0e',
    art: 'img/tycoon-icon.png',
    artFit: 'icon',
    shot: 'img/tycoon-shot.jpg',
    video: 'video/tycoon-journey.mp4',
  },
  {
    id: 'kippu',
    name: 'Kippu',
    code: 'KPU',
    dest: 'TRAVEL',
    tagline: 'Know when to leave. Countdowns on your Lock Screen, the last train home, and labels read in your language. Coming 2027 after full testing in Japan.',
    status: 'Building',
    version: '1.0',
    url: 'https://gromaintel.com/kippu/',
    cta: 'ABOUT KIPPU',
    web: false,
    ios: { state: 'pending', note: 'Coming 2027' },
    android: null,
    bg: 'linear-gradient(150deg,#ffe14d,#ffc400)',
    ink: '#09090b',
    art: 'img/kippu-icon.png',
    artFit: 'icon',
    shot: 'img/kippu-shot.jpg',
  },
  {
    id: 'steady',
    name: 'Steady by Groma',
    code: 'STD',
    dest: 'WELLBEING',
    tagline: 'A calm place for heavy days. Check in, notice stress early with Apple Health, breathe it down, or reach your people with one press.',
    status: 'Building',
    version: '1.0',
    url: 'https://steady-api.jellydrop.workers.dev/',
    cta: 'ABOUT STEADY',
    web: false,
    ios: { state: 'pending', note: 'Coming soon' },
    android: null,
    bg: 'linear-gradient(150deg,#7b61ff,#ff5a5f)',
    ink: '#ffffff',
    art: 'img/steady-icon.png',
    artFit: 'icon',
    shot: 'img/steady-shot.jpg',
  },
];
