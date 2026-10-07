const OEMS = [
  { name: 'JCB', country: 'UK', color: '#e3ba3f' },
  { name: 'MAN', country: 'Germany', color: '#71899a' },
  { name: 'Nikola', country: 'USA', color: '#68a4a8' },
  { name: 'Ford Otosan', country: 'Turkey', color: '#5284ab' },
  { name: 'FPT', country: 'Italy', color: '#5a9c77' },
  { name: 'Deutz', country: 'Germany', color: '#cc6455' },
  { name: 'HATZ', country: 'Germany', color: '#d0a445' },
  { name: 'Daimler', country: 'Germany', color: '#829793' },
  { name: 'Navistar', country: 'USA', color: '#488ba6' },
  { name: 'Cummins', country: 'USA', color: '#c05e53' },
  { name: 'IRIZAR', country: 'Spain', color: '#579d87' },
  { name: 'Weichai', country: 'China', color: '#c95d57' },
];
const COUNTRIES = [
  { name: 'UK', label: 'United Kingdom', code: 'GB', x: 544, y: 105, labelX: 43, labelY: 12 },
  { name: 'Germany', label: 'Germany', code: 'DE', x: 582, y: 123, labelX: 60, labelY: 14 },
  { name: 'USA', label: 'United States', code: 'US', x: 249, y: 153, labelX: 21, labelY: 23 },
  { name: 'Turkey', label: 'Turkey', code: 'TR', x: 657, y: 153, labelX: 70, labelY: 33 },
  { name: 'Italy', label: 'Italy', code: 'IT', x: 588, y: 144, labelX: 51, labelY: 39 },
  { name: 'Spain', label: 'Spain', code: 'ES', x: 538, y: 162, labelX: 40, labelY: 48 },
  { name: 'China', label: 'China', code: 'CN', x: 871, y: 165, labelX: 85, labelY: 17 },
];
const byId = (id) => document.getElementById(id);
const icons = () => { if (window.lucide) window.lucide.createIcons(); };
let deck = [];
let round = 0;
let score = 0;
let correct = 0;
let streak = 0;
let longestStreak = 0;
let phase = 'idle';
let history = [];
let generation = 0;
let soundEnabled = false;
let audioContext;
let best = 0;
let returnTimer = null;
function returnToWheel() { window.location.href = '../ECC_Roadshow_Premium_Spin_Wheel_Game_Launcher.html'; }
try { best = Number(localStorage.getItem('origin-run-best')) || 0; } catch {}

function flag(country) {
  const base = '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">';
  const flags = {
    UK: '<rect width="30" height="20" fill="#315079"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="5"/><path d="M0 0l30 20M30 0L0 20" stroke="#c35257" stroke-width="2"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="7"/><path d="M15 0v20M0 10h30" stroke="#c35257" stroke-width="4"/>',
    Germany: '<path fill="#30362f" d="M0 0h30v7H0z"/><path fill="#c55752" d="M0 7h30v6H0z"/><path fill="#e5be52" d="M0 13h30v7H0z"/>',
    USA: '<rect width="30" height="20" fill="#faf8ed"/><path d="M0 2h30M0 6h30M0 10h30M0 14h30M0 18h30" stroke="#c36461" stroke-width="2"/><rect width="13" height="11" fill="#405c7d"/><path d="M3 3h1m3 0h1m3 0h1M3 6h1m3 0h1m3 0h1M3 9h1m3 0h1m3 0h1" stroke="white"/>',
    Turkey: '<rect width="30" height="20" fill="#cb5755"/><circle cx="12" cy="10" r="6" fill="#fff"/><circle cx="14" cy="9" r="5" fill="#cb5755"/><path d="M20 6l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3L16 9h3z" fill="#fff"/>',
    Italy: '<rect width="10" height="20" fill="#639879"/><rect x="10" width="10" height="20" fill="#fffdf2"/><rect x="20" width="10" height="20" fill="#c7665d"/>',
    Spain: '<rect width="30" height="20" fill="#c9504e"/><rect y="5" width="30" height="10" fill="#e7bd4c"/>',
    China: '<rect width="30" height="20" fill="#c9504e"/><path d="M6 3l1.2 3.6H11L8 8.8l1.2 3.7L6 10.2l-3.2 2.3L4 8.8 1 6.6h3.8z" fill="#f3d56b"/>',
  };
  return base + flags[country] + '</svg>';
}

