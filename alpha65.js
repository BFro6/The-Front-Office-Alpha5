
/*
 THE FRONT OFFICE
 ALPHA 6.5 — PRESEASON & ROSTER BATTLES

 Works with Alpha 6.3 + 6.4.
 Preserves the existing career save.
*/
(()=>{
'use strict';

const KEY='frontoffice_alpha63_v1';
const APP=document.getElementById('app');

if(!APP)return;

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;',
 '"':'&quot;',"'":'&#39;'
}[c]));

const load=()=>{
 try{return JSON.parse(localStorage.getItem(KEY))}
 catch{return null}
};

const save=s=>localStorage.setItem(KEY,JSON.stringify(s));

const TEAM_NAMES={
 ARI:'Arizona',ATL:'Atlanta',BAL:'Baltimore',
 BUF:'Buffalo',CAR:'Carolina',CHI:'Chicago',
 CIN:'Cincinnati',CLE:'Cleveland',
 DAL:'Dallas',DEN:'Denver',DET:'Detroit',
 GB:'Green Bay',HOU:'Houston',
 IND:'Indianapolis',JAX:'Jacksonville',
 KC:'Kansas City',LV:'Las Vegas',
 LAC:'LA Chargers',LAR:'LA Rams',
 MIA:'Miami',MIN:'Minnesota',
 NE:'New England',NO:'New Orleans',
 NYG:'NY Giants',NYJ:'NY Jets',
 PHI:'Philadelphia',PIT:'Pittsburgh',
 SF:'San Francisco',SEA:'Seattle',
 TB:'Tampa Bay',TEN:'Tennessee',
 WAS:'Washington'
};

const PLANS={
 protect:{
  name:'Protect the Starters',
  starter:15,
  backup:85,
  growth:2,
  risk:1
 },
 balanced:{
  name:'Balanced Rotation',
  starter:45,
  backup:55,
  growth:4,
  risk:3
 },
 aggressive:{
  name:'Extended Starter Reps',
  starter:75,
  backup:25,
  growth:6,
  risk:7
 }
};

function init(s){
 if(!s.preseason||s.preseason.year!==s.year){
  s.preseason={
   year:s.year,
   games:[],
   completed:false
  };
 }

 for(const p of s.roster){
  if(typeof p.readiness!=='number')
   p.readiness=70;

  if(typeof p.campGrowth!=='number')
   p.campGrowth=0;
 }
}

function available(s){
 return s&&s.employed&&s.phase===5;
}

function opponent(s,week){
 const ids=Object.keys(s.ratings||{})
  .filter(id=>id!==s.team);

 if(!ids.length)return 'NE';

 return ids[(s.year+week*7)%ids.length];
}

function starters(s){
 const chosen=new Set();

 const depth=s.camp?.depthChart?.WR||[];

 // Respect the training-camp WR depth chart.
 for(const id of depth.slice(0,2)){
  if(s.roster.some(p=>p.id===id))
   chosen.add(id);
 }

 const groups={};

 for(const p of s.roster){
  (groups[p.pos]??=[]).push(p);
 }

 for(const [pos,players] of Object.entries(groups)){
  players.sort((a,b)=>b.ovr-a.ovr);

  const slots={
   QB:1,RB:1,WR:2,TE:1,
   OT:2,G:2,C:1,EDGE:2,
   DT:2,LB:2,CB:2,S:2,K:1
  }[pos]||1;

  let count=0;

  for(const p of players){
   if(chosen.has(p.id))continue;

   if(count<slots){
    chosen.add(p.id);
    count++;
   }
  }
 }

 return chosen;
}

function teamRating(s){
 const healthy=s.roster.filter(p=>!p.injury);

 if(!healthy.length)return 45;

 const sorted=[...healthy].sort(
  (a,b)=>b.ovr-a.ovr
 );

 const top=sorted.slice(0,22);

 const avg=top.reduce((n,p)=>
  n+p.ovr*.8+p.readiness*.2,0
 )/top.length;

 return clamp(avg,40,99);
}

