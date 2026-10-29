(() => {
  const loader = document.querySelector('[data-brand-loader]');
  if (!loader) return;
  let dismissed = false;
  const started = performance.now();
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 400);
  };
  // Exibe por um instante para dar contexto, mas nunca segura a página por mais de 2,8 s.
  const minimum = window.setTimeout(dismiss, 1150);
  window.setTimeout(() => { window.clearTimeout(minimum); dismiss(); }, 2800);
  if (document.readyState === 'complete') {
    if (performance.now() - started >= 900) dismiss();
  } else {
    window.addEventListener('load', () => {
      const remaining = Math.max(0, 950 - (performance.now() - started));
      window.setTimeout(dismiss, remaining);
    }, { once: true });
  }
  window.addEventListener('pageshow', (event) => { if (event.persisted) dismiss(); }, { once: true });
})();
