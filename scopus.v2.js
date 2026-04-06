// scopus.v2.js — render publications from data/scopus/scopus.json
// and display official metrics from data/scopus/metrics.json.

const DATA_PATH    = "data/scopus/scopus.json";
const METRICS_PATH = "data/scopus/metrics.json";

/* ── utils ────────────────────────────────────────────────────── */

const fmtDate = (iso = "") => {
  if (!iso) return "";
  const [y, m = "01"] = String(iso).split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return Number.isNaN(dt.getTime())
    ? (y || "")
    : dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const bestLink = it => it.doi_url || it.scopus_url || "#";

/** Classify a publication as "conference", "article", or "other". */
const classify = it => {
  const st   = (it.subtype || "").toLowerCase();
  // Use subtypeDescription (the correct field); it.type does not exist in the data model
  const desc = (it.subtypeDescription || "").toLowerCase();
  if (st === "cp" || desc.includes("conference")) return "conference";
  if (st === "ar" || desc.includes("article") || desc.includes("review") || desc.includes("editorial"))
    return "article";
  return "other";
};

const hIndex = (arr = []) => {
  const s = [...arr].map(n => Number(n) || 0).sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] >= i + 1) h = i + 1; else break;
  }
  return h;
};

const setText = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
};

/* ── metrics ─────────────────────────────────────────────────── */

function renderOfficialMetrics(m) {
  // Only trust the official data when the values are actually non-zero
  // (a failed API run writes zeros — treat that the same as no data)
  if (!m || typeof m !== "object") return false;
  const total = Number(m.total_documents);
  const cites = Number(m.total_citations);
  const h     = Number(m.h_index);
  if (!total && !cites && !h) return false;
  setText("m-total", total);
  setText("m-cites", cites);
  setText("m-h",     h);
  return true;
}

function renderComputedMetrics(list) {
  const total = list.length;
  const cites = list.reduce((s, x) => s + (Number(x.cited_by) || 0), 0);
  const h     = hIndex(list.map(x => x.cited_by));
  setText("m-total", total);
  setText("m-cites", cites);
  setText("m-h",     h);
}

/* ── card builder ─────────────────────────────────────────────── */

function card(it, kind) {
  const title      = it.title || "Untitled";
  const venue      = it.venue || (kind === "conference" ? "Conference" : "Journal");
  const date       = fmtDate(it.cover_date || `${it.year || ""}-${it.month || ""}-01`);
  const MINE       = /abou.*hajal/i;
  const authorsHtml = Array.isArray(it.authors) && it.authors.length
    ? it.authors.map(a => MINE.test(a) ? `<strong>${a}</strong>` : a).join(", ")
    : (it.first_author ? `${it.first_author} et al.` : "");
  const href       = bestLink(it);
  const label      = kind === "conference" ? "Conference" : "Journal";

  const el = document.createElement("div");
  el.className = "publication-item";
  el.innerHTML = `
    <div class="publication-info">
      <div class="publication-meta">
        <span class="publication-label">${label}</span>
        <span class="publication-date">${date}</span>
        ${venue ? `<a class="publication-category" href="${href}" target="_blank" rel="noopener">${venue}</a>` : ""}
      </div>
      <h3 class="publication-title">
        <a href="${href}" target="_blank" rel="noopener">${title}</a>
      </h3>
      ${authorsHtml ? `<p class="publication-description">${authorsHtml}</p>` : ""}
      <div class="pub-actions">
        <a class="pub-btn" href="${href}" target="_blank" rel="noopener">Read</a>
        ${typeof it.cited_by === "number"
          ? `<span class="pub-btn">Citations: ${it.cited_by}</span>`
          : ""}
      </div>
    </div>`;
  return el;
}

/* ── boot ─────────────────────────────────────────────────────── */

(async function boot() {
  const app   = document.getElementById("pub-app");
  if (!app) return;

  const AUTHOR = (app.dataset.authorId || "").trim();
  const $list  = document.getElementById("list-articles");
  if (!$list) return;

  // Show a loading placeholder so the page isn't blank during fetch
  $list.innerHTML = `<p style="color:var(--color-muted,#888)">Loading publications…</p>`;

  let pubs     = [];
  let official = null;

  // Cache-bust with a daily timestamp (not every millisecond — browsers can still
  // reuse cached responses within the same minute, which is fine for static data)
  const bust = Math.floor(Date.now() / 86_400_000);

  try {
    const r = await fetch(`${DATA_PATH}?v=${bust}`, { cache: "no-store" });
    if (r.ok) {
      pubs = await r.json();
    } else {
      console.error(`scopus.json: HTTP ${r.status}`);
    }
  } catch (e) {
    console.error("scopus.json fetch error:", e);
  }

  // Filter to this author if a data-author-id is provided
  if (AUTHOR) {
    pubs = pubs.filter(x => String(x.author_id || "").trim() === AUTHOR);
  }

  // Sort: newest first, then alphabetical by title within the same month
  pubs.sort((a, b) => {
    const ay = +a.year  || 0, by = +b.year  || 0; if (ay !== by) return by - ay;
    const am = +a.month || 0, bm = +b.month || 0; if (am !== bm) return bm - am;
    return (a.title || "").localeCompare(b.title || "");
  });

  // Metrics: prefer the API-sourced file; fall back to computing from publications
  try {
    const m = await fetch(`${METRICS_PATH}?v=${bust}`, { cache: "no-store" });
    if (m.ok) official = await m.json();
  } catch (e) {
    console.warn("metrics.json fetch error:", e);
  }

  if (!renderOfficialMetrics(official)) {
    renderComputedMetrics(pubs);
  }

  // Render articles (journal papers, reviews, editorials)
  $list.innerHTML = "";
  let articleCount = 0;

  for (const it of pubs) {
    if (classify(it) === "article") {
      $list.appendChild(card(it, "article"));
      articleCount++;
    }
  }

  if (!articleCount) {
    $list.innerHTML = `<p style="color:#666">No journal articles found.</p>`;
  }

  // Optional: render conference papers in a separate container if it exists
  const $conf = document.getElementById("list-conferences");
  if ($conf) {
    let confCount = 0;
    for (const it of pubs) {
      if (classify(it) === "conference") {
        $conf.appendChild(card(it, "conference"));
        confCount++;
      }
    }
    if (!confCount) {
      $conf.innerHTML = `<p style="color:#666">No conference papers found.</p>`;
    }
  }
})();
