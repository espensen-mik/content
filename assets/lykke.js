/* LykkeLiga Content · komponenter
   Hver komponent starter kun, hvis dens markup findes på siden.
   Sidens eget indhold (ordforklaringer, mixer-data, videokapitler) ligger i window.LYKKE. */
(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const D = window.LYKKE || {};
function setV(i) { i.style.setProperty('--v', ((i.value - i.min) / (i.max - i.min) * 100) + '%') }
window.Lykke = { $, $$, css, setV, RM };

const art = $('main.article');

/* ---- anatomi ---- */
$('#xray')?.addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); document.body.classList.toggle('xray', on) });

/* ---- hero-video (Mux) ---- */
const hv = $('#heroVideo');
if (hv) {
  if (!RM) {
    hv.setAttribute('autoplay', 'muted');
    const tryPlay = () => { const p = hv.play?.(); p && p.catch?.(() => {}) };
    customElements.whenDefined(hv.localName).then(tryPlay);
  }
  $$('mux-player:not(#heroVideo), video:not(#heroVideo)').forEach(v => v.addEventListener('play', () => hv.pause?.()));
}

/* ---- hero: animeret nøgleord ---- */
const star = $('#star');
if (star) star.innerHTML = [...star.textContent].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');

/* ---- kapitel-bølger ---- */
const waves = $$('.chapter-open .wave');
waves.forEach((w, k) => { let h = ''; for (let i = 0; i < 64; i++) { const v = .25 + Math.abs(Math.sin(i * .37 + k) * Math.cos(i * .11 + k * 2)) * .75; h += `<i style="height:${Math.round(v * 100)}%"></i>` } w.innerHTML = h });

/* ---- karaoke-citater ---- */
const kar = $$('[data-karaoke]');
kar.forEach(q => { const hot = (q.dataset.hot || '').toLowerCase(); q.innerHTML = q.textContent.split(' ').map(w => `<span${hot && w.toLowerCase().startsWith(hot) ? ' data-hot' : ''}>${w}</span>`).join(' ') });

/* ---- afspilningslinje ---- */
const track = $('#track'), bar = $('#track i'), time = $('#time');
const TOTAL = (+art?.dataset.minutes || 10) * 60;
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function layoutTicks() {
  if (!track || !art) return;
  $$('b', track).forEach(b => b.remove());
  const H = art.scrollHeight - innerHeight;
  $$(':scope > section[id^="spor-"]', art).slice(1).forEach(el => { const b = document.createElement('b'); b.style.left = (Math.min(1, (el.offsetTop - art.offsetTop) / H) * 100) + '%'; track.appendChild(b) });
}
function onScroll() {
  if (art && bar) {
    const H = art.scrollHeight - innerHeight, p = Math.max(0, Math.min(1, scrollY / H));
    bar.style.width = (p * 100) + '%'; if (time) time.textContent = `${fmt(p * TOTAL)} / ${fmt(TOTAL)}`;
  }
  waves.forEach(w => { const r = w.getBoundingClientRect(); const q = Math.max(0, Math.min(1, (innerHeight * .9 - r.top) / (innerHeight * .8))); const n = Math.round(q * w.children.length); [...w.children].forEach((c, i) => c.classList.toggle('on', i < n)) });
  kar.forEach(q => { const r = q.getBoundingClientRect(); const pr = Math.max(0, Math.min(1, (innerHeight * .85 - r.top) / (innerHeight * .5))); const s = q.children; const n = Math.round(pr * s.length); [...s].forEach((c, i) => { c.classList.toggle('lit', i < n); c.classList.toggle('hot', i < n && c.hasAttribute('data-hot')) }) });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { layoutTicks(); onScroll() });
addEventListener('load', () => { layoutTicks(); onScroll() });

/* ---- ordforklaringer ---- */
const TERMS = D.terms || {};
const closeTips = () => $$('.tip').forEach(x => { x.parentElement.setAttribute('aria-expanded', 'false'); x.remove() });
$$('.term').forEach(t => t.addEventListener('click', e => {
  e.stopPropagation(); const open = t.querySelector('.tip'); closeTips(); if (open) return;
  const [h, b] = TERMS[t.dataset.term] || ['Ordforklaring', t.dataset.def || ''];
  const d = document.createElement('span'); d.className = 'tip'; d.setAttribute('role', 'tooltip'); d.innerHTML = `<b>${h}</b>${b}`;
  t.appendChild(d); t.setAttribute('aria-expanded', 'true');
  const r = d.getBoundingClientRect();
  if (r.left < 8) d.style.transform = `translateX(calc(-50% + ${8 - r.left}px))`; else if (r.right > innerWidth - 8) d.style.transform = `translateX(calc(-50% - ${r.right - innerWidth + 8}px))`;
}));
document.addEventListener('click', closeTips);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTips() });

