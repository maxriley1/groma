// The departures: every app on the page comes from this list. Add an app by adding an entry.
//   status:  'Live' (BOARDING) · 'Pending' (store launch waiting on review) · 'Beta' (ON TIME) · 'Building' (SCHEDULED)
//   ios / android:  null (not planned), { state: 'pending', note } or { state: 'live', url }
//     A live store URL must be https on apps.apple.com or play.google.com.
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
];