function simulate(planKey){
 const s=load();

 if(!available(s))return;

 init(s);

 if(s.preseason.games.length>=3)return;

 const plan=PLANS[planKey];
 if(!plan)return;

 const week=s.preseason.games.length+1;
 const opp=opponent(s,week);
 const starting=starters(s);

 const rating=teamRating(s);
 const other=s.ratings?.[opp]||{
  off:78,def:78
 };

 const otherRating=(other.off+other.def)/2;

 // The game result responds to roster strength
 // and the selected snap strategy.
 const readinessFactor=
  planKey==='balanced'?2:
  planKey==='aggressive'?3:-1;

 const ours=clamp(
  Math.round(
   19+(rating-otherRating)*.65+
   readinessFactor+rand(-13,13)
  ),0,48
 );

 const theirs=clamp(
  Math.round(
   20+(otherRating-rating)*.55+
   rand(-12,12)
  ),0,48
 );

 const developments=[];
 const injuries=[];

 for(const p of s.roster){
  const starter=starting.has(p.id);

  const snapShare=starter
   ?plan.starter
   :plan.backup;

  // Players with existing injuries do not
  // participate in preseason games.
  if(p.injury>0)continue;

  const readinessGain=rand(
   0,
   Math.max(1,Math.round(
    snapShare*plan.growth/100
   ))
  );

  const before=p.readiness;

  p.readiness=clamp(
   p.readiness+readinessGain,
   0,100
  );

  let growth=0;

  // Backups have more development chances
  // when they receive meaningful snaps.
  if(snapShare>=45&&rand(1,100)<=13){
   growth=1;
   p.ovr=clamp(p.ovr+1,40,99);
  }

  if(readinessGain||growth){
   developments.push({
    name:p.name,
    readinessBefore:before,
    readinessAfter:p.readiness,
    growth,
    starter
   });
  }

  // Approximate per-player risk. This is a
  // gameplay model, not a medical prediction.
  const risk=starter
   ?plan.risk
   :Math.max(1,Math.round(plan.risk*.55));

  if(rand(1,1000)<=risk*2){
   p.injury=rand(1,3);
   injuries.push({
    name:p.name,
    games:p.injury
   });
  }
 }

 const result={
  week,
  opponent:opp,
  ours,
  theirs,
  plan:planKey,
  developments,
  injuries
 };

 s.preseason.games.push(result);
 s.preseason.completed=
  s.preseason.games.length===3;

 s.news??=[];

 s.news.unshift(
  `Preseason W${week}: `+
  `${s.team} ${ours} – ${opp} ${theirs}. `+
  `${plan.name}.`
 );

 save(s);
 draw();
}

function playerReport(game){
 const improvements=[
  ...game.developments
 ].sort((a,b)=>
  b.growth-a.growth||
  (b.readinessAfter-b.readinessBefore)-
  (a.readinessAfter-a.readinessBefore)
 ).slice(0,8);

 return `
  <h3>Player Development</h3>

  ${improvements.length?improvements.map(p=>`
   <div class="ps-row">
    <b>${esc(p.name)}</b>
    <small>
     Readiness ${p.readinessBefore}%
     → ${p.readinessAfter}%
     ${p.growth?' · +1 OVR':''}
     · ${p.starter?'Starter':'Reserve'}
    </small>
   </div>
  `).join(''):'No significant development.'}

  <h3>Medical Report</h3>

  ${game.injuries.length?
   game.injuries.map(p=>`
    <div class="ps-row">
     ⚠️ ${esc(p.name)}
     · ${p.games} simulated game-week(s)
    </div>
   `).join(''):
   '<p>No new injuries reported.</p>'}
 `;
}

let modal=null;

function close(){
 modal?.remove();
 modal=null;
}

