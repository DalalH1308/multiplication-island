/* ===== app.js : start-up and screen router ===== */
'use strict';

function render() {
  keyHandler = null;
  Voice.stop();
  const app = $('#app');
  app.innerHTML = '';
  const [a = '', b, c] = location.hash.replace(/^#\/?/, '').split('/');
  const T = +b;
  if (a === 'learn' && TABLES.includes(T)) Screens.learnTable(app, T, range(1, 10).includes(+c) ? +c : 0);
  else if (a === 'learn') Screens.learnIndex(app);
  else if (a === 'practice' && (TABLES.includes(T) || b === 'mix' || b === 'tricky')) Screens.practiceRun(app, b);
  else if (a === 'practice') Screens.practiceIndex(app);
  else if (a === 'adventure' && b) Screens.adventurePlay(app, b);
  else if (a === 'adventure') Screens.adventureMap(app);
  else if (a === 'progress') Screens.progress(app);
  else Screens.menu(app);
  window.scrollTo(0, 0);
}

function setSoundBtn() {
  const s = $('#soundBtn');
  s.textContent = Store.d.sound ? '🔊' : '🔇';
  s.setAttribute('aria-label', Store.d.sound ? 'Sound is on. Tap to turn it off.' : 'Sound is off. Tap to turn it on.');
}

Store.load();
Voice.init();
updateStarCount();
setSoundBtn();
$('#soundBtn').addEventListener('click', () => { Store.d.sound = !Store.d.sound; Store.save(); setSoundBtn(); if (!Store.d.sound) Voice.stop(); else Sound.tap(); });
window.addEventListener('hashchange', render);
render();

/* Offline copy for the hosted site. Opening index.html from a folder works offline anyway. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
