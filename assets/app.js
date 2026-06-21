/* ======================================================================
   ROADMAP SUPER SCATTER — app.js
   Lee data/projects.json (seed) y pinta el timeline-scatter + detalle.
   En producción, DATA_URL apuntará al proxy serverless (Cloudflare Worker).
   ====================================================================== */
const DATA_URL = "data/projects.json";
const TODAY = new Date("2026-06-21T00:00:00");

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const ESTADO_CLASS = { "En desarrollo":"desarrollo", "Completado":"completado", "En espera":"espera" };
const ESTADO_COLOR = { "En desarrollo":"var(--red)", "Completado":"var(--ok)", "En espera":"var(--muted)" };

let STATE = { proyectos: [], meta: {} };

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const el = (t, c) => { const n=document.createElement(t); if(c) n.className=c; return n; };
const parseDate = s => s ? new Date(s+"T00:00:00") : null;
const fmtDate = d => d ? `${String(d.getDate()).padStart(2,"0")} ${MESES[d.getMonth()]}` : "—";

function progress(p){
  // Barra principal = checkpoints alcanzados / total. Fallback a tareas si no hay checkpoints.
  const cps = p.checkpoints || [];
  if(cps.length){
    const done = cps.filter(c=>c.hecho).length;
    return { done, total:cps.length, pct:Math.round(done/cps.length*100), base:"checkpoints" };
  }
  const ts = p.tareas || [];
  if(ts.length){
    const done = ts.filter(t=>t.hecho).length;
    return { done, total:ts.length, pct:Math.round(done/ts.length*100), base:"tareas" };
  }
  return { done:0, total:0, pct:0, base:"none" };
}

// Reglas de alerta (ver concepto.md §7). Devuelve {nivel, msgs[]}
function alertsFor(p){
  const msgs=[];
  if(p.estado==="En desarrollo" && (!p.tareas || p.tareas.length===0))
    msgs.push({lvl:"rojo", t:"En desarrollo sin tareas"});
  if(!p.objetivo || !p.objetivo.trim())
    msgs.push({lvl:"aviso", t:"Sin objetivo"});
  if(p.estado==="En desarrollo" && (!p.checkpoints || p.checkpoints.length===0))
    msgs.push({lvl:"aviso", t:"Sin checkpoints"});
  const nivel = msgs.some(m=>m.lvl==="rojo") ? "rojo" : (msgs.length?"aviso":null);
  return { nivel, msgs };
}

/* ---------- timeline math ---------- */
function timelineBounds(dated){
  const dates = dated.map(p=>parseDate(p.fechaObjetivo).getTime());
  let min = Math.min(...dates, TODAY.getTime());
  let max = Math.max(...dates, TODAY.getTime());
  const pad = (max-min)*0.08 || 1000*60*60*24*10;
  return { min:min-pad, max:max+pad };
}
const posPct = (t,b) => ((t-b.min)/(b.max-b.min))*100;

function monthTicks(b){
  const ticks=[]; const d=new Date(b.min); d.setDate(1);
  d.setMonth(d.getMonth()+ (new Date(b.min).getDate()>1?1:0));
  while(d.getTime()<=b.max){
    ticks.push({ t:d.getTime(), label:`${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` });
    d.setMonth(d.getMonth()+1);
  }
  return ticks;
}

