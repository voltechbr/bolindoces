/* Bolin Doces — links do WhatsApp
   Abrir o WhatsApp NÃO envia nada: o cliente revisa e envia a mensagem no aplicativo.
   Todo elemento com [data-wa] recebe o link do número configurado em js/catalog.js. */
(function () {
  var C = window.BOLIN_CATALOG;
  if (!C) return;

  function clean(v) { return String(v == null ? '' : v).replace(/\s*[\r\n]+\s*/g, ' ').replace(/\s+/g, ' ').trim(); }
  function number() { return String(C.contact.whatsapp).replace(/\D/g, ''); }
  /* https://wa.me/<número>?text=<mensagem codificada> */
  function link(text) {
    return 'https://wa.me/' + number() + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* '2026-11-05' -> '05/11/2026' (sem Date, para não sofrer com fuso horário) */
  function brDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : clean(iso);
  }

  function quoteMessage(f) {
    return [
      'Olá! Vim pelo site da Bolin Doces e gostaria de solicitar um orçamento de bolo.',
      ['Tamanho: ' + clean(f.tamanho), 'Sabor ou recheio: ' + clean(f.sabor),
       'Decoração: ' + clean(f.decoracao), 'Data de entrega: ' + brDate(f.data)].join('\n'),
      'Aguardo o orçamento. Obrigado(a)!'
    ].join('\n\n');
  }

  var GREETING = 'Oi, tudo bem? 😊 Conheci a Bolin Doces pelo site e adorei os produtos! Queria saber um pouquinho mais sobre as encomendas e as opções disponíveis 🍰💕';
  var MESSAGES = { info: GREETING, pedido: GREETING, cones: GREETING, docinhos: GREETING };
  var INFO = MESSAGES.info;
  var ORDER = MESSAGES.pedido;

  /* Abre em nova aba/app, com um <a> clicado por script (mais confiável que window.open em celulares). */
  function open(url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
  }

  window.BolinWhatsApp = { number: number, link: link, open: open, brDate: brDate, quoteMessage: quoteMessage, infoMessage: INFO, orderMessage: ORDER, messages: MESSAGES };

  // data-wa pode selecionar uma mensagem contextual; padrão: pedido.
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var kind = a.getAttribute('data-wa') || 'pedido';
    a.href = link(MESSAGES[kind] || ORDER);
    a.target = '_blank'; a.rel = 'noopener noreferrer';
  });
})();
