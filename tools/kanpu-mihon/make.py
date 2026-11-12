"""還付書類の見本（書き方例）を作る

使い方（リポジトリの一番上で実行）:
  python3 tools/kanpu-mihon/make.py saga            … 佐賀県の見本を作り直す（mihon-kanpu-saga.jpg を上書き）
  python3 tools/kanpu-mihon/make.py saga kagawa     … 複数まとめて
  python3 tools/kanpu-mihon/make.py --all           … config.py の全部
  python3 tools/kanpu-mihon/make.py --grid saga 0 100 1240 500
      … 座標を調べるための方眼入り切り抜き画像を tools/kanpu-mihon/work/g_saga.png に出す

必要なもの: pip install pymupdf pillow playwright / playwright install chromium / 日本語フォント（Noto CJK）
"""
import asyncio, json, re, sys
from pathlib import Path
import pymupdf
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright
from config import cfg

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
WORK = HERE / "work"
WORK.mkdir(exist_ok=True)

CSS = """
html, body { margin: 0; }
body { position: relative; font-family: "Noto Sans CJK JP", sans-serif; background: #fff; overflow: hidden; }
.form { position: absolute; left: 0; top: 0; }
.abs { position: absolute; }
.title { padding: 4px 20px; border: 5px solid #D7262B; border-radius: 18px; background: #fff; color: #D7262B; font-weight: 900; font-size: 34px; letter-spacing: .04em; }
.box { border: 5px solid #D7262B; background: rgba(255,255,255,.97); color: #D7262B; font-weight: 900; line-height: 1.3; padding: 10px 18px; border-radius: 8px; font-size: 30px; }
.box.nw { white-space: nowrap; font-size: 26px; padding: 6px 14px; }
.box .s { display: block; font-size: 21px; font-weight: 700; color: #333; margin-top: 6px; line-height: 1.5; }
.ring { border: 6px solid #D7262B; border-radius: 16px; }
.ring.c { border-radius: 50%; }
.ink { color: #1F3F9A; font-family: "Noto Serif CJK JP", serif; font-weight: 600; white-space: nowrap; line-height: 1; }
.seal { border-radius: 50%; border: 4px solid #D7262B; color: #D7262B; display: grid; place-items: center;
  font-family: "Noto Serif CJK JP", serif; font-weight: 700; writing-mode: vertical-rl; letter-spacing: .05em; }
.banner { border: 6px solid #D7262B; background: #fff; color: #D7262B; font-weight: 900; font-size: 34px; text-align: center; padding: 12px 0; line-height: 1.4; }
.banner small { display: block; font-size: 22px; color: #333; font-weight: 700; }
svg { position: absolute; left: 0; top: 0; }
"""

