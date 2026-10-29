/* Bolin Doces — hero com vídeo, barra fixa e entrada das seções
   - escolhe a versão do vídeo conforme a largura da tela
   - respeita "reduzir movimento" e economia de dados (mantém só a imagem)
   - mostra o vídeo apenas quando ele realmente começa a tocar
   - pausa quando o hero sai da tela */
(function () {
  var year = document.getElementById('ano');

  if (year) year.textContent = new Date().getFullYear();

  /* Cursor ilustrado, apenas para dispositivos com mouse. */
  var cakeCursor = document.querySelector('[data-cake-cursor]');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cakeCursor && finePointer && !reducedMotion) {
    var pointerSeen = false;
    window.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      cakeCursor.style.left = event.clientX + 'px';
      cakeCursor.style.top = event.clientY + 'px';
      if (!pointerSeen) {
        pointerSeen = true;
        cakeCursor.classList.add('is-ready');
      }
    }, { passive: true });
    window.addEventListener('pointerdown', function () {
      cakeCursor.classList.add('is-clicking');
    }, { passive: true });
    window.addEventListener('pointerup', function () {
      cakeCursor.classList.remove('is-clicking');
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      cakeCursor.classList.remove('is-ready');
    });
    document.addEventListener('mouseenter', function () {
      if (pointerSeen) cakeCursor.classList.add('is-ready');
    });
  }

  /* Barra fixa: aparece depois que o hero sai da tela */
  var bar = document.querySelector('[data-topbar]');
  var hero = document.getElementById('inicio');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      bar.classList.toggle('is-on', !es[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  /* Entrada suave durante a rolagem (escalonada dentro do mesmo grupo) */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (n) { n.classList.add('is-in'); });
  } else {
    var seen = new Map();
    items.forEach(function (n) {
      var g = n.parentElement, i = seen.get(g) || 0;
      n.style.setProperty('--delay', Math.min(i, 6) * 70 + 'ms'); seen.set(g, i + 1);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  }

  var video = document.querySelector('[data-hero-video]');
  if (!video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var saveData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
  if (reduceMotion || saveData) return; // a imagem de fallback permanece

  var small = window.matchMedia('(max-width: 899px)').matches;
  var base = small ? 'assets/video/hero-mobile' : 'assets/video/hero';
  [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (f) {
    var s = document.createElement('source');
    s.src = base + '.' + f[0];
    s.type = f[1];
    video.appendChild(s);
  });

  video.muted = true;
  video.defaultMuted = true;
  video.addEventListener('playing', function () { video.classList.add('is-playing'); });

  function tryPlay() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {
      // Autoplay bloqueado (ex.: modo de baixo consumo): tenta no primeiro toque.
      var once = function () { video.play().catch(function () {}); };
      window.addEventListener('pointerdown', once, { once: true });
    });
  }
  video.load();
  tryPlay();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (video.paused) tryPlay(); } else { video.pause(); }
      });
    }, { threshold: 0.1 }).observe(video);
  }
})();
