
/* THE FRONT OFFICE — ALPHA 5
   Standalone Living League Engine
   Fictional ratings and schedules.
*/
(()=>{
'use strict';

const KEY='frontoffice_alpha5_v1';
const raw=[
['BUF','Buffalo','AFC East',86,83],
['MIA','Miami','AFC East',79,75],
['NE','New England','AFC East',78,79],
['NYJ','New York Jets','AFC East',73,76],
['BAL','Baltimore','AFC North',87,86],
['CIN','Cincinnati','AFC North',86,76],
['PIT','Pittsburgh','AFC North',76,85],
['CLE','Cleveland','AFC North',70,77],
['HOU','Houston','AFC South',83,84],
['IND','Indianapolis','AFC South',80,76],
['JAX','Jacksonville','AFC South',80,77],
['TEN','Tennessee','AFC South',70,73],
['KC','Kansas City','AFC West',87,84],
['DEN','Denver','AFC West',79,85],
['LAC','LA Chargers','AFC West',84,83],
['LV','Las Vegas','AFC West',72,73],
['PHI','Philadelphia','NFC East',88,87],
['DAL','Dallas','NFC East',82,77],
['WAS','Washington','NFC East',83,77],
['NYG','NY Giants','NFC East',72,74],
['DET','Detroit','NFC North',89,84],
['GB','Green Bay','NFC North',84,83],
['MIN','Minnesota','NFC North',80,82],
['CHI','Chicago','NFC North',77,81],
['TB','Tampa Bay','NFC South',80,79],
['ATL','Atlanta','NFC South',78,76],
['CAR','Carolina','NFC South',72,73],
['NO','New Orleans','NFC South',73,75],
['SF','San Francisco','NFC West',87,85],
['SEA','Seattle','NFC West',82,83],
['LAR','LA Rams','NFC West',85,80],
['ARI','Arizona','NFC West',75,74]
];

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const random=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const teams=()=>raw.map(([id,name,division,off,def],i)=>({
 id,name,division,off,def,
 gm:['Patient','Aggressive','Pragmatic'][i%3],
 w:0,l:0,t:0
}));

// A 32-team round robin supplies 17 unique opponents.
// Week 10 is a temporary league-wide bye.
function schedule(){
 const ids=raw.map(x=>x[0]);
 const rounds=[];
 for(let r=0;r<17;r++){
  const games=[];
  for(let i=0;i<16;i++){
   const a=ids[i],b=ids[31-i];
   games.push({home:r%2?a:b,away:r%2?b:a});
  }
  rounds.push(games);
  ids.splice(1,0,ids.pop());
 }
 return [
  ...rounds.slice(0,9),
  [],
  ...rounds.slice(9)
 ];
}

function fresh(){
 return {
  year:2026,week:1,
  clubs:teams(),
  schedule:schedule(),
  results:[],
  history:[],
  confidence:73,
  morale:72,
  scheme:'Balanced'
 };
}

let state;
try{
 const saved=JSON.parse(localStorage.getItem(KEY));
 state=saved?.clubs?.length===32 &&
       saved?.schedule?.length===18 &&
       Array.isArray(saved.results)
       ?saved:fresh();
}catch(e){state=fresh();}

const club=id=>state.clubs.find(t=>t.id===id);
const record=t=>`${t.w}-${t.l}-${t.t}`;
const gameFor=(week,id)=>
 state.schedule[week-1]?.find(g=>g.home===id||g.away===id);
const opponent=(week,id)=>{
 const g=gameFor(week,id);
 return g?club(g.home===id?g.away:g.home):null;
};
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(state));}
 catch(e){console.warn('Save unavailable',e);}
}
function rebuildRecords(){
 state.clubs.forEach(t=>{t.w=0;t.l=0;t.t=0;});
 for(const g of state.results){
  const h=club(g.home),a=club(g.away);
  if(!h||!a)continue;
  if(g.hs===g.as){h.t++;a.t++;}
  else if(g.hs>g.as){h.w++;a.l++;}
  else{h.l++;a.w++;}
 }
}