def build(c):
    W, H = c["size"]
    h = [f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>{CSS} body{{width:{W}px;height:{H}px}} .form{{width:{W}px;height:{H}px}}</style></head><body>',
         f'<img class="form" src="{c["img"]}">']
    for x, y, t, s, *rest in c["ink"]:
        ls = rest[0] if rest else 0
        h.append(f'<div class="abs ink" style="left:{x}px;top:{y}px;font-size:{s}px;letter-spacing:{ls}em">{t}</div>')
    for (cx, cy, d) in c["seals"]:
        h.append(f'<div class="abs seal" style="left:{cx-d/2}px;top:{cy-d/2}px;width:{d}px;height:{d}px;font-size:{d*0.32}px">静岡</div>')
    for r in c["rings"]:
        if len(r) == 3:   # 円 (cx, cy, d)
            cx, cy, d = r
            h.append(f'<div class="abs ring c" style="left:{cx-d/2}px;top:{cy-d/2}px;width:{d}px;height:{d}px"></div>')
        else:
            x, y, w, hh = r
            h.append(f'<div class="abs ring" style="left:{x}px;top:{y}px;width:{w}px;height:{hh}px"></div>')
    h.append(f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#D7262B"/></marker></defs><g stroke="#D7262B" stroke-width="9" fill="none" marker-end="url(#ah)" stroke-linecap="round">')
    for a in c["arrows"]:
        h.append(f'<path d="M{a[0]},{a[1]} L{a[2]},{a[3]}"/>')
    h.append('</g></svg>')
    for b in c["boxes"]:
        x, y, w, title, sub = b
        if w == "nw":
            h.append(f'<div class="abs box nw" style="left:{x}px;top:{y}px">{title}</div>')
        else:
            h.append(f'<div class="abs box" style="left:{x}px;top:{y}px;width:{w}px">{title}' + (f'<span class="s">{sub}</span>' if sub else '') + '</div>')
    tx, ty = c.get("title", (18, 14))
    h.append(f'<div class="abs title" style="left:{tx}px;top:{ty}px">書き方例</div>')
    bt, bl, br, main, sub = c["banner"]
    h.append(f'<div class="abs banner" style="top:{bt}px;left:{bl}px;right:{br}px">{main}<small>{sub}</small></div>')
    h.append('</body></html>')
    return "".join(h)


def pdf_of(key):
    """data.js から、その見本に対応するPDFのファイル名を探す"""
    s = (ROOT / "data.js").read_text(encoding="utf-8")
    m = re.search(r'file: "([^"]+)",\s*mihon: "mihon-kanpu-' + re.escape(key) + r'\.jpg"', s)
    if not m: sys.exit(f"data.js に mihon-kanpu-{key}.jpg の行が見つかりません")
    return ROOT / m.group(1)

def render_page(key):
    """PDFの1ページ目を、長い辺1754pxの画像にする（座標の基準）"""
    doc = pymupdf.open(pdf_of(key)); pg = doc[0]
    k = 1754 / max(pg.rect.width, pg.rect.height)
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(k, k), alpha=False)
    out = WORK / f"{key}-1.png"; pix.save(out)
    return out

def grid(key, x0, y0, x1, y1):
    src = render_page(key)
    im = Image.open(src).convert("RGB").crop((x0, y0, x1, y1)); d = ImageDraw.Draw(im)
    try: font = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 16)
    except OSError: font = None
    for x in range((x0 // 50 + 1) * 50, x1, 50):
        d.line([(x - x0, 0), (x - x0, y1 - y0)], fill=(255, 0, 0) if x % 100 == 0 else (255, 170, 170))
        if x % 100 == 0: d.text((x - x0 + 2, 2), str(x), fill=(255, 0, 0), font=font)
    for y in range((y0 // 50 + 1) * 50, y1, 50):
        d.line([(0, y - y0), (x1 - x0, y - y0)], fill=(0, 0, 255) if y % 100 == 0 else (170, 170, 255))
        if y % 100 == 0: d.text((2, y - y0 + 2), str(y), fill=(0, 0, 255), font=font)
    im.save(WORK / f"g_{key}.png"); print(WORK / f"g_{key}.png")

async def make(keys):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for key in keys:
            c = dict(cfg[key]); img = render_page(key)
            c["img"] = img.name; c["size"] = list(Image.open(img).size)
            W, H = c["size"]
            html = WORK / f"m_{key}.html"; html.write_text(build(c), encoding="utf-8")
            pg = await b.new_page(viewport={"width": W, "height": H})
            await pg.goto(html.as_uri()); await pg.wait_for_timeout(300)
            png = WORK / f"out_{key}.png"; await pg.screenshot(path=str(png)); await pg.close()
            Image.open(png).convert("RGB").save(ROOT / f"mihon-kanpu-{key}.jpg", quality=85)
            print("作成:", f"mihon-kanpu-{key}.jpg")
        await b.close()

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    if a[0] == "--grid": grid(a[1], *map(int, a[2:6]))
    else: asyncio.run(make(list(cfg) if a[0] == "--all" else a))
