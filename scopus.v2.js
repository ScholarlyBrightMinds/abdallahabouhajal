// scopus.v2.js  (use official metrics first; fallback to computed)
const DATA_PATH    = "data/scopus/scopus.json";
const METRICS_PATH = "data/scopus/metrics.json";

const fmtDate=(iso="")=>{ if(!iso) return ""; const [y,m="01"]=iso.split("-"); const d=new Date(+y, +m-1, 1); return Number.isNaN(d.getTime())?(y||""):d.toLocaleDateString(undefined,{month:"short",year:"numeric"}); };
const bestLink=it=>it.doi_url||it.scopus_url||"#";
const classify=it=>{const st=(it.subtype||"").toLowerCase();const desc=(it.type||it.subtypeDescription||"").toLowerCase();const isConf=st==="cp"||desc.includes("conference");const isArt=st==="ar"||desc.includes("article")||desc.includes("review")||desc.includes("editorial");return isConf?"conference":(isArt?"article":"other");};
const hIndex=arr=>{const s=[...arr].sort((a,b)=>b-a);let h=0;for(let i=0;i<s.length;i++){if(s[i]>=i+1)h=i+1;else break;}return h;};
const set=(id,v)=>{const e=document.getElementById(id); if(e) e.textContent=String(v);};

function renderOfficial(m){ if(!m) return false; set("m-total",m.total_documents??"—"); set("m-cites",m.total_citations??"—"); set("m-h",m.h_index??"—"); return true; }
function renderComputed(list){ const total=list.length; const cites=list.reduce((s,x)=>s+(+x.cited_by||0),0); const h=hIndex(list.map(x=>+x.cited_by||0)); set("m-total",total); set("m-cites",cites); set("m-h",h); }

function card(it, kind){
  const title=it.title||"Untitled"; const venue=it.venue||(kind==="conference"?"Conference":"Journal"); const date=fmtDate(it.cover_date||`${it.year||""}-${it.month||""}-01`);
  const mine=/abou.*hajal/i; const authors=(Array.isArray(it.authors)&&it.authors.length)?it.authors.map(a=>mine.test(a)?`<strong>${a}</strong>`:a).join(", "):(it.first_author?`${it.first_author} et al.`:"");
  const href=bestLink(it);
  const el=document.createElement("div"); el.className="publication-item";
  el.innerHTML=`<div class="publication-info"><div class="publication-meta"><span class="publication-label">${kind==="conference"?"Conference":"Journal"}</span><span class="publication-date">${date}</span>${venue?`<a class="publication-category" href="${href}" target="_blank" rel="noopener">${venue}</a>`:""}</div><h3 class="publication-title"><a href="${href}" target="_blank" rel="noopener">${title}</a></h3>${authors?`<p class="publication-description">${authors}</p>`:""}<div class="pub-actions"><a class="pub-btn" href="${href}" target="_blank" rel="noopener">Read</a>${typeof it.cited_by==="number"?`<span class="pub-btn">Citations: ${it.cited_by}</span>`:""}</div></div>`;
  return el;
}

(async function boot(){
  const app=document.getElementById("pub-app"); if(!app) return;
  const AUTHOR=(app.dataset.authorId||"").trim();
  const $list=document.getElementById("list-articles");

  const [pr, mr] = await Promise.allSettled([
    fetch(`${DATA_PATH}?v=${Date.now()}`, {cache:"no-store"}),
    fetch(`${METRICS_PATH}?v=${Date.now()}`, {cache:"no-store"}),
  ]);

  let pubs=[];
  if (pr.status==="fulfilled" && pr.value.ok){
    pubs = await pr.value.json();
    if (AUTHOR) pubs = pubs.filter(x => String(x.author_id||"").trim()===AUTHOR);
    pubs.sort((a,b)=>{const ay=+a.year||0,by=+b.year||0;if(ay!==by)return by-ay;const am=+a.month||0,bm=+b.month||0;if(am!==bm)return bm-am;return (a.title||"").localeCompare(b.title||"");});
  }

  let metrics=null;
  if (mr.status==="fulfilled" && mr.value.ok){ try{ metrics=await mr.value.json(); }catch{} }
  if (!renderOfficial(metrics)) renderComputed(pubs);

  let n=0; for(const it of pubs){ const kind=classify(it); if(kind==="article"){ $list.appendChild(card(it,"article")); n++; } }
  if(!n) $list.innerHTML=`<p style="color:#666">No journal articles found.</p>`;
})();
