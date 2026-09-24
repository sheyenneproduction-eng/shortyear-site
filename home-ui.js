(function () {
  var d = document.documentElement;
  var still = d.classList.contains('still');
  window.SY = { still: still };
  // L'interrupteur. La bascule passe par une transition de vue quand le navigateur la connaît : un fondu, rien de plus.
  var buttons = document.querySelectorAll('.theme button');
  function mark() { buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === d.getAttribute('data-theme'))); }); }
  mark();
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.set;
      if (t === d.getAttribute('data-theme')) return;
      var apply = function () { d.setAttribute('data-theme', t); mark(); document.dispatchEvent(new CustomEvent('sy-theme')); };
      try { localStorage.setItem('sy-theme', t); } catch (e) {}
      if (document.startViewTransition && !still) document.startViewTransition(apply); else apply();
    });
  });
  // La liste d'attente : maquette, rien ne part.
  document.querySelectorAll('form[data-join]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = document.createElement('p');
      p.className = 'join-done'; p.setAttribute('role', 'status');
      p.textContent = 'You’re on the list. We’ll email you the day Shortyear opens.';
      form.replaceWith(p);
    });
  });
  // Les apparitions : une fois, quand l'élément entre dans l'écran.
  var items = document.querySelectorAll('[data-reveal]');
  if (still || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

(function () {
  var d = document.documentElement, still = window.SY.still;
  var desk = matchMedia('(min-width: 900px)');

  // L'anneau : les semaines avant `lit` pleines, la semaine `lit` en cours (contour et lueur qui respire).
  function setRing(host, lit, now, stagger, from) {
    host.querySelectorAll('.ring g').forEach(function (g) {
      g.querySelectorAll('path').forEach(function (p, i) {
        p.style.transitionDelay = (stagger && !still ? Math.max(0, i - (from || 0)) * stagger : 0) + 'ms';
        p.classList.toggle('on', i < lit);
        p.classList.toggle('now', !!now && i === lit);
      });
    });
  }
  function onView(el, fn, opts) {
    if (!el) return;
    if (still || !('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { fn(); io.disconnect(); } }); }, opts || { threshold: .35 });
    io.observe(el);
  }

  // Le haut de page : les semaines 1 à 3 s'allument, la 4 devient la semaine en cours, puis la lumière court sur elles.
  var hero = document.querySelector('.hero-stage');
  setRing(hero, 0, false);
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    d.classList.add('go'); hero.classList.add('lit');
    setTimeout(function () { setRing(hero, 3, true, 150); }, still ? 0 : 450);
  }); });

  // Les écrans du téléphone se succèdent, et un reflet les balaie à chaque changement. Seulement quand il est à l'écran.
  function cycle(ph, every) {
    var list = ph.querySelectorAll('.scr'), i = 0;
    if (still || list.length < 2 || /[?&]shoot/.test(location.search)) return;
    setInterval(function () {
      var host = ph.closest('[data-live]') || ph;
      if (document.hidden || (host.hasAttribute('data-live') && !host.classList.contains('live'))) return;
      list[i].removeAttribute('data-on'); i = (i + 1) % list.length; list[i].setAttribute('data-on', '');
      ph.classList.remove('sweeping'); void ph.offsetWidth; ph.classList.add('sweeping');
    }, every);
  }
  document.querySelectorAll('[data-cycle], .m-cycle').forEach(function (ph) { cycle(ph, 4200); });
  if (/[?&]shoot/.test(location.search)) document.querySelectorAll('.scroller .roll').forEach(function (r) { r.style.animation = 'none'; });

  // 52 WEEKS : les 52 semaines s'allument puis s'éteignent avec la distance ; l'anneau des 12 prend le relais.
  var ticks = document.querySelector('[data-ticks]');
  setRing(ticks, 0, false);
  onView(ticks, function () {
    setTimeout(function () { ticks.classList.add('fade'); setRing(ticks, 12, false, 110); }, still ? 0 : 2200);
  }, { threshold: .5 });

  // La scène de WEEK 1, EVERY DAY, EVERY WEEK : l'étape au milieu de l'écran choisit l'écran du téléphone.
  var story = document.getElementById('story');
  var sph = story.querySelector('.phone'), sscr = sph.querySelectorAll('.scr');
  function step(n) {
    if (story.getAttribute('data-step') === String(n)) return;
    story.setAttribute('data-step', n);
    sscr.forEach(function (s, i) { if (i === n - 1) s.setAttribute('data-on', ''); else s.removeAttribute('data-on'); });
    sph.classList.remove('sweeping'); void sph.offsetWidth; sph.classList.add('sweeping');
  }
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && desk.matches) step(Number(e.target.getAttribute('data-step'))); }); }, { rootMargin: '-48% 0px -48% 0px' });
    document.querySelectorAll('.flow [data-step]').forEach(function (s) { sio.observe(s); });
  }

  // WEEK 13 et WEEK 0 : l'anneau se remplit jusqu'à 12, un éclair, puis il reste allumé.
  var r13 = document.querySelector('.w13-stage'), r0 = document.querySelector('.end-stage');
  setRing(r13, 3, true); setRing(r0, 0, false);
  onView(r13, function () { r13.classList.add('lit'); setTimeout(function () { setRing(r13, 12, false, 95, 3); r13.classList.add('full'); }, still ? 0 : 500); });
  onView(r0, function () { r0.classList.add('lit'); setTimeout(function () { setRing(r0, 12, false, 120); r0.classList.add('full'); }, still ? 0 : 300); });

  // Ce qui boucle ne tourne qu'à l'écran.
  if ('IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); }); }, { rootMargin: '10% 0px' });
    document.querySelectorAll('[data-live]').forEach(function (el) { lio.observe(el); });
  }
  document.querySelector('.bg').classList.add('live');

  // L'en-tête devient du verre dès qu'on descend.
  var top = document.getElementById('top');
  function head() { top.classList.toggle('solid', scrollY > 24); }
  addEventListener('scroll', head, { passive: true }); head();

  // Le choix du téléphone : iPhone présélectionné sur iPhone, et la phrase qui va avec.
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  document.querySelectorAll('.join-block').forEach(function (b) {
    var note = b.querySelector('.iphone-note');
    var radios = b.querySelectorAll('.platform input');
    function sync() { var v = b.querySelector('.platform input:checked'); note.hidden = !(v && v.value === 'iphone'); }
    if (ios) radios.forEach(function (r) { r.checked = r.value === 'iphone'; });
    radios.forEach(function (r) { r.addEventListener('change', sync); });
    sync();
    // L'envoi réel est dans home.js : la maquette simulait l'inscription, elle ne le fait plus.
  });

  // Les médailles suivent la main, sur ordinateur : elles penchent, leur épaisseur apparaît.
  if (still || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function (el) {
    var c = el.querySelector('.coin'), edge = el.querySelector('.edge');
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    function frame() {
      x += (tx - x) * .12; y += (ty - y) * .12;
      c.style.transform = 'rotateX(' + (-y * 14).toFixed(2) + 'deg) rotateY(' + (x * 16).toFixed(2) + 'deg)';
      edge.style.setProperty('--ex', (-x * 6).toFixed(2) + 'px'); edge.style.setProperty('--ey', (-y * 6).toFixed(2) + 'px');
      raf = (Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001) ? requestAnimationFrame(frame) : 0;
    }
    var zone = el.closest('.slot') || el;
    zone.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width * .9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height * .9)));
      if (!raf) raf = requestAnimationFrame(frame);
    });
    zone.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(frame); });
  });
  // Les filets verticaux du fond : absents derrière le haut de page, demande de Sheyenne du 24 septembre 2026.
  // Ils apparaissent quand le haut de page est à moitié sorti de l'écran.
  var bg = document.querySelector('.bg'), hero = document.querySelector('.hero');
  if (bg && hero) {
    if (!('IntersectionObserver' in window)) { bg.classList.add('past-hero'); }
    else {
      new IntersectionObserver(function (entries) {
        bg.classList.toggle('past-hero', entries[0].intersectionRatio < 0.5);
      }, { threshold: [0, 0.5, 1] }).observe(hero);
    }
  }
})();