function buildDestinations() {
  byId('destinations').innerHTML = COUNTRIES.map((country) => `<button class="country-button" style="left:${country.labelX}%;top:${country.labelY}%" data-country="${country.name}" disabled aria-label="Route truck to ${country.label}">${flag(country.name)}<strong>${country.name}</strong></button>`).join('');
  const map = byId('map-svg');
  COUNTRIES.forEach((country) => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.innerHTML = `<path id="leader-${country.code}" stroke="#658d83" stroke-width="1.5"/><circle cx="${country.x}" cy="${country.y}" r="5" fill="#357c72" stroke="white" stroke-width="2"/>`;
    map.insertBefore(marker, byId('map-route'));
  });
  byId('map-truck').appendChild(byId('truck-body').cloneNode(true));
  byId('map-truck').querySelectorAll('[id]').forEach((element) => { element.id = `map-${element.id}`; });
  document.querySelectorAll('.country-button').forEach((button) => {
    button.addEventListener('click', () => routeTruck(button.dataset.country));
  });
  layoutMapLabels();
  window.addEventListener('resize', layoutMapLabels);
}

function layoutMapLabels() {
  const compact = byId('world-map').parentElement.clientWidth < 560;
  const positions = { UK: [36, 12], Germany: [75, 27], USA: [16, 40], Turkey: [80, 56], Italy: [43, 58], Spain: [25, 74], China: [82, 12] };
  COUNTRIES.forEach((country) => {
    const [labelX, labelY] = compact ? positions[country.name] : [country.labelX, country.labelY];
    const button = document.querySelector(`[data-country="${country.name}"]`);
    button.style.left = `${labelX}%`;
    button.style.top = `${labelY}%`;
    byId(`leader-${country.code}`).setAttribute('d', `M${country.x} ${country.y}L${labelX * 11} ${labelY * 5.4}`);
  });
}

function setPhase(nextPhase) {
  phase = nextPhase;
  const labels = { idle: 'AWAITING DISPATCH', entering: 'ENTERING WAREHOUSE', revealing: 'BRAND ASSIGNMENT', exiting: 'LEAVING WAREHOUSE', ready: 'READY TO ROUTE', routing: 'TRUCK IN TRANSIT', result: 'DELIVERY COMPLETE', finished: 'ROUND COMPLETE' };
  byId('phase-label').textContent = labels[phase];
  document.querySelectorAll('.country-button').forEach((button) => { button.disabled = phase !== 'ready'; });
  byId('dispatch').disabled = phase !== 'idle';
  byId('destination-status').textContent = phase === 'ready' ? 'Where is this OEM from?' : phase === 'idle' ? `${COUNTRIES.length} countries on the map` : phase === 'finished' ? 'All trucks delivered' : 'Routing paused';
}

function updateDashboard() {
  byId('round-number').textContent = String(Math.min(round + 1, OEMS.length)).padStart(2, '0');
  byId('score').textContent = score;
  byId('accuracy').textContent = `${history.length ? Math.round(correct / history.length * 100) : 0}%`;
  byId('streak').textContent = streak;
  byId('best').innerHTML = `${best} <span>PTS</span>`;
  byId('completed-count').textContent = `${history.length} / ${OEMS.length}`;
  byId('progress').style.width = `${history.length / OEMS.length * 100}%`;
  byId('manifest').innerHTML = deck.map((oem, index) => {
    const result = history[index];
    const visible = Boolean(result) || (index === round && ['ready', 'routing', 'result'].includes(phase));
    const className = result ? `completed ${result.correct ? 'correct' : 'incorrect'}` : index === round ? 'current' : '';
    return `<li class="manifest-item ${className}" ${result ? `title="${oem.name}: ${oem.country}"` : ''}><span class="manifest-number">${String(index + 1).padStart(2, '0')}</span><span class="manifest-brand">${visible ? oem.name : 'Mystery truck'}</span><span class="manifest-symbol">${result ? result.correct ? '&#10003;' : '&#10005;' : index === round ? '&#9679;' : '&#183;'}</span></li>`;
  }).join('');
}

function moveTruck(from, to, duration, token, shrink = false, truckId = 'truck', baseScale = 1) {
  return new Promise((resolve) => {
    const started = performance.now();
    function frame(now) {
      if (token !== generation) { resolve(false); return; }
      const progress = Math.min((now - started) / duration, 1);
      const eased = progress * progress * (3 - 2 * progress);
      const positionX = from.x + (to.x - from.x) * eased;
      const positionY = from.y + (to.y - from.y) * eased;
      const scale = baseScale * (shrink ? 1 - eased * .45 : 1);
      byId(truckId).setAttribute('transform', `translate(${positionX} ${positionY}) scale(${scale})`);
      byId(truckId).style.opacity = shrink ? String(1 - Math.max(0, (progress - .6) / .4)) : '1';
      if (progress < 1) requestAnimationFrame(frame);
      else resolve(true);
    }
    requestAnimationFrame(frame);
  });
}

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