function draw(){
 const s=load();

 if(!available(s)){
  close();
  return;
 }

 init(s);

 if(!modal){
  modal=document.createElement('div');
  modal.id='ps-overlay';
  document.body.appendChild(modal);
 }

 const played=s.preseason.games.length;
 const latest=s.preseason.games.at(-1);

 modal.innerHTML=`
 <style>
 #ps-overlay{
  position:fixed;
  inset:0;
  z-index:99999;
  overflow-y:auto;
  background:#07101cf5;
  padding:15px;
  font-family:system-ui,sans-serif;
  color:white;
 }
 #ps-overlay .ps-panel{
  max-width:680px;
  margin:10px auto;
  padding:20px;
  border:2px solid #fb4f14;
  border-radius:18px;
  background:#172739;
 }
 #ps-overlay h2{margin:0 0 10px}
 #ps-overlay h3{margin:18px 0 8px}
 #ps-overlay p{line-height:1.5}
 #ps-overlay .ps-box{
  padding:15px;
  margin:12px 0;
  border-radius:12px;
  background:#263a51;
 }
 #ps-overlay .ps-row{
  padding:11px 0;
  border-bottom:1px solid #506078;
 }
 #ps-overlay .ps-row small{
  display:block;
  color:#b5c6da;
  margin-top:5px;
 }
 #ps-overlay button{
  padding:13px;
  margin:5px 4px 5px 0;
  border:1px solid #6a819a;
  border-radius:10px;
  color:white;
  background:#293d55;
  font:inherit;
 }
 #ps-overlay button.ps-primary{
  background:#fb4f14;
  border-color:#fb4f14;
  font-weight:800;
 }
 #ps-overlay .ps-plan{
  width:100%;
  text-align:left;
  margin:6px 0;
 }
 #ps-overlay .ps-plan small{
  display:block;
  margin-top:5px;
  color:#d3dfed;
 }
 #ps-overlay .ps-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
 }
 #ps-overlay .ps-score{
  font-size:27px;
  font-weight:900;
  margin:12px 0;
 }
 </style>

 <div class="ps-panel">

  <div class="ps-header">
   <h2>🏟️ Preseason Headquarters</h2>
   <button id="ps-close">✕</button>
  </div>

  <p style="color:#b5c6da">
   ${s.year} · ${esc(TEAM_NAMES[s.team]||s.team)}
   · ${played}/3 games complete
  </p>

  ${latest?`
   <div class="ps-box">
    <strong>Latest Result · Week ${latest.week}</strong>

    <div class="ps-score">
     ${esc(s.team)} ${latest.ours}
     — ${latest.theirs}
     ${esc(latest.opponent)}
    </div>

    <small>
     Strategy: ${esc(PLANS[latest.plan].name)}
    </small>
   </div>

   ${playerReport(latest)}
  `:''}

  ${played<3?`
   <div class="ps-box">
    <h3>Head Coach — Game ${played+1}</h3>

    <p>
     GM, we're facing
     ${esc(TEAM_NAMES[opponent(s,played+1)]||
       opponent(s,played+1))}.
     How much playing time do you want
     our starters to receive?
    </p>
   </div>

   <button class="ps-plan" data-plan="protect">
    <b>🛡️ Protect the Starters</b>
    <small>
     Starters 15% · Reserves 85%.
     Lower injury exposure, more
     opportunities for backups.
    </small>
   </button>

   <button class="ps-plan" data-plan="balanced">
    <b>⚖️ Balanced Rotation</b>
    <small>
     Starters 45% · Reserves 55%.
     Balanced readiness, evaluation
     and injury exposure.
    </small>
   </button>

   <button class="ps-plan" data-plan="aggressive">
    <b>🔥 Extended Starter Reps</b>
    <small>
     Starters 75% · Reserves 25%.
     Greater starter preparation,
     but increased injury exposure.
    </small>
   </button>
  `:`
   <div class="ps-box">
    <h2>✓ Preseason Complete</h2>
    <p>
     All three exhibition games
     are complete. Your roster's
     development, readiness and
     injuries have been saved.
    </p>

    <button class="ps-primary" id="ps-done">
     Return to Calendar →
    </button>
   </div>
  `}

  <h3>Preseason Schedule</h3>

  ${[1,2,3].map(w=>{
   const g=s.preseason.games[w-1];

   return `
    <div class="ps-row">
     <b>Week ${w}</b> ·
     ${esc(TEAM_NAMES[opponent(s,w)]||
       opponent(s,w))}
     <small>
      ${g?
       `${g.ours}–${g.theirs} · `+
       `${esc(PLANS[g.plan].name)}`:
       'Not played'}
     </small>
    </div>
   `;
  }).join('')}

 </div>`;

 document.getElementById('ps-close')
  .onclick=close;

 const done=document.getElementById('ps-done');
 if(done)done.onclick=close;

 modal.querySelectorAll('[data-plan]')
  .forEach(b=>b.onclick=()=>{
   const plan=b.dataset.plan;

   if(confirm(
    `Play preseason Week ${played+1} using `+
    `${PLANS[plan].name}?`
   )){
    simulate(plan);
   }
  });
}

function inject(){
 const s=load();

 if(!available(s))return;

 if(document.getElementById('ps-entry'))
  return;

 const title=[...APP.querySelectorAll('h2')]
  .find(x=>x.textContent.includes(
   'NFL League Calendar'
  ));

 if(!title)return;

 init(s);
 save(s);

 const played=s.preseason.games.length;

 const section=document.createElement('div');
 section.id='ps-entry';
 section.className='notice';

 section.innerHTML=`
  <h3>🏟️ Preseason Command Center</h3>
  <p>
   ${played} of 3 preseason games completed.
   Set starter snaps, evaluate players,
   and manage injury risk.
  </p>

  <button class="primary" id="ps-open">
   ${played===3
    ?'Review Preseason Results'
    :'Open Preseason Game Plan →'}
  </button>
 `;

 title.after(section);

 document.getElementById('ps-open')
  .onclick=draw;
}

// Prevent bypassing the preseason stage.
// Capture phase runs before Alpha 6.3's
// original Advance button handler.
document.addEventListener('click',event=>{
 const button=event.target.closest?.(
  '[data-act="advance"]'
 );

 if(!button)return;

 const s=load();

 if(!available(s))return;

 init(s);

 if(s.preseason.games.length<3){
  event.preventDefault();
  event.stopImmediatePropagation();

  alert(
   'Finish all three preseason games '+
   'before advancing to the regular season.'
  );

  draw();
 }
},true);

// Inject the entry point when the core
// game redraws the Calendar tab.
const observer=new MutationObserver(inject);

observer.observe(APP,{
 childList:true,
 subtree:true
});

inject();

})();
