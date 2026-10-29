# Bolin Doces — site

Projeto estático (HTML + CSS + JavaScript puro), sem etapa de build e sem dependências.

## Etapas concluídas
- **Etapa 1** — identidade visual e hero com vídeo.
- **Etapa 2** — fotos reais, vitrine de cones e doces, seção de bolos sob orçamento, galeria e catálogo centralizado.
- **Etapa 3** — carrinho (localStorage), finalização pelo WhatsApp, formulário de orçamento de bolos e botão flutuante do WhatsApp.

Não há pagamento, frete nem taxas: nada é enviado automaticamente. O WhatsApp abre com a mensagem pronta e o cliente a envia manualmente.

## Como rodar
```bash
npm run dev            # abre em http://localhost:3000
# ou
python3 -m http.server 8000
```
Abrir o `index.html` direto no navegador também funciona, mas o vídeo e a troca de versões são melhores testados via servidor.

## Estrutura
```
index.html              página (hero, seção de produtos reservada, rodapé)
css/styles.css          tokens de design + estilos (mobile primeiro)
js/catalog.js           CATÁLOGO: produtos, preços, imagens (único arquivo a editar)
js/cart.js              estado do carrinho + localStorage (valores em centavos; recusa bolos)
js/whatsapp.js          mensagens (pedido, orçamento, informações), links wa.me e botão flutuante
js/ui.js                seletor de quantidade e aviso (toast)
js/shop.js              vitrine, bolos, galeria e janela de detalhes (quantidade + adicionar)
js/cart-ui.js           ícone/indicador do carrinho e painel lateral
js/quote.js             modal "Solicite seu orçamento" (4 campos) e validação
tests/e2e.py            82 verificações automatizadas no navegador (Playwright)
js/main.js              carregamento do vídeo do hero
scripts/process-images.py  gera os .webp de assets/img/produtos a partir de assets/originals/fotos
site.webmanifest        ícones/cores do app
assets/
  img/                  logo (png/webp) e posters do hero (fallback do vídeo)
  video/                hero.mp4/.webm (desktop 1280x720), hero-mobile.mp4/.webm (960x540), sem áudio
  icons/                favicon.ico, favicon-32, apple-touch-icon, icon-192/512
  img/produtos/         fotos dos produtos em 4:5, webp em 2 tamanhos (srcset)
  originals/            arquivos originais (logo, vídeo HEVC) e originals/fotos/ (fotos de produtos) — não usados pelo site
```

## Identidade visual
Cores (definidas em `:root` no CSS): `--blush #F8F0F0` (fundo da logo), `--rose #B5808A` (lettering da logo),
`--berry #6E2A41` (avental do vídeo), `--cocoa #2B1218` (chocolate, base escura), `--waffle #E6AE5C` (botões).
Tipografia: Young Serif (títulos) + Figtree (texto), via Google Fonts, com fallbacks do sistema.

## Hero — como funciona
- Imagem de fallback (`hero-poster*.webp`) carrega primeiro; o vídeo entra com fade quando começa a tocar.
- `js/main.js` escolhe a versão desktop ou mobile (corte em 900px) e MP4 (H.264) com WebM (VP9) de alternativa.
- Vídeo: `muted`, `autoplay`, `loop`, `playsinline`, sem controles.
- Com "reduzir movimento" ou economia de dados ativos, só a imagem é exibida.
- O vídeo pausa quando o hero sai da tela.
- Celular: vídeo no topo e texto abaixo, para não cobrir a cena. Desktop: vídeo em tela cheia, texto no canto inferior esquerdo.

## Catálogo e preços (js/catalog.js)
- **Preços:** objeto `PRICES` no topo. Mudar o valor ali atualiza todos os produtos ligados à chave (`cone`, `trufa`, `outros`).
  `outros` (R$ 10,00) está marcado `provisional` e com `TODO(revisar)`.
- **Bolos:** `pricing: 'quote'` — nunca exibem preço; mostram "Valor sob orçamento" e o botão "Solicitar orçamento".
- **Revisão:** abra o site com `?revisao` na URL (ex.: `http://localhost:3000/?revisao`) para ver, em cada produto,
  o que ainda precisa de confirmação (identificação, preço provisório, unidade de venda).
- **Imagens:** para trocar um enquadramento, edite a caixa de corte em `scripts/process-images.py` e rode `python3 scripts/process-images.py`.
- **Para a etapa 3:** `window.BolinSelection` (`toggle`, `has`, `list`) guarda o que o cliente selecionou e dispara o evento
  `bolin:selection-change`. Produtos de bolo (`pricing: 'quote'`) devem alimentar o formulário de orçamento; os demais, o carrinho.

## Carrinho, WhatsApp e orçamento (etapa 3)
- **Número do WhatsApp:** `CONTACT.whatsapp` em `js/catalog.js` (554184691622). Todos os links usam esse valor.
- **Carrinho:** só entram produtos `pricing: 'fixed'` com preço válido; bolos são recusados no código (`BolinCart.add` retorna `false`)
  e removidos se aparecerem no localStorage. O localStorage guarda apenas `{id, qty}` em `bolin-doces:cart:v1`; os preços sempre vêm do catálogo.
- **Mensagens:** `BolinWhatsApp.orderMessage` e `quoteMessage` em `js/whatsapp.js`, nos modelos combinados, codificadas com `encodeURIComponent`.
- **Orçamento:** exatamente 4 campos (tamanho, sabor ou recheio, decoração, data de entrega). Data anterior a hoje é bloqueada.
  O modelo de bolo escolhido NÃO vai na mensagem por padrão; para incluir a linha "Modelo de referência", use `OPTIONS.includeCakeModelInQuote = true`.
- **Testes:** `python3 tests/e2e.py` com o servidor local ligado.

## Pendências conhecidas
- O vídeo enviado tem uma marca d'água "Dola AI" no canto inferior direito. Exporte a versão sem marca d'água
  e regere os arquivos de `assets/video/` e os posters (ver comandos ffmpeg usados: H.264 crf 25/28, VP9 crf 34/37, sem áudio).
- A seção `#produtos` é um espaço reservado para a próxima etapa.
- O favicon foi gerado a partir da logo enviada (nenhum arquivo de favicon separado foi recebido).
- Ainda não há telefone/WhatsApp, endereço ou redes sociais: aguardando os dados oficiais.
- Foram recebidas 13 fotos (o pedido citava 15). Todas estão em `assets/originals/fotos/`.
- Os toppers de alguns bolos mostram nomes de crianças reais; a foto do bolo Batman tem uma criança ao fundo (sem rosto visível). Confirme se há autorização para publicar.
- Não há foto identificada como trufa; o preço de trufa (R$ 10,00) está configurado, mas sem produto associado.
- Teste real pendente: abrir os links no WhatsApp de verdade (celular com app e computador com WhatsApp Web) e conferir acentos, quebras de linha e o botão flutuante.
- Confirmar se os preços de cone e doces são por unidade (a mensagem do pedido usa "unidades × preço"). Não há produto de trufa cadastrado (sem foto identificada); o preço está em `PRICES.trufa`.
