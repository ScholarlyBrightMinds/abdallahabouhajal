// File: serpapi.v1.js
// Purpose: Render publications from data/serpapi/serpapi.json

const DATA_PATH = "data/serpapi/serpapi.json";
const METRICS_PATH = "data/serpapi/metrics.json";

// ... [KEEP ALL YOUR EXISTING UTILITY FUNCTIONS FROM scopus.v2.js HERE] ...
// Functions like fmtDate, bestLink, classify, hIndex, setText, getText,
// renderOfficialMetrics, renderComputedMetrics, and card()
// ARE EXACTLY THE SAME. DO NOT CHANGE THEM.

(async function boot() {
  const app = document.getElementById('pub-app');
  if (!app) return;
  const $list = document.getElementById('list-articles');
  const t = Date.now();

  let pubs = [];
  let official = null;

  // 1. Fetch the new SerpApi data files
  try {
    const r = await fetch(`${DATA_PATH}?v=${t}`, { cache: 'no-store' });
    if (r.ok) pubs = await r.json();
  } catch (e) { console.error('serpapi.json fetch error:', e); }

  try {
    const m = await fetch(`${METRICS_PATH}?v=${t}`, { cache: 'no-store' });
    if (m.ok) official = await m.json();
  } catch (e) { console.warn('metrics.json fetch error:', e); }

  // 2. Display Metrics (same logic as before)
  if (!renderOfficialMetrics(official)) {
    renderComputedMetrics(pubs);
  }
  if (["m-total", "m-cites", "m-h"].some(id => getText(id) === "—")) {
    renderComputedMetrics(pubs);
  }

  // 3. Render List (same logic as before)
  let n = 0;
  pubs.sort((a, b) => (b.year || 0) - (a.year || 0)); // Sort by year, newest first
  for (const it of pubs) {
    const kind = classify(it); // Uses your existing classify() function
    if (kind === "article") {
      $list.appendChild(card(it, "article"));
      n++;
    }
  }
  if (!n) $list.innerHTML = `<p style="color:#666">No journal articles found.</p>`;
})();