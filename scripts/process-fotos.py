"""Gera as fotos do site (assets/img/fotos/*.webp).

Fontes:
  1) Fotos originais individuais:  assets/originals/fotos/
  2) Fotos recortadas da folha composta (assets/originals/folha-de-fotos.png):
     os recortes são salvos SEM perda em assets/originals/folha/ e depois convertidos.
  3) Retrato de Patricia: assets/originals/patricia-bolin.png

Uso: python3 scripts/process-fotos.py   (requer Pillow)
Nunca amplia imagens: cada largura é limitada ao tamanho real do arquivo.
Os limites dos recortes (x0, y0, x1, y1) foram detectados na folha de 2000x2000 px
e recuados 2 px para não carregar borda branca nem pedaços de outras fotos."""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = f"{ROOT}/assets/originals/"
OUT = f"{ROOT}/assets/img/fotos/"
INSET = 2
WIDTHS = [480, 960, 1600]
os.makedirs(OUT, exist_ok=True); os.makedirs(ORIG + "folha", exist_ok=True)

# id -> arquivo original (foto individual já existente no projeto)
FROM_ORIGINALS = {
    "cones-variedade":      "fotos/cones-variedade.png",
    "cone-chocolate-coco":  "fotos/cone-individual.png",
    "cones-trio":           "fotos/cones-sortidos.png",
    "bolo-aranha-azul":     "fotos/bolo-homem-aranha-azul.jpeg",
    "bolo-aranha-vermelho": "fotos/bolo-homem-aranha-listrado.jpeg",
    "bolo-batman":          "fotos/bolo-batman.jpeg",
    "bolo-frozen":          "fotos/bolo-frozen.jpeg",
    "bolo-cervinho":        "fotos/bolo-cervinho-flores.jpeg",
    "bolo-pirulitos":       "fotos/bolo-candy-pirulitos.jpeg",
    "bolo-cerejas":         "fotos/bolo-chocolate-cerejas.jpeg",
    "mesa-casamento":       "fotos/mesa-casamento-docinhos.jpeg",
    "mesa-unicornio":       "fotos/mesa-festa-unicornio.jpeg",
    "bolo-barras-confeitos":"fotos/bolo-barras-chocolate-confeitos.jpeg",
    "patricia-bolin":       "patricia-bolin.png",
}
# id -> caixa na folha composta (fotos que NÃO existiam como arquivo individual)
FROM_SHEET = {
    "cone-perolas":        (715, 4, 1060, 424),
    "bolo-unicornio":      (1449, 4, 1996, 424),
    "docinhos-bandeja":    (5, 1000, 395, 1519),
    "bolo-barras-mesa":    (436, 988, 835, 1519),
    "cone-chocolate-mao":  (856, 1125, 1163, 1509),
    "bolo-marshmallow":    (1501, 1125, 1948, 1461),
    "cones-confeitos":     (4, 1609, 554, 1990),
    "cones-crocantes":     (1334, 1622, 1886, 1996),
}

sheet = Image.open(ORIG + "folha-de-fotos.png").convert("RGB")
sources = {k: Image.open(ORIG + v).convert("RGB") for k, v in FROM_ORIGINALS.items()}
for k, (x0, y0, x1, y1) in FROM_SHEET.items():
    im = sheet.crop((x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET))
    im.save(f"{ORIG}folha/{k}.png")           # recorte sem perda
    sources[k] = im

manifest = {}
for k, im in sorted(sources.items()):
    w, h = im.size
    ws = sorted({min(t, w) for t in WIDTHS})
    # evita gerar duas versões praticamente iguais
    ws = [x for i, x in enumerate(ws) if i == 0 or x - ws[i - 1] > 80]
    if ws[-1] != min(w, WIDTHS[-1]) and w <= WIDTHS[-1]:
        ws[-1] = w
    for t in ws:
        r = im if t == w else im.resize((t, round(h * t / w)), Image.LANCZOS)
        r.save(f"{OUT}{k}-{t}.webp", quality=82, method=6)
    manifest[k] = {"w": w, "h": h, "widths": ws}
json.dump(manifest, open(OUT + "manifest.json", "w"), indent=1)
for k, v in manifest.items(): print(k, v["w"], v["h"], v["widths"])