async function dispatchTruck() {
  if (phase !== 'idle') return;
  const token = generation;
  setPhase('entering');
  byId('dispatch-title').textContent = 'Into the warehouse...';
  byId('truck-status').textContent = 'MYSTERY CARGO';
  byId('warehouse-door').style.opacity = '0';
  const entered = await moveTruck({ x: 55, y: 362 }, { x: 301, y: 273 }, 1600, token, true);
  if (!entered) return;
  setPhase('revealing');
  byId('warehouse-door').style.opacity = '1';
  byId('dispatch-title').textContent = 'Something new is rolling out.';
  await delay(850);
  if (token !== generation) return;
  const oem = deck[round];
  byId('truck-brand').textContent = oem.name;
  byId('truck-brand').setAttribute('font-size', oem.name.length > 8 ? '13' : '22');
  byId('truck-brand').style.fontSize = oem.name.length > 8 ? '13px' : '22px';
  byId('cab').setAttribute('fill', oem.color);
  byId('warehouse-door').style.opacity = '0';
  setPhase('exiting');
  const exited = await moveTruck({ x: 300, y: 310 }, { x: 501, y: 362 }, 1300, token);
  if (!exited) return;
  byId('warehouse-door').style.opacity = '1';
  byId('map-truck-brand').textContent = oem.name;
  byId('map-truck-brand').style.fontSize = oem.name.length > 8 ? '13px' : '22px';
  byId('map-cab').setAttribute('fill', oem.color);
  byId('map-truck').setAttribute('transform', 'translate(400 400) scale(.7)');
  byId('world-map').hidden = false;
  byId('yard').style.visibility = 'hidden';
  setPhase('ready');
  byId('dispatch-title').textContent = `${oem.name}. Where to?`;
  byId('truck-status').textContent = `${oem.name.toUpperCase()} / AWAITING ROUTE`;
  byId('dispatch').querySelector('span').textContent = 'Awaiting destination';
  updateDashboard();
  playTone('reveal');
}

async function routeTruck(selectedCountry) {
  if (phase !== 'ready' || !COUNTRIES.some((country) => country.name === selectedCountry)) return;
  const token = generation;
  const country = COUNTRIES.find((item) => item.name === selectedCountry);
  setPhase('routing');
  document.querySelectorAll('.country-button').forEach((button) => button.classList.toggle('selected', button.dataset.country === selectedCountry));
  document.querySelectorAll('.depot-hover').forEach((depot) => depot.classList.remove('depot-hover'));
  byId('dispatch-title').textContent = `En route to ${country.label}.`;
  byId('truck-status').textContent = `${deck[round].name.toUpperCase()} / IN TRANSIT`;
  byId('map-route').setAttribute('d', `M400 400 L${country.x} ${country.y}`);
  byId('map-route').setAttribute('opacity', '1');
  const arrived = await moveTruck({ x: 400, y: 400 }, country, 1350, token, false, 'map-truck', .7);
  if (!arrived) return;
  const oem = deck[round];
  const isCorrect = selectedCountry === oem.country;
  if (isCorrect) { score += 100; correct += 1; streak += 1; longestStreak = Math.max(longestStreak, streak); }
  else streak = 0;
  history.push({ correct: isCorrect, selectedCountry });
  if (score > best) { best = score; try { localStorage.setItem('origin-run-best', String(best)); } catch {} }
  setPhase('result');
  byId('truck-status').textContent = `${oem.name.toUpperCase()} / DELIVERED`;
  updateDashboard();
  playTone(isCorrect ? 'correct' : 'wrong');
  byId('dispatch-title').textContent = isCorrect ? 'Delivered to the right home.' : 'A different destination this time.';
  if (!isCorrect) {
    finishGame({ oem, country });
    return;
  }
  showResult(isCorrect, oem, country);
}

function showResult(isCorrect, oem, country) {
  const overlay = byId('result-overlay');
  overlay.hidden = false;
  overlay.innerHTML = `<div class="result-content ${isCorrect ? '' : 'wrong'}" role="dialog" aria-modal="true" aria-labelledby="result-heading"><div class="result-icon"><i data-lucide="${isCorrect ? 'check' : 'signpost'}"></i></div><h2 id="result-heading">${isCorrect ? 'RIGHT ON ROUTE.' : 'A DETOUR THIS TIME.'}</h2><p>${isCorrect ? `${oem.name} is from ${oem.country}.<br><strong>+100 points</strong> added to your score.` : `${oem.name} is from <strong>${oem.country}</strong>, not ${country.name}.<br>The next truck is a fresh start.`}</p><button class="primary-button" id="next-truck"><span>${round === 9 ? 'See your results' : 'Next truck'}</span><i data-lucide="arrow-right"></i></button></div>`;
  icons();
  byId('next-truck').addEventListener('click', nextTruck);
  byId('next-truck').focus({ preventScroll: true });
}