/* ---- før/efter-slider ---- */
const cs = $('#caseSlider'), cm = $('#caseMedia');
if (cs && cm) cs.addEventListener('input', () => cm.style.setProperty('--pos', cs.value + '%'));

/* ---- filmstrimmel ---- */
const strip = $('#strip');
if (strip) {
  const sc = $('#stripCount'), figs = $$('figure', strip);
  $$('.ctrls .round').forEach(b => b.addEventListener('click', () => { const w = figs[0].getBoundingClientRect().width + 12; strip.scrollBy({ left: w * +b.dataset.dir, behavior: RM ? 'auto' : 'smooth' }) }));
  strip.addEventListener('scroll', () => { const x = strip.scrollLeft; let i = 0; figs.forEach((f, k) => { if (f.offsetLeft - strip.offsetLeft <= x + 20) i = k }); if (strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4) i = figs.length - 1; if (sc) sc.textContent = `${i + 1} / ${figs.length}` }, { passive: true });
}

/* ---- canvas-hjælpere ---- */
function fit(c) { const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (c.width !== Math.round(r.width * d) || c.height !== Math.round(r.height * d)) { c.width = Math.round(r.width * d); c.height = Math.round(r.height * d) } return [c.getContext('2d'), c.width, c.height, d] }
const visible = new Map(); const io = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)));
function loop(canvas, draw) { if (!canvas) return; io.observe(canvas); const t0 = performance.now(); const f = t => { if (visible.get(canvas) !== false) { const [x, w, h, d] = fit(canvas); draw(x, w, h, d, (t - t0) / 1000) } if (!RM) requestAnimationFrame(f) }; requestAnimationFrame(f) }
window.Lykke.loop = loop;