// Each drive is generated before the result is known.
function drive(off,def,scheme){
 const edge=off-def;
 const roll=random(1,100);
 const aggressive=scheme==='Aggressive';
 const conservative=scheme==='Ball control';
 const td=clamp(18+edge*.65+
  (aggressive?4:0)-(conservative?3:0),5,48);
 const fg=clamp(18+edge*.15,8,28);
 const turnover=clamp(12-edge*.20+
  (aggressive?4:0)-(conservative?3:0),4,25);

 if(roll<=td)return {pts:7,type:'Touchdown'};
 if(roll<=td+fg)return {pts:3,type:'Field goal'};
 if(roll<=td+fg+turnover)
  return {pts:0,type:'Turnover'};
 return {pts:0,type:'Punt'};
}

function play(home,away,userGame=false){
 const h=club(home),a=club(away);
 const hScheme=userGame&&home==='CIN'
  ?state.scheme:'Balanced';
 const aScheme=userGame&&away==='CIN'
  ?state.scheme:'Balanced';
 const hOff=h.off+(home==='CIN'?(state.morale-70)*.04:0);
 const aOff=a.off+(away==='CIN'?(state.morale-70)*.04:0);
 let hs=0,as=0;
 const drives=[];

 for(let i=0;i<10;i++){
  const hd=drive(hOff,a.def,hScheme);
  const ad=drive(aOff,h.def,aScheme);
  hs+=hd.pts;as+=ad.pts;
  if(userGame){
   drives.push({
    possession:i+1,
    home:hd.type,away:ad.type,
    hs,as
   });
  }
 }
 // Simplified overtime. Ties remain possible.
 if(hs===as){
  for(let i=0;i<3&&hs===as;i++){
   hs+=drive(hOff,a.def,hScheme).pts;
   as+=drive(aOff,h.def,aScheme).pts;
  }
 }
 return {home,away,hs,as,drives};
}

function simulate(){
 if(state.week>18)return;
 const week=state.week;
 const fixtures=state.schedule[week-1];
 const myGame=gameFor(week,'CIN');
 let featured=null;

 for(const g of fixtures){
  const userGame=g.home==='CIN'||g.away==='CIN';
  const result=play(g.home,g.away,userGame);
  state.results.push({...result,week});
  if(userGame)featured=result;
 }

 if(featured){
  const cinScore=featured.home==='CIN'
   ?featured.hs:featured.as;
  const oppScore=featured.home==='CIN'
   ?featured.as:featured.hs;
  const opp=club(featured.home==='CIN'
   ?featured.away:featured.home);
  const outcome=cinScore>oppScore?'WIN':
   cinScore<oppScore?'LOSS':'TIE';

  state.history.push({
   week,opponent:opp.name,
   cinScore,oppScore,outcome,
   drives:featured.drives
  });
  state.confidence=clamp(
   state.confidence+(outcome==='WIN'?3:
    outcome==='LOSS'?-4:0),0,100);
  state.morale=clamp(
   state.morale+(outcome==='WIN'?2:
    outcome==='LOSS'?-3:0),0,100);
 }

 state.week++;
 rebuildRecords();
 save();
 render();
}

function direction(t){
 const n=t.w+t.l+t.t;
 if(n<4)return 'Evaluating';
 const pct=(t.w+t.t*.5)/n;
 if(pct>=.7)return 'Contender';
 if(pct<=.3)return 'Rebuilding';
 if(pct>=.5)return 'Playoff hunt';
 return 'On the bubble';
}

let tab='Office';
const tabs=['Office','Season','League','GM Desk'];