function nextTruck() {
  if (phase !== 'result') return;
  if (round === OEMS.length - 1) { finishGame(); return; }
  round += 1;
  resetTruck();
  dispatchTruck();
}

function resetTruck() {
  byId('result-overlay').hidden = true;
  byId('world-map').hidden = true;
  byId('yard').style.visibility = 'visible';
  byId('map-route').setAttribute('opacity', '0');
  byId('truck').setAttribute('transform', 'translate(55 362)');
  byId('truck').style.opacity = '1';
  byId('truck-brand').textContent = '?';
  byId('truck-brand').style.fontSize = '22px';
  byId('cab').setAttribute('fill', '#e3ba3f');
  byId('warehouse-door').style.opacity = '1';
  byId('active-route').setAttribute('opacity', '0');
  document.querySelectorAll('.country-button').forEach((button) => button.classList.remove('selected'));
  byId('truck-status').textContent = 'MYSTERY CARGO';
  byId('dispatch-title').textContent = 'A new arrival is waiting.';
  byId('dispatch').querySelector('span').textContent = 'Send to warehouse';
  setPhase('idle');
  updateDashboard();
}

function finishGame(failure = null) {
  returnTimer = setTimeout(returnToWheel, 5000);
  setPhase('finished');
  byId('phase-label').textContent = failure ? 'GAME OVER' : 'ROUND COMPLETE';
  byId('destination-status').textContent = failure ? 'Run ended after a wrong route' : 'All trucks delivered';
  byId('truck-status').textContent = failure ? 'ROUTE FAILED' : 'ALL DISPATCHES COMPLETE';
  byId('dispatch-title').textContent = failure ? 'The wrong destination ended the run.' : `All ${OEMS.length} trucks are homeward bound.`;
  const overlay = byId('result-overlay');
  overlay.hidden = false;
  const title = failure ? 'GAME OVER.' : correct === OEMS.length ? 'A PERFECT RUN.' : 'THAT\'S A WRAP.';
  const failureMessage = failure ? `<p>${failure.oem.name} is from <strong>${failure.oem.country}</strong>, not ${failure.country.name}.</p>` : '';
  overlay.innerHTML = `<div class="result-content ${failure ? 'wrong' : ''}" role="dialog" aria-modal="true" aria-labelledby="result-heading"><div class="result-icon"><i data-lucide="${failure ? 'signpost' : 'trophy'}"></i></div><h2 id="result-heading">${title}</h2>${failureMessage}<div class="summary-score">${score} <span class="small-label">PTS</span></div><div class="summary-details"><span>${correct}/${history.length} correct</span><span>${longestStreak} best streak</span></div><button class="primary-button" id="play-again"><span>Play again</span><i data-lucide="rotate-ccw"></i></button></div>`;
  icons();
  byId('play-again').addEventListener('click', startGame);
  byId('play-again').focus({ preventScroll: true });
}

function startGame() {
  clearTimeout(returnTimer);
  generation += 1;
  deck = [...OEMS];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
  }
  round = 0;
  score = 0;
  correct = 0;
  streak = 0;
  longestStreak = 0;
  history = [];
  resetTruck();
}

function playTone(kind) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const pitches = kind === 'correct' ? [523, 659, 784] : kind === 'wrong' ? [294, 220] : [440, 554];
    pitches.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const time = audioContext.currentTime + index * .11;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.06, time + .015);
      gain.gain.exponentialRampToValueAtTime(.001, time + .24);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(time);
      oscillator.stop(time + .25);
    });
  } catch {}
}

byId('dispatch').addEventListener('click', dispatchTruck);
byId('restart').addEventListener('click', () => {
  if (phase === 'idle' && history.length === 0) { startGame(); return; }
  if (window.confirm('Restart this round? Your current score will be cleared.')) startGame();
});
byId('sound').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  byId('sound').innerHTML = `<i data-lucide="${soundEnabled ? 'volume-2' : 'volume-x'}"></i>`;
  byId('sound').setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Enable sound');
  byId('sound').title = soundEnabled ? 'Mute sound' : 'Enable sound';
  byId('sound').setAttribute('aria-pressed', String(soundEnabled));
  icons();
  if (soundEnabled) playTone('reveal');
});
byId('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { byId('fullscreen').title = 'Fullscreen unavailable in this browser'; }
});
document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  byId('fullscreen').innerHTML = `<i data-lucide="${active ? 'minimize' : 'maximize'}"></i>`;
  byId('fullscreen').setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  byId('fullscreen').title = active ? 'Exit fullscreen' : 'Enter fullscreen';
  icons();
});
byId('phase-label').setAttribute('role', 'status');
byId('dispatch-title').setAttribute('aria-live', 'polite');
buildDestinations();
startGame();
icons();