/* hero: scenelys */
loop($('#heroCanvas'), (x, w, h, d, t) => {
  x.fillStyle = '#0f2440'; x.fillRect(0, 0, w, h);
  const beams = [['137,209,188', .28, .9], ['223,103,99', .72, 1.15], ['0,161,130', .5, .7]];
  x.globalCompositeOperation = 'lighter';
  beams.forEach(([c, bx, sp], i) => { const cx = w * (bx + Math.sin(t * .25 * sp + i) * .12); const g = x.createRadialGradient(cx, -h * .1, 0, cx, h * .4, h * 1.1); g.addColorStop(0, `rgba(${c},.55)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.beginPath(); x.moveTo(cx - w * .04, 0); x.lineTo(cx + w * .04, 0); x.lineTo(cx + w * .32, h); x.lineTo(cx - w * .32, h); x.closePath(); x.fill() });
  x.globalCompositeOperation = 'source-over';
  const g2 = x.createLinearGradient(0, 0, w * .7, 0); g2.addColorStop(0, 'rgba(15,36,64,.92)'); g2.addColorStop(1, 'rgba(15,36,64,.15)'); x.fillStyle = g2; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.08)'; const n = 90, bw = w / n; for (let i = 0; i < n; i++) { const v = (Math.sin(i * .31 + t * 2.2) * .5 + .5) * (Math.sin(i * .07 - t * .8) * .5 + .5); const bh = v * h * .18 + 2 * d; x.fillRect(i * bw, h - bh, bw * .6, bh) }
});

/* ---- scrollytelling ---- */
const fig = $('#scrollyFig');
if (fig) {
  const steps = $$('.step');
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { steps.forEach(s => s.classList.toggle('active', s === e.target)); fig.dataset.step = e.target.dataset.step } }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => sio.observe(s)); steps[0]?.classList.add('active');
  loop($('#scrollyCanvas'), (x, w, h, d, t) => {
    const s = +fig.dataset.step; x.fillStyle = '#1e3f6b'; x.fillRect(0, 0, w, h);
    if (s === 0 || s === 3) { const clean = s === 3; x.strokeStyle = clean ? '#89d1bc' : '#df6763'; x.lineWidth = 2 * d; x.beginPath(); const mid = clean ? h * .82 : h * .45; for (let i = 0; i <= w; i += 3 * d) { const k = i / w; const env = clean ? Math.sin(k * Math.PI) * .6 + .4 : (.3 + Math.abs(Math.sin(k * 9 + t)) * .7); const n = clean ? Math.sin(k * 60 + t * 4) * Math.sin(k * 7 + t) : (Math.sin(k * 80 + t * 6) + Math.sin(k * 230 - t * 9) * .6 + (Math.random() - .5) * 1.4) / 2.4; const y = mid + n * env * h * (clean ? .08 : .3); i ? x.lineTo(i, y) : x.moveTo(i, y) } x.stroke(); if (!clean) { x.fillStyle = (t % 1.2) < .7 ? '#df6763' : 'transparent'; x.beginPath(); x.arc(w - 28 * d, 28 * d, 8 * d, 0, 7); x.fill() } }
    if (s === 1) { x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 8; i++) x.fillRect(24 * d, 30 * d + i * 30 * d, (w - 48 * d) * (.4 + ((i * 37) % 50) / 100), 8 * d) }
    if (s === 2) { const cols = 36, rows = 22, cw = w / cols, ch = h / rows; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const v = Math.max(0, Math.sin(i * .4 + t * 2 + j * .2) * Math.cos(j * .5 - t) + Math.sin((i + j) * .15 - t * 1.5) * .5); x.fillStyle = `rgba(${j < rows / 2 ? '137,209,188' : '223,103,99'},${Math.min(.85, v * .6)})`; x.fillRect(i * cw + 1, j * ch + 1, cw - 2, ch - 2) } }
  });
}

/* ---- prompt-mixer ---- */
if ($('#mixer') && D.mixer) {
  const GENRES = D.mixer.genres, THEMES = D.mixer.themes;
  const M = { g: 0, th: 0, bpm: 118, en: 70 };
  const chips = (el, arr, key, lab) => { el.innerHTML = arr.map((a, i) => `<button aria-pressed="${i === M[key]}">${lab(a)}</button>`).join(''); $$('button', el).forEach((b, i) => b.addEventListener('click', () => { M[key] = i; $$('button', el).forEach((x, k) => x.setAttribute('aria-pressed', k === i)); updM() })) };
  chips($('#genre'), GENRES, 'g', a => a.l); chips($('#theme'), THEMES, 'th', a => a[0].toUpperCase() + a.slice(1));
  const bpm = $('#bpm'), en = $('#energy');
  [bpm, en].forEach(i => { setV(i); i.addEventListener('input', () => { setV(i); M.bpm = +bpm.value; M.en = +en.value; updM() }) });
  const ew = v => v < 30 ? 'Rolig' : v < 65 ? 'Mellem' : 'Høj';
  function updM() {
    $('#bpmOut').textContent = M.bpm + ' BPM'; $('#energyOut').textContent = ew(M.en);
    /* artiklen kan give sin egen prompt-skabelon i window.LYKKE.mixer.prompt */
    $('#promptText').innerHTML = D.mixer.prompt
      ? D.mixer.prompt(GENRES[M.g].l, M.bpm, ew(M.en), THEMES[M.th])
      : `<span class="k">${GENRES[M.g].l}</span> på dansk, <span class="k">${M.bpm} BPM</span>, <span class="k">${ew(M.en).toLowerCase()}</span> energi. Sangen handler om <span class="k">${THEMES[M.th]}</span>.`;
  }
  updM();
  let ac, audioOn = false, timer, step16 = 0, next = 0;
  loop($('#mixCanvas'), (x, w, h, d, t) => { x.clearRect(0, 0, w, h); const n = 48, bw = w / n, ph = t * M.bpm / 60; const e = .25 + M.en / 100 * .75; for (let i = 0; i < n; i++) { const k = i / n; const pulse = Math.pow(1 - ((ph + k * .5) % 1), 3); const v = (Math.sin(i * .6 + t * M.bpm / 30) * .5 + .5) * .6 * e + pulse * .4 * e + (audioOn ? Math.random() * .1 : 0); const bh = Math.max(3 * d, v * h * .9); x.fillStyle = i % 8 === 0 ? '#df6763' : '#89d1bc'; x.globalAlpha = .35 + v * .65; x.fillRect(i * bw + bw * .15, h - bh, bw * .7, bh) } x.globalAlpha = 1 });
  const note = (f, dur, type, vol, at) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, at); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.0001, at + dur); o.connect(g).connect(ac.destination); o.start(at); o.stop(at + dur + .02) };
  const kick = at => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, at); o.frequency.exponentialRampToValueAtTime(40, at + .15); g.gain.setValueAtTime(.5, at); g.gain.exponentialRampToValueAtTime(.001, at + .2); o.connect(g).connect(ac.destination); o.start(at); o.stop(at + .22) };
  const hat = (at, v) => { const b = ac.createBuffer(1, ac.sampleRate * .05, ac.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++)c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = v; s.buffer = b; s.connect(f).connect(g).connect(ac.destination); s.start(at) };
  const PROG = [0, -3, 5, -5];
  function sched() {
    const spb = 60 / M.bpm / 4, G = GENRES[M.g], e = M.en / 100;
    while (next < ac.currentTime + .12) {
      const s = step16 % 16, barN = Math.floor(step16 / 16) % 4, root = 110 * Math.pow(2, PROG[barN] / 12); const at = next + (s % 2 ? G.swing * spb : 0);
      if (s % 4 === 0 || (G.id === 'rap' && s === 10)) kick(at);
      if (G.id === 'disco' ? s % 4 === 2 : s % 2 === 0) hat(at, .04 + e * .08);
      if (s % 4 === 0 || (e > .6 && s % 4 === 3)) note(root, spb * 1.6, 'triangle', .12, at);
      if (e > .3 && [0, 3, 6, 10, 12].includes(s)) { const sc = G.scale[(s + barN * 2) % G.scale.length]; note(root * 4 * Math.pow(2, sc / 12), spb * 2.2, G.id === 'rock' ? 'sawtooth' : 'square', .025 + e * .02, at) }
      next += spb; step16++;
    }
  }
  $('#playSketch')?.addEventListener('click', e => { const b = e.currentTarget; if (!audioOn) { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); next = ac.currentTime + .05; step16 = 0; timer = setInterval(sched, 25); audioOn = true } else { clearInterval(timer); audioOn = false } b.setAttribute('aria-pressed', audioOn); b.lastElementChild.textContent = audioOn ? 'Stop skitsen' : 'Hør en skitse' });
}

/* ---- simuleret videomodul (pladsholder til fortællevideo) ---- */
if ($('#video') && D.video) {
  const V = { t: 0, dur: D.video.dur, play: false, cc: true, last: 0 };
  const CH = D.video.chapters, SUBS = D.video.subs;
  const vc = $('#vchap'); vc.innerHTML = CH.map(([s, l]) => `<button data-s="${s}"><span class="mono">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</span>${l}</button>`).join('');
  const vt = $('#vtrack'); CH.slice(1).forEach(([s]) => { const b = document.createElement('b'); b.style.left = (s / V.dur * 100) + '%'; vt.appendChild(b) });
  const total = `${Math.floor(V.dur / 60)}:${String(V.dur % 60).padStart(2, '0')}`;
  function vSet(p) { V.play = p; $('#video').classList.toggle('playing', p); $('#vPlay').textContent = p ? 'Pause' : 'Afspil'; $('#vPlay').setAttribute('aria-pressed', p); V.last = performance.now() }
  function vUI() { const s = Math.floor(V.t); $('#vtime').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} / ${total}`; $('#vtrack i').style.width = (V.t / V.dur * 100) + '%'; vt.setAttribute('aria-valuenow', s); const sub = SUBS.find(([a, b]) => V.t >= a && V.t < b); $('#vsub').textContent = V.cc && sub && V.t > 0 ? sub[2] : ''; let ci = 0; CH.forEach(([a], i) => { if (V.t >= a) ci = i }); $$('button', vc).forEach((b, i) => b.classList.toggle('on', i === ci && V.t > 0)) }
  $('#bigPlay').addEventListener('click', () => vSet(true)); $('#vPlay').addEventListener('click', () => vSet(!V.play));
  $('#vCC').addEventListener('click', e => { V.cc = !V.cc; e.currentTarget.setAttribute('aria-pressed', V.cc); vUI() });
  $$('button', vc).forEach(b => b.addEventListener('click', () => { V.t = +b.dataset.s + .01; vSet(true); vUI() }));
  vt.addEventListener('click', e => { const r = vt.getBoundingClientRect(); V.t = Math.max(0, Math.min(V.dur, (e.clientX - r.left) / r.width * V.dur)); vUI() });
  vt.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { V.t = Math.max(0, Math.min(V.dur, V.t + (e.key === 'ArrowRight' ? 5 : -5))); vUI(); e.preventDefault() } });
  loop($('#videoCanvas'), (x, w, h, d, t) => {
    if (V.play) { const now = performance.now(); V.t += (now - V.last) / 1000 * 3; V.last = now; if (V.t >= V.dur) { V.t = 0; vSet(false) } vUI() }
    const ci = CH.reduce((a, [s], i) => V.t >= s ? i : a, 0); const pal = [['#163358', '#00a182'], ['#1e3f6b', '#df6763'], ['#0f2440', '#89d1bc'], ['#163358', '#f9eedc']][ci % 4];
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const tt = V.play ? V.t : t * .3; x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const cx = w * (.15 + i * .18) + Math.sin(tt * .8 + i) * w * .04; const rg = x.createRadialGradient(cx, h * .1, 0, cx, h * .1, h * .9); rg.addColorStop(0, 'rgba(255,255,255,.18)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h) } x.globalCompositeOperation = 'source-over';
    x.fillStyle = 'rgba(7,14,31,.55)'; for (let i = 0; i < 26; i++) { const bx = (i / 26) * w + ((i * 53) % 17) * d, bh = h * (.16 + ((i * 37) % 10) / 50) + Math.sin(tt * 3 + i) * h * .015 * (V.play ? 1 : 0); x.beginPath(); x.ellipse(bx, h - bh, w * .022, w * .026, 0, 0, 7); x.fill(); x.fillRect(bx - w * .03, h - bh + w * .015, w * .06, bh) }
  });
}

/* ---- albumafspiller ---- */
const al = $('#albummet');
if (al && D.album?.length) {
  const T = D.album, au = new Audio(); au.preload = 'none';
  const pad = n => String(n).padStart(2, '0');
  const mmss = s => isFinite(s) ? `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}` : '–:––';
  const range = $('.al-range', al), cur = $('.al-cur', al), dur = $('.al-dur', al), status = $('.al-status', al);
  const playBtn = $('.al-play', al), washes = $$('.al-wash img', al);
  let i = 0, w = 0, seeking = false;

  $('.al-count', al).textContent = T.length;
  $('.al-eq', al).innerHTML = Array.from({ length: 28 }, (_, k) => `<i style="--h:${40 + Math.round(Math.abs(Math.sin(k * 1.7)) * 60)}%;animation-duration:${(.45 + (k * 37 % 50) / 100).toFixed(2)}s;animation-delay:-${(k * 13 % 10) / 10}s"></i>`).join('');
  const list = $('.al-list', al);
  list.innerHTML = T.map((t, k) => `<li><button data-i="${k}" aria-current="false"><span class="n">${pad(k + 1)}</span><img src="${t.cover}" alt="" loading="lazy" width="44" height="44"><span class="t"><b>${t.title}</b><span>${t.artist}</span></span><span class="d"></span></button></li>`).join('');
  const rows = $$('button', list);

  let swapTimer;
  function setArt(t) {
    const c = $('.al-cover', al); c.src = t.cover; c.alt = `Cover til ${t.title} af ${t.artist}`;
    $('.al-label img', al).src = t.cover;
  }
  function show(k, animate) {
    const t = T[k];
    $('.al-idx', al).textContent = `Nr. ${pad(k + 1)}`;
    $('.al-title', al).textContent = t.title;
    $('.al-artist', al).textContent = t.artist;
    clearTimeout(swapTimer);
    if (animate && !RM && al.classList.contains('ready')) {
      /* pladen glider ind i omslaget, coveret skifter, og pladen glider ud igen */
      new Image().src = t.cover;
      al.classList.add('swap');
      swapTimer = setTimeout(() => { setArt(t); requestAnimationFrame(() => al.classList.remove('swap')) }, 400);
    } else { al.classList.remove('swap'); setArt(t) }
    w = 1 - w; washes[w].src = t.cover; washes[w].classList.add('on'); washes[1 - w].classList.remove('on');
    rows.forEach((r, n) => r.setAttribute('aria-current', n === k));
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: 'LykkeLiga · Hele pladen', artwork: [{ src: t.cover, sizes: '1024x1024' }] });
  }
  function load(k, play) {
    i = (k + T.length) % T.length; status.textContent = '';
    au.src = T[i].audio; range.value = 0; setV(range); cur.textContent = '0:00'; dur.textContent = '–:––';
    show(i, true); if (play) start();
  }
  function start() {
    if (!au.src) au.src = T[i].audio;
    const p = au.play(); p && p.catch(() => { status.textContent = 'Tryk på afspil for at starte musikken.' });
  }
  playBtn.addEventListener('click', () => au.paused ? start() : au.pause());
  $('.al-prev', al).addEventListener('click', () => au.currentTime > 3 ? (au.currentTime = 0) : load(i - 1, !au.paused));
  $('.al-next', al).addEventListener('click', () => load(i + 1, !au.paused));
  rows.forEach(r => r.addEventListener('click', () => { const k = +r.dataset.i; k === i && au.src ? (au.paused ? start() : au.pause()) : load(k, true) }));

  au.addEventListener('play', () => {
    al.classList.add('playing', 'ready'); playBtn.setAttribute('aria-pressed', 'true'); playBtn.setAttribute('aria-label', 'Pause');
    $$('mux-player, video').forEach(v => { if (!v.paused && v.id !== 'heroVideo') v.pause() });
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  au.addEventListener('pause', () => {
    al.classList.remove('playing'); playBtn.setAttribute('aria-pressed', 'false'); playBtn.setAttribute('aria-label', 'Afspil');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  });
  au.addEventListener('loadedmetadata', () => { dur.textContent = mmss(au.duration); $('.d', rows[i]).textContent = mmss(au.duration) });
  au.addEventListener('timeupdate', () => { if (seeking || !au.duration) return; range.value = au.currentTime / au.duration * 1000; setV(range); cur.textContent = mmss(au.currentTime) });
  au.addEventListener('ended', () => i < T.length - 1 ? load(i + 1, true) : load(0, false));
  au.addEventListener('error', () => { if (au.src) status.textContent = 'Sangen kunne ikke afspilles lige nu. Prøv den næste.' });
  range.addEventListener('input', () => { seeking = true; setV(range); if (au.duration) cur.textContent = mmss(range.value / 1000 * au.duration) });
  range.addEventListener('change', () => { if (au.duration) au.currentTime = range.value / 1000 * au.duration; seeking = false });
  $('#opturVideo')?.addEventListener('play', () => au.pause());

  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', start); ms.setActionHandler('pause', () => au.pause());
    ms.setActionHandler('previoustrack', () => load(i - 1, true)); ms.setActionHandler('nexttrack', () => load(i + 1, true));
  }
  /* fortæl andre komponenter (fx Danmarkskortet), hvad der spiller */
  const emit = () => document.dispatchEvent(new CustomEvent('lykke:track', { detail: { index: i, ...T[i], playing: !au.paused } }));
  ['play', 'pause', 'loadstart'].forEach(ev => au.addEventListener(ev, emit));
  window.Lykke.album = {
    tracks: T,
    play(k) { k === i && au.src ? (au.paused ? start() : au.pause()) : load(k, true) },
    pause() { au.pause() },
    get current() { return { index: i, playing: !au.paused } }
  };
  setV(range); show(0);
  /* pladen glider halvt ud, når afspilleren kommer i syne */
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && al.classList.add('ready')), { threshold: .4 }).observe(al);
}

