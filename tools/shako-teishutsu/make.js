// 「車庫証明の提出の仕方」の PDF を作り直す
// 使い方（リポジトリの一番上で実行）:
//   node tools/shako-teishutsu/make.js            … shako-teishutsu.pdf を上書き
//   node tools/shako-teishutsu/make.js out.pdf    … 別の名前で書き出す（確認用）
// 必要なもの: playwright（Chromium）
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const here = __dirname;
  const out = path.resolve(process.argv[2] || path.join(here, "..", "..", "shako-teishutsu.pdf"));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.join(here, "shako-teishutsu.html"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log("書き出しました: " + out);
})();
