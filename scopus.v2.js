// File: scopus.v2.js
// Purpose: Render publications from data/scopus/scopus.json and show official metrics from data/scopus/metrics.json.

const DATA_PATH    = "data/scopus/scopus.json";
const METRICS_PATH = "data/scopus/metrics.json";

/* ---------- utils ---------- */
const fmtDate = (iso = "") => {
  if (!iso) return "";
  const [y, m = "01"] = String(iso).split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return Number.isNaN(dt.getTime())
    ? (y || "")
    : dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};
const bestLink = it => it.doi_url || it.scopus_url || "#";
const classify = it => {
  const st   = (it.subtype || "").toLowerCase();
  const desc = (it.type || it.subtypeDescription || "").toLowerCase();
  const isConf = st === "cp" || desc.includes("conference");
  const isArt  = st === "ar" || desc.includes("article") || desc.includes("review") || desc.includes("editorial");
  return isConf ? "conference" : (isArt ? "article" : "other");
};
const hIndex = (arr = []) => {
  const s = [...arr].map(n => Number(n) || 0).sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < s.length; i++) { if (s[i] >= i + 1) h = i + 1; else break; }
  return h;
};
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
const getText = id => (document.getElementById(id)?.textContent || "").trim();

/* ---------- metrics ---------- */
function renderOfficialMetrics(m){
  if (!m || typeof m !== "object") return false;
  setText("m-total", m.total_documents ?? "—");
  setText("m-cites", m.total_citations ?? "—");
  setText("m-h",     m.h_index ?? "—");
  return true;
}
function renderComputedMetrics(list){
  const total = list.length;
  const cites = list.reduce((s,x)=> s + (Number(x.cited_by)||0), 0);
  const h     = hIndex(list.map(x=> x.cited_by));
  setText("m-total", total);
  setText("m-cites", cites);
  setText("m-h", h);
}

/* ---------- UI ---------- */
function card(it, kind){
  const title = it.title || "Untitled";
  const venue = it.venue || (kind === "conference" ? "Conference" : "Journal");
  const date  = fmtDate(it.cover_date || `${it.year||""}-${it.month||""}-01`);
  const mine  = /abou.*hajal/i; // highlight your name
  const authorsText = Array.isArray(it.authors) && it.authors.length
    ? it.authors.map(a => mine.test(a) ? `<strong>${a}</strong>` : a).join(", ")
    : (it.first_author ? `${it.first_author} et al.` : "");
  const href = bestLink(it);

  const el = document.createElement("div");
  el.className = "publication-item";
  el.innerHTML = `
    <div class="publication-info">
      <div class="publication-meta">
        <span class="publication-label">${kind==="conference"?"Conference":"Journal"}</span>
        <span class="publication-date">${date}</span>
        ${venue ? `<a class="publication-category" href="${href}" target="_blank" rel="noopener">${venue}</a>` : ``}
      </div>
      <h3 class="publication-title"><a href="${href}" target="_blank" rel="noopener">${title}</a></h3>
      ${authorsText ? `<p class="publication-description">${authorsText}</p>` : ``}
      <div class="pub-actions">
        <a class="pub-btn" href="${href}" target="_blank" rel="noopener">Read</a>
        ${typeof it.cited_by === "number" ? `<span class="pub-btn">Citations: ${it.cited_by}</span>` : ``}
      </div>
    </div>`;
  return el;
}

/* ---------- boot ---------- */
(async function boot(){
  const app = document.getElementById("pub-app"); if (!app) return;
  const AUTHOR = (app.dataset.authorId || "").trim();
  const $list  = document.getElementById("list-articles");

  let pubs = [];
  let official = null;

  // Fetch with cache-busting
  const t = Date.now();
  try {
    const r = await fetch(`${DATA_PATH}?v=${t}`, { cache: "no-store" });
    if (r.ok) pubs = await r.json();
  } catch (e) { console.error("scopus.json fetch error:", e); }

  if (AUTHOR) pubs = pubs.filter(x => String(x.author_id || "").trim() === AUTHOR);
  pubs.sort((a,b)=>{
    const ay=+a.year||0, by=+b.year||0; if (ay!==by) return by-ay;
    const am=+a.month||0, bm=+b.month||0; if (am!==bm) return bm-am;
    return (a.title||"").localeCompare(b.title||"");
  });

  // Metrics: prefer metrics.json; always fallback to computed
  try {
    const m = await fetch(`${METRICS_PATH}?v=${t}`, { cache: "no-store" });
    if (m.ok) official = await m.json();
  } catch (e) { console.warn("metrics.json fetch error:", e); }

  if (!renderOfficialMetrics(official)) renderComputedMetrics(pubs);
  // Safety net: if still dashes (e.g., DOM IDs changed), force computed again
  if (["m-total","m-cites","m-h"].some(id => getText(id) === "—")) renderComputedMetrics(pubs);

  // Render list (journal-like)
  let n = 0;
  for (const it of pubs){
    const kind = classify(it);
    if (kind === "article"){ $list.appendChild(card(it, "article")); n++; }
  }
  if (!n) $list.innerHTML = `<p style="color:#666">No journal articles found.</p>`;
})();