/* ---------- render: scatter ---------- */
function renderScatter(){
  const scatter = $("#scatter");
  scatter.innerHTML="";
  const dated = STATE.proyectos.filter(p=>p.fechaObjetivo).sort((a,b)=>parseDate(a.fechaObjetivo)-parseDate(b.fechaObjetivo));
  if(!dated.length){ scatter.innerHTML='<p class="empty" style="padding:2rem">Sin proyectos con fecha objetivo.</p>'; return; }

  const b = timelineBounds(dated);

  // axis + ticks
  const axis = el("div","axis"); scatter.appendChild(axis);
  monthTicks(b).forEach(tk=>{
    const tick = el("div","tick"); tick.style.left = posPct(tk.t,b)+"%";
    tick.innerHTML = `<div class="tline"></div><div class="lbl">${tk.label}</div>`;
    scatter.appendChild(tick);
  });
  // today line
  const today = el("div","today-line");
  today.style.left = posPct(TODAY.getTime(),b)+"%"; today.style.height="324px";
  scatter.appendChild(today);

  // nodes (stagger vertical para evitar solapes)
  const levels = [18, 96, 174]; // top offsets
  dated.forEach((p,i)=>{
    const x = posPct(parseDate(p.fechaObjetivo).getTime(), b);
    const top = levels[i % levels.length];
    const node = el("div","node");
    node.style.left = x+"%"; node.style.top = top+"px";
    const stemH = (384 - 46) - (top+150);
    const cls = ESTADO_CLASS[p.estado]||"espera";
    const pr = progress(p);
    const al = alertsFor(p);

    node.innerHTML = `
      <div class="stem" style="top:150px;height:${Math.max(stemH,18)}px"></div>
      <div class="dot" style="top:${150+Math.max(stemH,18)}px;color:${ESTADO_COLOR[p.estado]}"></div>
      <div class="pcard estado-${cls} ${al.nivel==='rojo'?'alert':''}" data-id="${p.id}">
        ${al.nivel==='rojo'?'<span class="flag">!</span>':''}
        <div class="pc-top"><span class="emoji">${p.emoji||"📌"}</span>
          <span class="pc-name">${p.nombre}</span></div>
        <div class="pc-meta"><span>${p.estado}</span><span>🎯 ${fmtDate(parseDate(p.fechaObjetivo))}</span></div>
        <div class="bar"><i style="width:${pr.pct}%"></i></div>
        <div class="bar-row"><span>${pr.base==='checkpoints'?'checkpoints':'tareas'}</span>
          <b>${pr.done}/${pr.total} · ${pr.pct}%</b></div>
      </div>`;
    scatter.appendChild(node);
  });

  scatter.querySelectorAll(".pcard").forEach(c=>c.addEventListener("click",()=>openModal(c.dataset.id)));
}

/* ---------- render: sin fecha ---------- */
function renderNoDate(){
  const sinFecha = STATE.proyectos.filter(p=>!p.fechaObjetivo);
  const sec = $("#noDateSection"), grid = $("#noDateGrid");
  if(!sinFecha.length){ sec.hidden=true; return; }
  sec.hidden=false; grid.innerHTML="";
  sinFecha.forEach(p=>{
    const cls = ESTADO_CLASS[p.estado]||"espera";
    const pr = progress(p); const al = alertsFor(p);
    const card = el("div",`pcard estado-${cls} ${al.nivel==='rojo'?'alert':''}`);
    card.dataset.id=p.id;
    card.innerHTML = `
      ${al.nivel==='rojo'?'<span class="flag">!</span>':''}
      <div class="pc-top"><span class="emoji">${p.emoji||"📌"}</span>
        <span class="pc-name">${p.nombre}</span></div>
      <div class="pc-meta"><span>${p.estado}</span><span>${(p.responsables||[]).join(", ")||"—"}</span></div>
      <div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="bar-row"><span>${pr.base==='none'?'sin datos':pr.base}</span><b>${pr.done}/${pr.total} · ${pr.pct}%</b></div>`;
    card.addEventListener("click",()=>openModal(p.id));
    grid.appendChild(card);
  });
}

/* ---------- render: legend + data alert ---------- */
function renderLegend(){
  $("#legend").innerHTML = `
    <span><i style="background:var(--red)"></i>En desarrollo</span>
    <span><i style="background:var(--muted)"></i>En espera</span>
    <span><i style="background:var(--ok)"></i>Completado</span>`;
}
function renderDataAlert(){
  const banner = $("#dataAlert");
  const rojos = STATE.proyectos.filter(p=>alertsFor(p).nivel==="rojo");
  const orphan = STATE.meta.tareasSinProyecto||0;
  const bits=[];
  if(orphan) bits.push(`<span><strong>${orphan}</strong> tareas sin proyecto asignado</span>`);
  if(rojos.length) bits.push(`<span><strong>${rojos.length}</strong> proyecto(s) «En desarrollo» sin tareas</span>`);
  if(bits.length){
    banner.hidden=false;
    banner.innerHTML = `⚠️ CALIDAD DE DATOS · ${bits.join(" · ")} <span style="color:var(--muted);font-weight:500">— corregir en Notion</span>`;
  } else banner.hidden=true;
}

