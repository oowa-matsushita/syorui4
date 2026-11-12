// 書類印刷システム 利用回数カウンター
// スプレッドシートの「拡張機能 → Apps Script」に、このコードをまるごと貼り付けて使います。

const SHEET = "ログ";
const TZ = "Asia/Tokyo";

function doGet(e) {
  const p = (e && e.parameter) || {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(["日時", "印刷した書類", "部数"]);

  if (p.action === "log") {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sh.appendRow([Utilities.formatDate(new Date(), TZ, "yyyy/MM/dd HH:mm:ss"), String(p.docs || "").slice(0, 400), Number(p.n) || 0]);
    } finally { lock.releaseLock(); }
    return out({ ok: true });
  }

  // 回数を返す
  const last = sh.getLastRow();
  const rows = last > 1 ? sh.getRange(2, 1, last - 1, 1).getDisplayValues() : [];
  const today = Utilities.formatDate(new Date(), TZ, "yyyy/MM/dd");
  const month = today.slice(0, 7);
  let t = 0, m = 0;
  rows.forEach(([d]) => { d = String(d); if (d.startsWith(month)) { m++; if (d.startsWith(today)) t++; } });
  return out({ total: rows.length, month: m, today: t, since: rows.length ? String(rows[0][0]).slice(0, 10) : "" });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
