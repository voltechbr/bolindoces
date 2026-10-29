"""Verificações automatizadas (Playwright). Uso: com o servidor ligado (npm run dev ou python3 -m http.server 8000):
   python3 tests/e2e.py [http://localhost:8000]"""
import re, sys
from playwright.sync_api import sync_playwright
URL = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000") + "/index.html"
ok = fail = 0
def check(name, cond, extra=""):
    global ok, fail
    if cond: ok += 1
    else: fail += 1; print("FALHOU:", name, extra)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for label, vp, mobile in [("desktop", {"width": 1440, "height": 900}, False), ("celular", {"width": 390, "height": 844}, True)]:
        ctx = b.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile)
        p = ctx.new_page(); errs = []
        p.on("pageerror", lambda e: errs.append(str(e)))
        p.on("console", lambda m: errs.append(m.text) if m.type == "error" and "fonts.g" not in m.text and "ERR_TUNNEL" not in m.text else None)
        p.goto(URL, wait_until="load"); p.wait_for_timeout(2500)
        T = f"[{label}] "
        # --- remoções ---
        html = p.content()
        text = p.inner_text("body")
        check(T + "sem preços (R$)", "R$" not in text and "R$" not in html)
        check(T + "sem carrinho", p.locator("[data-cart], .cart-btn, [data-cart-open], .cart").count() == 0)
        check(T + "sem checkout", "Finalizar" not in text and "carrinho" not in text.lower())
        check(T + "sem 'Cones e doces'", "Cones e doces" not in text)
        check(T + "sem texto 'selecione as que você quer levar'", "selecione as que" not in text)
        check(T + "sem 'Nosso trabalho em fotos'", "Nosso trabalho em fotos" not in text)
        check(T + "sem 'Valor sob orçamento'", "sob orçamento" not in text)
        # --- hero / vídeo ---
        check(T + "vídeo do hero tocando", p.evaluate("document.querySelector('video').classList.contains('is-playing')"))
        t0 = p.evaluate("document.querySelector('video').currentTime"); p.wait_for_timeout(800)
        check(T + "vídeo avança", p.evaluate("document.querySelector('video').currentTime") > t0)
        # --- WhatsApp ---
        links = p.eval_on_selector_all("[data-wa]", "els => els.map(e => e.href)")
        check(T + "há botões de WhatsApp", len(links) >= 6, len(links))
        check(T + "todos usam o número do projeto", all(l.startswith("https://wa.me/554184691622") for l in links), links)
        # --- imagens ---
        p.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading='eager')"); p.wait_for_timeout(1500)
        broken = p.evaluate("[...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map(i => i.src)")
        check(T + "nenhuma imagem quebrada", not broken, broken)
        check(T + "21 fotos de produto + retrato", p.locator("img[src*='assets/img/fotos/']").count() == 22, p.locator("img[src*='assets/img/fotos/']").count())
        check(T + "sem rolagem horizontal", not p.evaluate("document.documentElement.scrollWidth > innerWidth"))
        # --- barra fixa ---
        check(T + "barra fixa oculta no topo", not p.evaluate("document.querySelector('[data-topbar]').classList.contains('is-on')"))
        p.evaluate("window.scrollTo(0, 1400)"); p.wait_for_timeout(700)
        check(T + "barra fixa aparece ao rolar", p.evaluate("document.querySelector('[data-topbar]').classList.contains('is-on')"))
        # --- animações de entrada ---
        p.evaluate("document.querySelector('#docinhos').scrollIntoView()"); p.wait_for_timeout(1500)
        check(T + "entrada das seções (is-in)", p.locator("#docinhos .is-in").count() >= 3)
        # --- lightbox ---
        p.evaluate("document.querySelector('#cones').scrollIntoView()"); p.wait_for_timeout(600)
        p.locator("#cones .tile__btn").first.click(); p.wait_for_timeout(400)
        check(T + "lightbox abre", p.evaluate("document.querySelector('[data-lightbox-dialog]').open"))
        a = p.get_attribute("[data-lightbox-img]", "src")
        p.click("[data-lightbox-next]"); p.wait_for_timeout(500)
        check(T + "lightbox avança", p.get_attribute("[data-lightbox-img]", "src") != a)
        p.keyboard.press("Escape"); p.wait_for_timeout(200)
        check(T + "lightbox fecha com Esc", not p.evaluate("document.querySelector('[data-lightbox-dialog]').open"))
        # --- orçamento ---
        p.evaluate("document.querySelector('#bolos').scrollIntoView()"); p.wait_for_timeout(500)
        p.click("[data-quote-open]"); p.wait_for_timeout(300)
        check(T + "orçamento abre", p.evaluate("document.querySelector('[data-quote]').open"))
        p.click("[data-quote-form] button[type=submit]"); p.wait_for_timeout(200)
        check(T + "orçamento valida campos vazios", p.locator("[data-error]:not([hidden])").count() == 4)
        p.fill("#q-tamanho", "20 cm"); p.fill("#q-sabor", "Chocolate"); p.fill("#q-decoracao", "Flores"); p.fill("#q-data", "2099-12-31")
        p.evaluate("window.__opened = null; const o = BolinWhatsApp.open; BolinWhatsApp.open = u => { window.__opened = u }")
        p.click("[data-quote-form] button[type=submit]"); p.wait_for_timeout(200)
        url = p.evaluate("window.__opened") or ""
        check(T + "orçamento gera link wa.me com a mensagem", url.startswith("https://wa.me/554184691622?text=") and "Chocolate" in __import__("urllib.parse", fromlist=["x"]).unquote(url), url)
        p.keyboard.press("Escape")
        # --- setas dos bolos (desktop) ---
        if not mobile:
            p.evaluate("document.querySelector('[data-cake-track]').scrollLeft = 0"); p.wait_for_timeout(200)
            p.click("[data-cake-next]"); p.wait_for_timeout(700)
            check(T + "seta dos bolos rola a faixa", p.evaluate("document.querySelector('[data-cake-track]').scrollLeft") > 100)
        check(T + "sem erros de JS/console", not errs, errs)
        ctx.close()
    # movimento reduzido
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    p = ctx.new_page(); p.goto(URL, wait_until="load"); p.wait_for_timeout(1000)
    check("[reduzir movimento] conteúdo visível sem animação", p.evaluate("getComputedStyle(document.querySelector('#docinhos [data-reveal]')).opacity") == "1")
    check("[reduzir movimento] vídeo não inicia (fica o poster)", not p.evaluate("document.querySelector('video').classList.contains('is-playing')"))
    b.close()
print(f"\n{ok} verificações OK, {fail} falharam")
sys.exit(1 if fail else 0)