/* ---------- modal ---------- */
function checklist(items, cpClass){
  if(!items || !items.length) return `<p class="empty">— sin definir —</p>`;
  return `<ul class="check ${cpClass||''}">`+items.map(i=>`
    <li class="${i.hecho?'done':''}"><span class="box">${i.hecho?'✓':''}</span><span>${i.titulo}</span></li>`).join("")+`</ul>`;
}
function openModal(id){
  const p = STATE.proyectos.find(x=>x.id===id); if(!p) return;
  const pr = progress(p); const cls = ESTADO_CLASS[p.estado]||"espera";
  const tareasHechas = (p.tareas||[]).filter(t=>t.hecho);
  const tareasPend = (p.tareas||[]).filter(t=>!t.hecho);
  const rec = p.recursos||{tecnologico:[],skills:[]};

  const diario = (p.diario||[]).slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)); // más reciente arriba

  $("#modalCard").innerHTML = `
    <div class="m-head">
      <button class="m-close" data-close>✕</button>
      <div class="m-emoji">${p.emoji||"📌"}</div>
      <h3>${p.nombre}</h3>
      <div class="m-tags">
        <span class="tag estado-${cls}">${p.estado}</span>
        ${p.fechaObjetivo?`<span class="tag date">🎯 ${fmtDate(parseDate(p.fechaObjetivo))} '${String(parseDate(p.fechaObjetivo).getFullYear()).slice(2)}</span>`:`<span class="tag">sin fecha</span>`}
        ${(p.responsables||[]).map(r=>`<span class="tag">${r}</span>`).join("")}
      </div>
    </div>
    <div class="m-body">
      <div class="m-progress">
        <div class="ring" style="--p:${pr.pct}"><div><b>${pr.pct}%</b><small>${pr.base}</small></div></div>
        <div>
          <div class="sub">Avance principal</div>
          <div style="font-family:var(--font-display);font-size:1.3rem">${pr.done} / ${pr.total} ${pr.base}</div>
          <div class="sub" style="margin-top:.3rem">Tareas: ${tareasHechas.length}/${(p.tareas||[]).length} hechas</div>
        </div>
      </div>

      <div class="block">
        <h4><span class="n">1</span>🎯 Objetivo y resultados</h4>
        <div class="goal">${p.objetivo||'<span class="empty">Sin objetivo definido.</span>'}
          ${p.resultadosEsperados?`<span class="res">${p.resultadosEsperados}</span>`:''}</div>
      </div>

      <div class="block">
        <h4><span class="n">2</span>🧭 Checkpoints</h4>
        ${checklist(p.checkpoints,'cp')}
      </div>

      <div class="block">
        <h4><span class="n">3</span>✅ Tareas asociadas</h4>
        <div class="tasks-split">
          <div><h5>Por hacer (${tareasPend.length})</h5>${checklist(tareasPend)}</div>
          <div><h5>Hechas (${tareasHechas.length})</h5>${checklist(tareasHechas)}</div>
        </div>
      </div>

      <div class="block">
        <h4><span class="n">4</span>🧰 Recursos a utilizar</h4>
        <div class="sub">a · Stack tecnológico</div>
        <div class="chips">${(rec.tecnologico||[]).map(t=>`<span class="chip">${t}</span>`).join("")||'<span class="empty">—</span>'}</div>
        <div class="sub">b · Stack de skills</div>
        ${(rec.skills&&rec.skills.length)?`<ul class="skills">${rec.skills.map(s=>`<li><b>${s.skill}</b> — ${s.porque}</li>`).join("")}</ul>`:'<p class="empty">—</p>'}
      </div>

      <div class="block diary">
        <h4>🗓️ Diario de desarrollo</h4>
        ${diario.length?diario.map((d,i)=>`<details ${i===0?'open':''}><summary>${d.fecha}</summary>
          <ul class="d-body">${d.bullets.map(b=>`<li>${b}</li>`).join("")}</ul></details>`).join("")
          :'<p class="empty">Aún no hay entradas de diario.</p>'}
      </div>
    </div>`;
  $("#modal").hidden=false;
  document.body.style.overflow="hidden";
}
function closeModal(){ $("#modal").hidden=true; document.body.style.overflow=""; }

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.hidden=false;
  clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2600);
}

/* ---------- data load ---------- */
async function load(showToast){
  const btn=$("#btnRefresh"); btn.classList.add("loading");
  try{
    const res = await fetch(DATA_URL+"?t="+Date.now());
    if(!res.ok) throw new Error(res.status);
    const data = await res.json();
    STATE.proyectos = data.proyectos||[];
    STATE.meta = data.meta||{};
    renderLegend(); renderDataAlert(); renderScatter(); renderNoDate();
    $("#footMeta").textContent = `${STATE.proyectos.length} proyectos · fuente: ${STATE.meta.fuente||'—'}`;
    if(showToast) toast("Datos actualizados ✓");
  }catch(e){
    toast("Error al cargar datos ("+e.message+")");
    console.error(e);
  }finally{ btn.classList.remove("loading"); }
}

/* ---------- clock ---------- */
function tickClock(){
  const d=new Date();
  $("#clock").textContent = d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
}

/* ---------- init ---------- */
document.addEventListener("click",e=>{ if(e.target.matches("[data-close]")) closeModal(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });
$("#btnRefresh").addEventListener("click",()=>load(true));
tickClock(); setInterval(tickClock,30000);
load(false);
