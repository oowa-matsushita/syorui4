// 書類印刷システム 利用回数カウンター（Cloudflare Workers + D1）
//   /api/count?action=log&docs=…&n=…  … 印刷ボタンが押されたときに1行記録
//   /api/count?action=count           … 今日・今月・合計と、日ごとの回数を返す
// それ以外のURLは、リポジトリのファイル（index.html や PDF）をそのまま返す。

const TZ_OFFSET = 9 * 60 * 60 * 1000;   // 日本時間

function jstNow() {
  // "2026/11/13 09:05:00" の形（日本時間）
  return new Date(Date.now() + TZ_OFFSET).toISOString().slice(0, 19).replace("T", " ").replace(/-/g, "/");
}

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

let ready = false;
async function setup(db) {
  if (ready) return;
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, docs TEXT, n INTEGER)"
  ).run();
  ready = true;
}

async function counter(url, env) {
  if (!env.DB) return json({ error: "データベースが設定されていません" }, 500);
  await setup(env.DB);
  const p = url.searchParams;

  if (p.get("action") === "log") {
    const docs = String(p.get("docs") || "").slice(0, 400);
    const n = Math.max(0, Math.min(999, parseInt(p.get("n"), 10) || 0));
    await env.DB.prepare("INSERT INTO log (at, docs, n) VALUES (?, ?, ?)").bind(jstNow(), docs, n).run();
    return json({ ok: true });
  }

  // 回数を返す
  const now = jstNow();
  const today = now.slice(0, 10), month = now.slice(0, 7);
  const [sum, days] = await env.DB.batch([
    env.DB.prepare(
      "SELECT COUNT(*) AS total, SUM(substr(at,1,7)=?) AS month, SUM(substr(at,1,10)=?) AS today, MIN(at) AS since FROM log"
    ).bind(month, today),
    env.DB.prepare(
      "SELECT substr(at,1,10) AS day, COUNT(*) AS c FROM log GROUP BY day ORDER BY day DESC LIMIT 31"
    ),
  ]);
  const s = sum.results[0] || {};
  return json({
    total: s.total || 0,
    month: s.month || 0,
    today: s.today || 0,
    since: s.since ? String(s.since).slice(0, 10) : "",
    days: days.results || [],
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/count") {
      try { return await counter(url, env); }
      catch (e) { return json({ error: String(e && e.message || e) }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};