/* ---- Case: workshop i fire trin ---- */
const ws = $('#workshop');
if (ws) {
  const steps = $$('.ws-step', ws), chips = $$('.ws-nav li', ws);
  if (!RM) ws.classList.add('anim');
  /* noten lander på billedet, når trinnet kommer i syne */
  const inIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); inIO.unobserve(e.target) } }), { threshold: .35 });
  /* trin-chippen i toppen følger med, mens man læser */
  const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const k = steps.indexOf(e.target); chips.forEach((c, n) => c.classList.toggle('on', n === k)) } }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => { inIO.observe(s); navIO.observe(s) });
}

/* ---- Danmarkskort med hold (illustration) ---- */
const dk = $('#holdkort');
if (dk && D.teams?.length) {
  const [MW, MH] = D.mapSize, pinsEl = $('.dk-pins', dk), listEl = $('.dk-list', dk);
  pinsEl.innerHTML = D.teams.map((t, n) => `<span class="dk-pin" data-n="${n}" data-side="${t.side || 'r'}" style="left:${t.x / MW * 100}%;top:${t.y / MH * 100}%"><span class="dot"></span><span class="lbl"><b>${t.city}</b></span></span>`).join('');
  listEl.innerHTML = D.teams.map((t, n) => `<li data-n="${n}"><b>${t.name}</b><span>${t.city} · ${t.club}</span></li>`).join('');
  const pins = $$('.dk-pin', dk), items = $$('li', listEl);
  const mark = n => { pins.forEach((p, k) => p.classList.toggle('on', k === n)); items.forEach((l, k) => l.classList.toggle('on', k === n)) };
  [...pins, ...items].forEach(el => { el.addEventListener('mouseenter', () => mark(+el.dataset.n)); el.addEventListener('mouseleave', () => mark(-1)) });
}

