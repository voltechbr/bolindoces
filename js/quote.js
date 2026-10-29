/* Bolin Doces — formulário de orçamento de bolos (exatamente 4 campos)
   Tamanho do bolo · Sabor ou recheio · Decoração · Data de entrega
   O envio é feito pelo próprio cliente no WhatsApp; nada é enviado automaticamente. */
(function () {
  var WA = window.BolinWhatsApp;
  var dlg = document.querySelector('[data-quote]');
  if (!WA || !dlg) return;

  var form = dlg.querySelector('[data-quote-form]');
  var status = dlg.querySelector('[data-quote-status]');
  var FIELDS = {
    tamanho:   { msg: 'Informe o tamanho desejado.' },
    sabor:     { msg: 'Informe o sabor ou recheio desejado.' },
    decoracao: { msg: 'Descreva a decoração desejada.' },
    data:      { msg: 'Informe a data de entrega.' }
  };
  var lastFocus = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); } // data LOCAL
  function validISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return false;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3];
  }

  function input(name) { return form.elements[name]; }
  function errEl(name) { return form.querySelector('[data-error="' + name + '"]'); }
  function setError(name, message) {
    var i = input(name), e = errEl(name);
    if (message) { i.setAttribute('aria-invalid', 'true'); e.textContent = message; e.hidden = false; }
    else { i.removeAttribute('aria-invalid'); e.textContent = ''; e.hidden = true; }
  }

  function validate() {
    var first = null, ok = true;
    Object.keys(FIELDS).forEach(function (name) {
      var v = input(name).value.trim(), msg = '';
      if (!v) msg = FIELDS[name].msg;
      else if (name === 'data') {
        if (!validISO(v)) msg = 'Informe uma data válida.';
        else if (v < todayISO()) msg = 'A data de entrega não pode ser anterior a hoje.';
      }
      setError(name, msg);
      if (msg) { ok = false; if (!first) first = input(name); }
    });
    if (first) first.focus();
    return ok;
  }

  function open(trigger) {
    lastFocus = trigger || null;
    input('data').min = todayISO();      // impede selecionar data passada no calendário
    status.textContent = '';
    dlg.showModal();
  }

  form.addEventListener('input', function (e) { if (e.target.name) setError(e.target.name, ''); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    input('data').min = todayISO();
    if (!validate()) { status.textContent = ''; return; }
    var msg = WA.quoteMessage({
      tamanho: input('tamanho').value, sabor: input('sabor').value,
      decoracao: input('decoracao').value, data: input('data').value
    });
    WA.open(WA.link(msg));
    // Abrir o WhatsApp não envia a mensagem: o cliente revisa e envia por lá.
    status.textContent = 'Abrimos o WhatsApp com a mensagem pronta. Ela só é enviada quando você tocar em enviar no aplicativo.';
  });

  dlg.querySelector('[data-quote-close]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });

  document.querySelectorAll('[data-quote-open]').forEach(function (b) {
    b.addEventListener('click', function () { open(b); });
  });

  window.BolinQuote = { open: open, validate: validate };
})();
