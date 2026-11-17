// 軽自動車「申請依頼書」の見本（書き方例）を作る
// 使い方（リポジトリの一番上で実行）:
//   node tools/shinsei-irai/make.js          … 4枚とも作り直す（mihon-shinsei-irai-*.jpg を上書き）
//   node tools/shinsei-irai/make.js kounyu   … 1枚だけ（キーは下の SAMPLES）
// 必要なもの: playwright（Chromium）、pdftoppm（poppler-utils）
// 座標は shinsei-irai.pdf を長い辺 1754px の画像にしたときのピクセル（左上が0,0）。
// 決まり（利用者と合意済み）：押印なし（記入だけ）。購入用＝使用者・所有者の欄、下取り用＝旧所有者の欄。
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const HERE = __dirname;
const ROOT = path.join(HERE, "..", "..");
const WORK = path.join(HERE, "work");
const PDF = path.join(ROOT, "shinsei-irai.pdf");

// 記入例の文字
const ADDR = "静岡県掛川市〇〇町１２３番地";
const KOJIN = "静岡　太郎";
const HOJIN = "株式会社〇〇〇〇　代表取締役　〇〇〇〇";

// 欄の位置（文字の左端 x と、下線の y）
const F = {
  userName:  [318, 803], userAddr:  [318, 884],   // 使用者
  ownerName: [318, 993], ownerAddr: [318, 1073],  // 所有者
  oldName:   [1160, 993], oldAddr:  [1160, 1073], // 旧所有者
};
// 下線の右端（文字がはみ出さないよう、長い名前はここまでに収まる大きさにする）
const RIGHT = { user: 830, owner: 830, old: 1590 };

const SAMPLES = {
  "kounyu":          { label: "個人・ご購入",   name: KOJIN, fields: ["user", "owner"] },
  "kounyu-houjin":   { label: "法人・ご購入",   name: HOJIN, fields: ["user", "owner"] },
  "shitadori":       { label: "個人・下取り",   name: KOJIN, fields: ["old"] },
  "shitadori-houjin":{ label: "法人・下取り",   name: HOJIN, fields: ["old"] },
};

