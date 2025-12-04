// scopus.v2.js — show official metrics from metrics.json; fallback to computed sum
const DATA_PATH = "data/scopus/scopus.json";
const METRICS_PATH = "data/scopus/metrics.json";

const fmtDate = (iso="")=>{
  if(!iso) return "";
  const [y,m="01"] = iso.split("-");
  const dt = new Date(Number(y), Number(m)-1, 1);
  return Number.isNaN(dt.getTime()) ? (y||"") : dt.toLocaleDateString(undefined,{month:"short", year:"numeric"});
};
const bestLink  = it => it.doi_url || it.scopus_url || "#";
const classify  = it => {
  const st=(it.subtype||"").toLowerCase();
  const desc=(it.type||it.subtypeDescription||"").toLowerCase();
  const isConf = st==="cp" || desc.includes("conference");
  const isArt  = st==="ar" || desc.includes("article") || desc.includes("review") || desc.includes("editorial");
  return isConf ? "conference" : (isArt ? "article" : "other");
};
const hIndex = (arr=[])=>{
  const s=[...arr].sort((a,b)=>b-a);
  let h=0; for(let i=0;i<s.length;i++){ if(s[i] >= i+1) h=i+1; else break; }
  return h;
};

function setMetric(id, val){ const el=document.getElementById(id); if(el) el.textContent=String(val); }

function renderFromOfficial(m){
  if(!m) return false;
  setMetric("m-total", m.total_documents ?? "—");
  setMetric("m-cites", m.total_citations ?? "—");
  setMetric("m-h",     m.h_index ?? "—");
  return true;
}
function renderFromList(list){
  const total = list.length;
  const cites = list.reduce((s,x)=> s + (Number(x.cited_by)||0), 0);
  const h     = hIndex(list.map(x=> Number(x.cited_by)||0));
  setMetric("m-total", total);
  setMetric("m-cites", cites);
  setMetric("m-h", h);
}

function card(it, kind){
  const label = kind==="conference" ? "Conference" : "Journal";
  const date  = fmtDate(it.cover_date || `${it.year||""}-${it.month||""}-01`);
  const venue = it.venue || (kind==="conference" ? "Conference" : "Journal");
  const title = it.title || "Untitled";
  const mine = /abou.*hajal/i; // why: highlight your name if present
  const authorsText = Array.isArray(it.authors) && it.authors.length
    ? it.authors.map(a => mine.test(a) ? `<strong>${a}</strong>` : a).join(", ")
    : (it.first_author ? `${it.first_author} et al.` : "");
  const href = bestLink(it);

  const el = document.createElement("div");
  el.className = "publication-item";
  el.innerHTML = `
    <div class="publication-info">
      <div class="publication-meta">
        <span class="publication-label">${label}</span>
        <span class="publication-date">${date}</span>
        ${venue ? `<a class="publication-category" href="${href}" target="_blank" rel="noopener">${venue}</a>` : ``}
      </div>
      <h3 class="publication-title"><a href="${href}" target="_blank" rel="noopener">${title}</a></h3>
      ${authorsText ? `<p class="publication-description">${authorsText}</p>` : ``}
      <div class="pub-actions">
        <a class="pub-btn" href="${href}" target="_blank" rel="noopener">Read</a>
        ${typeof it.cited_by==="number" ? `<span class="pub-btn">Citations: ${it.cited_by}</span>` : ``}
      </div>
    </div>`;
  return el;
}

async function boot(){
  const app=document.getElementById("pub-app"); if(!app) return;
  const AUTHOR=(app.dataset.authorId||"").trim();
  const $a=document.getElementById("list-articles");

  // load data + metrics (cache-busted)
  const [pubRes, metRes] = await Promise.allSettled([
    fetch(`${DATA_PATH}?v=${Date.now()}`, {cache:"no-store"}),
    fetch(`${METRICS_PATH}?v=${Date.now()}`, {cache:"no-store"}),
  ]);

  let data=[];
  if (pubRes.status==="fulfilled" && pubRes.value.ok){
    data = await pubRes.value.json();
    if(AUTHOR) data = data.filter(x => String(x.author_id||"").trim()===AUTHOR);
    data.sort((a,b)=>{
      const ay=+a.year||0, by=+b.year||0; if(ay!==by) return by-ay;
      const am=+a.month||0, bm=+b.month||0; if(am!==bm) return bm-am;
      return (a.title||"").localeCompare(b.title||"");
    });
  }

  // render metrics (official -> fallback)
  let official=null;
  if (metRes.status==="fulfilled" && metRes.value.ok){
    try { official = await metRes.value.json(); } catch {}
  }
  if (!renderFromOfficial(official)) renderFromList(data);

  // render articles list
  let countArticles=0;
  for(const it of data){
    const kind=classify(it);
    if(kind==="article"){ $a.appendChild(card(it,"article")); countArticles++; }
  }
  if(!countArticles) $a.innerHTML=`<p style="color:#666">No journal articles found.</p>`;
}
boot();