function office(){
 const cin=club('CIN');
 const opp=opponent(state.week,'CIN');
 const latest=state.history.at(-1);
 return `
 <div class="grid">
  <div class="stat">SEASON<strong>${state.year}</strong></div>
  <div class="stat">W–L–T<strong>${record(cin)}</strong></div>
  <div class="stat">OWNER<strong>${state.confidence}%</strong></div>
  <div class="stat">MORALE<strong>${state.morale}%</strong></div>
 </div>
 <div class="panel">
  <h2>🐅 GM COMMAND CENTER</h2>
  <p>${state.week>18?'Regular season complete':
   'Week '+state.week}</p>
  <p>Next opponent:
   <b>${opp?opp.name:'League bye / season complete'}</b>
  </p>
  <p>Current game plan: <b>${state.scheme}</b></p>
  ${state.week<=18?
   '<button id="sim">Simulate Next Week →</button>':
   '<p>Season complete.</p>'}
 </div>
 <div class="panel">
  <h2>🏈 Latest Result</h2>
  ${latest?
   `<h3>Cincinnati ${latest.cinScore} –
   ${latest.oppScore} ${latest.opponent}</h3>
   <p>${latest.outcome} · Week ${latest.week}</p>`:
   '<p>Your first game awaits.</p>'}
 </div>`;
}

function season(){
 return `<div class="panel">
 <h2>🏟️ SEASON CENTER</h2>
 <p class="muted">Fictional 18-week schedule,
  17 games per club, temporary Week 10 bye.</p>
 ${state.history.map(g=>`
  <div class="panel">
   <b>Week ${g.week} · ${g.outcome}</b>
   <p>Cincinnati ${g.cinScore} –
    ${g.oppScore} ${g.opponent}</p>
  </div>`).join('')||'<p>No games played yet.</p>'}
 </div>`;
}

function league(){
 const sorted=[...state.clubs].sort((a,b)=>{
  const pa=(a.w+a.t*.5)/(a.w+a.l+a.t||1);
  const pb=(b.w+b.t*.5)/(b.w+b.l+b.t||1);
  return pb-pa||b.w-a.w;
 });
 return `<div class="panel">
 <h2>🌎 LIVING LEAGUE</h2>
 <p class="muted">Simulated records, not real NFL results.</p>
 <section><table>
 <thead><tr>
 <th>Team</th><th>Record</th><th>Direction</th>
 </tr></thead><tbody>
 ${sorted.map(t=>`<tr>
 <td>${t.id==='CIN'?'🐅 ':''}${t.name}</td>
 <td>${record(t)}</td>
 <td>${direction(t)}</td>
 </tr>`).join('')}
 </tbody></table></section></div>`;
}

function gmDesk(){
 const cin=club('CIN');
 return `<div class="panel">
 <h2>🤝 GM DESK</h2>
 <p>Offensive philosophy</p>
 <select id="scheme" style="
  width:100%;padding:13px;background:#293649;
  color:white;border:1px solid #52647c;
  border-radius:8px">
  ${['Balanced','Aggressive','Ball control']
   .map(s=>`<option ${state.scheme===s?'selected':''}>
    ${s}</option>`).join('')}
 </select>
 <p>Team direction: <b>${direction(cin)}</b></p>
 <p>GM Academy: Aggressive play can produce more
 touchdowns and turnovers. Ball control reduces
 volatility. Neither guarantees victory.</p>
 <hr>
 <h3>Opposing Front Offices</h3>
 ${state.clubs.filter(t=>t.id!=='CIN')
 .slice(0,8).map(t=>`
  <p>${t.name} · ${record(t)} ·
   ${t.gm} · ${direction(t)}</p>`).join('')}
 <p class="muted">Trade negotiations, contracts,
 and salary-cap management are planned for a
 future build. No trade buttons are active yet.</p>
 </div>`;
}

function render(){
 document.getElementById('nav').innerHTML=
  tabs.map(t=>`<button data-tab="${t}"
   class="${tab===t?'active':''}">${t}</button>`).join('');
 document.getElementById('app').innerHTML=
  tab==='Office'?office():
  tab==='Season'?season():
  tab==='League'?league():gmDesk();

 document.querySelectorAll('[data-tab]').forEach(b=>{
  b.onclick=()=>{tab=b.dataset.tab;render();};
 });
 const sim=document.getElementById('sim');
 if(sim)sim.onclick=simulate;
 const scheme=document.getElementById('scheme');
 if(scheme)scheme.onchange=e=>{
  state.scheme=e.target.value;
  save();render();
 };
}

rebuildRecords();
save();
render();
})();
