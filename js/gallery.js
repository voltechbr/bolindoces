/* Bolin Doces — foto ampliada (lightbox) e setas da faixa de bolos */
(function () {
  var dlg = document.querySelector('[data-lightbox-dialog]');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));

  /* ----- foto ampliada ----- */
  if (dlg && triggers.length) {
    var img = dlg.querySelector('[data-lightbox-img]');
    var cap = dlg.querySelector('[data-lightbox-caption]');
    var idx = 0, lastFocus = null;

    function show(i, instant) {
      idx = (i + triggers.length) % triggers.length;
      var t = triggers[idx];
      var apply = function () {
        img.src = t.getAttribute('data-lightbox');
        img.alt = t.getAttribute('data-alt') || '';
        cap.textContent = t.getAttribute('data-caption') || '';
        img.classList.remove('is-swapping');
      };
      if (instant) { apply(); return; }
      img.classList.add('is-swapping');
      setTimeout(apply, 180);
    }
    function open(t) {
      lastFocus = t; show(triggers.indexOf(t), true);
      /* O dialog fica na camada superior do navegador. Coloque o cursor dentro dele enquanto a foto está ampliada, para que a fatia continue visível. */
      var cakeCursor = document.querySelector('[data-cake-cursor]');
      if (cakeCursor && cakeCursor.parentNode !== dlg) dlg.appendChild(cakeCursor);
      dlg.showModal();
    }
    triggers.forEach(function (t) { t.addEventListener('click', function () { open(t); }); });
    dlg.querySelector('[data-lightbox-close]').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      var cakeCursor = dlg.querySelector('[data-cake-cursor]');
      if (cakeCursor) document.body.appendChild(cakeCursor);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    // deslizar no celular
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ----- setas da faixa de bolos ----- */
  var track = document.querySelector('[data-cake-track]');
  var prev = document.querySelector('[data-cake-prev]');
  var next = document.querySelector('[data-cake-next]');
  if (track && prev && next) {
    function step() { var c = track.querySelector('.cake'); return c ? c.getBoundingClientRect().width + 20 : 300; }
    function sync() {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    sync();
  }
})();
