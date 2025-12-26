// File: serpapi.v1.js
// Renders publications from data/serpapi/serpapi.json and data/serpapi/metrics.json

const DATA_PATH = "data/serpapi/serpapi.json";
const METRICS_PATH = "data/serpapi/metrics.json";

/* ---------- UTILITY FUNCTIONS (Keep these from your old file) ---------- */
// Format date
const fmtDate = (iso = "") => {
  if (!iso) return "";
  const [y, m = "01"] = String(iso).split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return Number.isNaN(dt.getTime())
    ? (y || "")
    : dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

// Determine the best link for a publication
const bestLink = it => it.doi_url || it.link || "#";

// Classify publication type (for styling)
const classify = it => {
  const st = (it.subtype || "").toLowerCase();
  const desc = (it.venue || "").toLowerCase();
  const isConf = st === "cp" || desc.includes("conference") || desc.includes("proc.");
  const isArt = st === "ar" || desc.includes("journal") || desc.includes("review") || desc.includes("article");
  return isConf ? "conference" : (isArt ? "article" : "other");
};

// Calculate h-index from an array of citation counts
const hIndex = (arr = []) => {
  const s = [...arr].map(n => Number(n) || 0).sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] >= i + 1) h = i + 1;
    else break;
  }
  return h;
};

// Helper to set text content
const setText = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
};
const getText = id => (document.getElementById(id)?.textContent || "").trim();

/* ---------- METRICS DISPLAY ---------- */
function renderOfficialMetrics(m) {
  if (!m || typeof m !== "object") return false;
  setText("m-total", m.total_documents ?? "—");
  setText("m-cites", m.total_citations ?? "—");
  setText("m-h", m.h_index ?? "—");
  return true;
}

function renderComputedMetrics(list) {
  const total = list.length;
  const cites = list.reduce((s, x) => s + (Number(x.cited_by) || 0), 0);
  const h = hIndex(list.map(x => x.cited_by));
  setText("m-total", total);
  setText("m-cites", cites);
  setText("m-h", h);
}

/* ---------- PUBLICATION CARD UI ---------- */
function card(it, kind) {
  const title = it.title || "Untitled";
  const venue = it.venue || (kind === "conference" ? "Conference" : "Journal");
  const date = fmtDate(it.year ? `${it.year}-01-01` : ""); // Use year if full date not present
  const mine = /abou.*hajal/i; // Highlight your name
  const authorsText = it.authors ?
    it.authors.split(", ").map(a => mine.test(a) ? `<strong>${a}</strong>` : a).join(", ")
    : "";
  const href = bestLink(it);

  const el = document.createElement("div");
  el.className = "publication-item";
  el.innerHTML = `
    <div class="publication-info">
      <div class="publication-meta">
        <span class="publication-label">${kind === "conference" ? "Conference" : "Journal"}</span>
        <span class="publication-date">${date}</span>
        ${venue ? `<a class="publication-category" href="${href}" target="_blank" rel="noopener">${venue}</a>` : ``}
      </div>
      <h3 class="publication-title"><a href="${href}" target="_blank" rel="noopener">${title}</a></h3>
      ${authorsText ? `<p class="publication-description">${authorsText}</p>` : ``}
      <div class="pub-actions">
        <a class="pub-btn" href="${href}" target="_blank" rel="noopener">Read</a>
        ${typeof it.cited_by === "number" && it.cited_by > 0 ? `<span class="pub-btn">Citations: ${it.cited_by}</span>` : ``}
      </div>
    </div>`;
  return el;
}

/* ---------- MAIN BOOT FUNCTION ---------- */
(async function boot() {
  const app = document.getElementById("pub-app");
  if (!app) return;
  const $list = document.getElementById("list-articles");

  let pubs = [];
  let official = null;

  // Fetch data with cache busting
  const t = Date.now();
  try {
    const r = await fetch(`${DATA_PATH}?v=${t}`, { cache: "no-store" });
    if (r.ok) pubs = await r.json();
  } catch (e) {
    console.error("serpapi.json fetch error:", e);
  }

  // Fetch metrics
  try {
    const m = await fetch(`${METRICS_PATH}?v=${t}`, { cache: "no-store" });
    if (m.ok) official = await m.json();
  } catch (e) {
    console.warn("metrics.json fetch error:", e);
  }

  // Sort publications by year (newest first)
  pubs.sort((a, b) => {
    const ay = +a.year || 0, by = +b.year || 0;
    if (ay !== by) return by - ay;
    return (a.title || "").localeCompare(b.title || "");
  });

  // Display metrics: prefer official, fallback to computed
  if (!renderOfficialMetrics(official)) {
    renderComputedMetrics(pubs);
  }
  // Safety net: if still dashes, force computed again
  if (["m-total", "m-cites", "m-h"].some(id => getText(id) === "—")) {
    renderComputedMetrics(pubs);
  }

  // Render the list of journal articles
  let n = 0;
  for (const it of pubs) {
    const kind = classify(it);
    if (kind === "article") {
      $list.appendChild(card(it, "article"));
      n++;
    }
  }
  if (!n) {
    $list.innerHTML = `<p style="color:#666">No journal articles found.</p>`;
  }
})();
