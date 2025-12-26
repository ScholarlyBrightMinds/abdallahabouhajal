// File: serpapi.v1.js
// Renders publications from data/serpapi/serpapi.json and data/serpapi/metrics.json

const DATA_PATH = "data/serpapi/serpapi.json";
const METRICS_PATH = "data/serpapi/metrics.json";

/* ---------- UTILITY FUNCTIONS ---------- */
// Format date: Handles year-only format (e.g., "2024") from SerpApi
const fmtDate = (yearStr = "") => {
  if (!yearStr) return "";
  const year = parseInt(yearStr);
  if (isNaN(year)) return "";
  // Create a date object for formatting (uses first day of the year)
  const dt = new Date(year, 0, 1);
  return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

// Determine the best link for a publication
const bestLink = it => it.link || "#"; // SerpApi uses 'link', not 'doi_url'

// Classify publication type (for styling) - Optimized for Google Scholar venue names
const classify = it => {
  const venue = (it.venue || "").toLowerCase();
  // More robust checks for journal articles
  const isJournal = venue.includes("journal") ||
                    venue.includes(" j.") || // Common abbreviation like "J. Med. Econ."
                    venue.match(/^[a-z]+\.[\s]/) || // Matches "Nature", "Science" etc. as single words often used for journals.
                    venue.includes("pharmaceutical") ||
                    venue.includes("chemical") ||
                    venue.includes("economics");
  const isConference = venue.includes("conference") ||
                       venue.includes("proc.") ||
                       venue.includes("proceedings");
  return isConference ? "conference" : (isJournal ? "article" : "other");
};

// Calculate h-index from an array of citation counts (fallback)
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
  const date = fmtDate(it.year); // Use the corrected year formatting
  // More flexible name highlighting for different author string formats
  const mineRegex = /abou.*hajal|hajal.*abou|abdallah/i;
  const authorsText = it.authors ?
    it.authors.split(", ").map(a => mineRegex.test(a) ? `<strong>${a}</strong>` : a).join(", ")
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
    if (r.ok) {
      pubs = await r.json();
      console.log(`Fetched ${pubs.length} publications from JSON.`);
    } else {
      console.error(`Failed to fetch ${DATA_PATH}: HTTP ${r.status}`);
    }
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

  // --- CHANGES START HERE ---
  // RENDER ALL PUBLICATIONS
  let n = 0;
  for (const it of pubs) {
    // Pass 'article' as the kind for consistent styling, or use 'other'
    $list.appendChild(card(it, "article")); // Or use "other" if you prefer
    n++;
  }
  // --- CHANGES END HERE ---

  if (!n) {
    $list.innerHTML = `<p style="color:#666">No publications found.</p>`;
  } else {
    // Remove the loading message if it exists
    const loadingMsg = $list.querySelector('p[style*="italic"]');
    if (loadingMsg) loadingMsg.remove();
  }
})();