function html(key, s) {
  const ink = [];
  const ring = [];
  const isOld = s.fields[0] === "old";
  for (const f of s.fields) {
    const [nx, ny] = F[f + "Name"], [ax, ay] = F[f + "Addr"];
    const size = Math.min(34, Math.floor((RIGHT[f] - nx) / s.name.length));
    ink.push(`<div class="ink" style="left:${nx}px;top:${ny - size - 8}px;font-size:${size}px">${s.name}</div>`);
    ink.push(`<div class="ink" style="left:${ax}px;top:${ay - 34}px;font-size:28px">${ADDR}</div>`);
  }
  // 赤い囲み・説明・矢印
  let box1, arrow1, extra = "";
  if (isOld) {
    ring.push([960, 935, 660, 160]);
    box1 = { x: 900, y: 690, w: 720, t: "① 住所・氏名（名称）をご記入ください", s: "「旧所有者」の欄です。車検証と同じ住所・氏名でお願いします。" };
    arrow1 = [1290, 860, 1290, 930];
  } else {
    ring.push([118, 756, 750, 344]);
    box1 = { x: 900, y: 720, w: 720, t: "① 住所・氏名（名称）をご記入ください", s: "「使用者」と「所有者」の両方の欄にお願いします。<br>印鑑証明書や住民票と同じ住所・氏名でお願いします。" };
    arrow1 = [900, 830, 878, 830];
    // 所有権が付くとき（ローンなど）は所有者の欄を空ける（利用者の指示）
    extra = `<div class="note" style="left:232px;top:904px">※所有権が付く場合（ローンなど）は、「所有者」の欄は空欄のままにしてください</div>`;
  }
  ring.push([170, 660, 210, 52]);   // 年月日
  const box2 = { x: 420, y: 650 };
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
@font-face { font-family: "Mincho"; src: url(fonts/biz-udpmincho-latin-400-normal.woff2) format("woff2"); unicode-range: U+0000-00FF; }
@font-face { font-family: "Mincho"; src: url(fonts/biz-udpmincho-japanese-400-normal.woff2) format("woff2"); }
@font-face { font-family: "Gothic"; font-weight: 400; src: url(../shako-teishutsu/fonts/biz-udpgothic-japanese-400-normal.woff2) format("woff2"); }
@font-face { font-family: "Gothic"; font-weight: 700; src: url(../shako-teishutsu/fonts/biz-udpgothic-japanese-700-normal.woff2) format("woff2"); }
html, body { margin: 0; }
body { position: relative; width: 1754px; height: 1241px; overflow: hidden; background: #fff; font-family: "Gothic", sans-serif; }
.form { position: absolute; left: 0; top: 0; width: 1754px; }
.ink { position: absolute; color: #1F3F9A; font-family: "Mincho", serif; white-space: nowrap; line-height: 1; }
.ring { position: absolute; border: 6px solid #D7262B; border-radius: 16px; }
.title { position: absolute; left: 18px; top: 14px; padding: 4px 20px; border: 5px solid #D7262B; border-radius: 18px; background: #fff; color: #D7262B; font-weight: 700; font-size: 40px; letter-spacing: .04em; }
.title small { font-size: 26px; margin-left: 6px; }
.box { position: absolute; border: 5px solid #D7262B; background: rgba(255,255,255,.97); color: #D7262B; font-weight: 700; line-height: 1.3; padding: 10px 18px; border-radius: 8px; font-size: 30px; }
.box .s { display: block; font-size: 21px; color: #333; margin-top: 6px; line-height: 1.5; }
.note { position: absolute; white-space: nowrap; color: #D7262B; font-weight: 700; font-size: 19px; background: #fff; padding: 2px 8px; border: 3px solid #D7262B; border-radius: 6px; }
.box.nw { white-space: nowrap; font-size: 26px; padding: 6px 14px; }
.banner { position: absolute; left: 60px; right: 60px; top: 1132px; border: 6px solid #D7262B; background: #fff; color: #D7262B; font-weight: 700; font-size: 34px; text-align: center; padding: 10px 0; line-height: 1.4; }
.banner small { display: block; font-size: 22px; color: #333; }
svg { position: absolute; left: 0; top: 0; }
</style></head><body>
<img class="form" src="work/base.png">
${ink.join("\n")}
${ring.map(([x, y, w, h]) => `<div class="ring" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`).join("\n")}
<svg width="1754" height="1241"><defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#D7262B"/></marker></defs>
<g stroke="#D7262B" stroke-width="9" fill="none" marker-end="url(#ah)" stroke-linecap="round">
<path d="M${arrow1[0]},${arrow1[1]} L${arrow1[2]},${arrow1[3]}"/>
<path d="M${box2.x},${box2.y + 24} L${385},${686}"/>
</g></svg>
<div class="box" style="left:${box1.x}px;top:${box1.y}px;width:${box1.w}px">${box1.t}<span class="s">${box1.s}</span></div>
<div class="box nw" style="left:${box2.x}px;top:${box2.y}px">② 日付は書かないでください</div>
${extra}
<div class="title">書き方例<small>（${s.label}）</small></div>
<div class="banner">ご記入は①だけでオッケーです。押印はいりません。<small>日付・代理人・車両番号などの欄は、こちらで記入します。</small></div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  execFileSync("pdftoppm", ["-png", "-scale-to", "1754", "-singlefile", PDF, path.join(WORK, "base")]);
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SAMPLES);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1754, height: 1241 } });
  for (const key of keys) {
    if (!SAMPLES[key]) { console.error("キーが違います: " + key); continue; }
    const file = path.join(HERE, `m_${key}.html`);
    fs.writeFileSync(file, html(key, SAMPLES[key]));
    await pg.goto("file://" + file);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(200);
    const out = path.join(ROOT, `mihon-shinsei-irai-${key}.jpg`);
    await pg.screenshot({ path: out, type: "jpeg", quality: 85 });
    fs.unlinkSync(file);
    console.log("作成: " + path.basename(out));
  }
  await b.close();
})();