/* ---- Biograf: musikvideoer (Mux) ---- */
const cn = $('#musikvideoer');
if (cn && D.films?.length) {
  const F = D.films, mp = $('#cinemaPlayer'), glow = $('.cn-glow img', cn), reel = $('.cn-reel', cn), titleBtn = $('.cn-title', cn);
  const thumb = (f, t, w) => `https://image.mux.com/${f.id}/thumbnail.webp?time=${t}&width=${w}`;
  const pad = n => String(n).padStart(2, '0');
  let cur = 0;
  $('.cn-count', cn).textContent = F.length;
  reel.innerHTML = F.map((f, n) => `<li><button data-n="${n}" aria-current="${n === 0}" aria-label="${f.title}, ${f.team}, ${f.dur}"><span class="cn-thumb"><img src="${thumb(f, f.poster, 480)}" alt="" loading="lazy"><img class="anim" alt=""><span class="num">${pad(n + 1)}</span><span class="dur">${f.dur}</span><span class="now"><i></i><i></i><i></i></span></span><b>${f.title}</b><span class="t">${f.team}</span></button></li>`).join('');
  const reelBtns = $$('button', reel);

  function set(n) {
    cur = n; const f = F[n];
    mp.setAttribute('playback-id', f.id);
    mp.setAttribute('poster', thumb(f, f.poster, 1600));
    mp.setAttribute('metadata-video-title', `${f.title} · ${f.team}`);
    glow.src = thumb(f, f.poster, 320);
    $('.cn-no', cn).textContent = `Film ${pad(n + 1)}`;
    $('.cn-dur', cn).textContent = f.dur;
    $('.cn-song', cn).textContent = f.title;
    $('.cn-team', cn).textContent = `${f.team} · ${f.city}`;
    titleBtn.setAttribute('aria-label', `Afspil musikvideoen ${f.title} med ${f.team}`);
    reelBtns.forEach((b, k) => b.setAttribute('aria-current', k === n));
  }
  function play(n, scroll) {
    if (n !== cur) { set(n); cn.classList.remove('rolling') }
    if (scroll) cn.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' });
    customElements.whenDefined('mux-player').then(() => { const p = mp.play(); p && p.catch(() => cn.classList.remove('rolling')) });
  }
  window.Lykke.cinema = { play };
  titleBtn.addEventListener('click', () => play(cur));
  reelBtns.forEach(b => {
    const n = +b.dataset.n, anim = $('.anim', b);
    b.addEventListener('click', () => play(n));
    /* levende forhåndsvisning hentes først, når man peger på filmen */
    const loadAnim = () => { if (RM || anim.src) return; anim.onload = () => anim.classList.add('ready'); anim.src = `https://image.mux.com/${F[n].id}/animated.webp?start=${F[n].preview}&end=${F[n].preview + 4}&width=400&fps=12` };
    b.addEventListener('mouseenter', loadAnim); b.addEventListener('focus', loadAnim);
  });
  const emit = playing => document.dispatchEvent(new CustomEvent('lykke:film', { detail: { index: cur, ...F[cur], playing } }));
  mp.addEventListener('play', () => { cn.classList.add('rolling'); window.Lykke.album?.pause(); $('#opturVideo')?.pause?.(); emit(true) });
  mp.addEventListener('playing', () => cn.classList.remove('paused'));
  mp.addEventListener('pause', () => { cn.classList.add('paused'); emit(false) });
  mp.addEventListener('ended', () => { cn.classList.remove('rolling'); emit(false); if (cur < F.length - 1) set(cur + 1) });
  $('#opturVideo')?.addEventListener('play', () => mp.pause?.());
  document.addEventListener('lykke:track', e => { if (e.detail.playing) mp.pause?.() });
  set(0);
}

layoutTicks(); onScroll();
})();
