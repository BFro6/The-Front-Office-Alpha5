
/*
 THE FRONT OFFICE
 ALPHA 6.4 — TRAINING CAMP COMPETITION

 Designed for alpha63.html.
 Preserves the existing Alpha 6.3 save.
*/
(()=>{
'use strict';

const KEY='frontoffice_alpha63_v1';

let overlay=null;
let activeTab='Office';

const $=id=>document.getElementById(id);

const clamp=(v,min,max)=>
 Math.max(min,Math.min(max,v));

const random=(min,max)=>
 Math.floor(Math.random()*(max-min+1))+min;

const escapeHTML=value=>
 String(value).replace(/[&<>"']/g,c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
 }[c]));

function load(){
 try{
  return JSON.parse(localStorage.getItem(KEY));
 }catch{
  return null;
 }
}

function save(s){
 localStorage.setItem(KEY,JSON.stringify(s));
}

function initialize(s){
 if(!s.camp){
  s.camp={
   completed:false,
   decision:null,
   results:[],
   depthChart:{},
   report:null
  };
 }

 for(const p of s.roster){
  if(typeof p.readiness!=='number'){
   p.readiness=random(65,82);
  }

  if(typeof p.campGrowth!=='number'){
   p.campGrowth=0;
  }
 }
}

function eligible(s){
 return s?.employed&&s.phase===4;
}

function receivers(s){
 return s.roster
  .filter(p=>p.pos==='WR')
  .sort((a,b)=>b.ovr-a.ovr);
}

function ensureCompetition(s){
 const wr=receivers(s);

 if(wr.length>=2){
  return wr;
 }

 while(receivers(s).length<2){
  const i=receivers(s).length+1;

  s.roster.push({
   id:'camp-wr-'+s.year+'-'+i,
   name:i===1
    ?'Camp Veteran Receiver'
    :'Developmental Receiver',
   pos:'WR',
   ovr:i===1?73:69,
   salary:i===1?1.8:1.1,
   years:1,
   morale:72,
   injury:0,
   readiness:i===1?76:66,
   campGrowth:0,
   campInvite:true
  });
 }

 return receivers(s);
}

function getPair(s){
 const wr=ensureCompetition(s);

 // Preserve the top receiver as WR1.
 // Competition is between the next two
 // receivers for the following depth slot.
 if(wr.length>=3){
  return [wr[1],wr[2]];
 }

 return [wr[0],wr[1]];
}

function renderChart(s){
 const chart=s.camp.depthChart.WR||[];

 const rows=chart.map((id,i)=>{
  const p=s.roster.find(x=>x.id===id);

  if(!p)return '';

  return `
   <div class="camp-player">
    <div>
     <strong>WR${i+1}</strong>
     <span>${escapeHTML(p.name)}</span>
    </div>
    <small>
     OVR ${p.ovr} ·
     Readiness ${p.readiness}%
    </small>
   </div>
  `;
 }).join('');

 return rows||'<p>No depth chart set.</p>';
}

function close(){
 overlay?.remove();
 overlay=null;
}

function open(){
 const s=load();

 if(!eligible(s)){
  alert(
   'Training camp competition is available during the July Training Camp phase.'
  );
  return;
 }

 initialize(s);
 ensureCompetition(s);
 save(s);

 draw();
}

function draw(){
 const s=load();

 if(!s)return;

 initialize(s);

 const pair=getPair(s);
 const [a,b]=pair;

 if(!overlay){
  overlay=document.createElement('div');
  overlay.id='camp-overlay';
  document.body.appendChild(overlay);
 }

 overlay.innerHTML=`
 <style>
 #camp-overlay{
  position:fixed;
  inset:0;
  z-index:99999;
  overflow-y:auto;
  background:#07101cf5;
  padding:16px;
  color:#f6f8fb;
  font-family:system-ui,sans-serif;
 }
 #camp-overlay .camp-panel{
  max-width:650px;
  margin:12px auto;
  background:#172739;
  border:2px solid #fb4f14;
  border-radius:19px;
  padding:20px;
 }
 #camp-overlay .camp-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
 }
 #camp-overlay h2{
  margin:0 0 10px;
 }
 #camp-overlay p{
  line-height:1.5;
 }
 #camp-overlay .camp-box{
  background:#263a51;
  padding:15px;
  margin:12px 0;
  border-radius:12px;
 }
 #camp-overlay .camp-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
 }
 #camp-overlay .camp-player{
  padding:12px;
  background:#203148;
  border-radius:10px;
  margin:8px 0;
 }
 #camp-overlay .camp-player strong{
  color:#ff9c65;
  margin-right:9px;
 }
 #camp-overlay .camp-player small{
  display:block;
  margin-top:5px;
  color:#b5c6da;
 }
 #camp-overlay button{
  background:#293d55;
  border:1px solid #657d97;
  border-radius:10px;
  color:white;
  padding:13px;
  font:inherit;
  margin:5px 4px 5px 0;
 }
 #camp-overlay .camp-primary{
  background:#fb4f14;
  border-color:#fb4f14;
  font-weight:800;
 }
 #camp-overlay .camp-result{
  background:#163a35;
  border-left:4px solid #65d8a6;
  padding:13px;
  border-radius:9px;
 }
 @media(max-width:500px){
  #camp-overlay .camp-grid{
   grid-template-columns:1fr;
  }
 }
 </style>

 <div class="camp-panel">

  <div class="camp-header">
   <h2>🏈 Training Camp</h2>
   <button id="camp-close">✕</button>
  </div>

  <p style="color:#b5c6da">
   Alpha 6.4 · July ${s.year}
  </p>

  ${s.camp.completed?`
   <div class="camp-result">
    <h2>✓ Competition Complete</h2>
    <p>${escapeHTML(s.camp.report)}</p>
   </div>

   <h3>Updated WR Depth Chart</h3>
   ${renderChart(s)}

   <button id="camp-done"
    class="camp-primary">
    Return to Training Camp
   </button>
  `:`

   <div class="camp-box">
    <strong>Head Coach — Personnel Meeting</strong>

    <p>
     GM, we've got two receivers competing
     for the next spot on the depth chart.
     One has better current production,
     but the other might have more upside.
    </p>

    <p>
     My recommendation is to split the
     first-team reps and let them compete.
     That gives us an honest evaluation,
     but we risk losing some preparation
     time by dividing the work.
    </p>
   </div>

   <div class="camp-grid">

    <div class="camp-box">
     <strong>${escapeHTML(a.name)}</strong>
     <p>
      OVR ${a.ovr}<br>
      Readiness ${a.readiness}%<br>
      Morale ${a.morale}%
     </p>
    </div>

    <div class="camp-box">
     <strong>${escapeHTML(b.name)}</strong>
     <p>
      OVR ${b.ovr}<br>
      Readiness ${b.readiness}%<br>
      Morale ${b.morale}%
     </p>
    </div>

   </div>

   <div class="camp-box">
    <h3>Coaching Decision</h3>

    <p>
     <strong>Split Reps & Let Them Compete</strong>
    </p>

    <p style="color:#b5c6da">
     Both players receive development
     opportunities. Their readiness
     changes based on camp performance,
     and the stronger performer earns
     the higher depth-chart position.
    </p>
   </div>

   <button id="camp-compete"
    class="camp-primary">
    Split Reps & Start Competition
   </button>

  `}

 </div>`;

 $('camp-close').onclick=close;

 const compete=$('camp-compete');
 if(compete)compete.onclick=runCompetition;

 const done=$('camp-done');
 if(done)done.onclick=close;
}

function runCompetition(){
 const s=load();

 if(!eligible(s))return;

 initialize(s);

 if(s.camp.completed){
  draw();
  return;
 }

 const [a,b]=getPair(s);

 const reports=[];

 for(const p of [a,b]){
  const growth=random(0,2);
  const readinessGain=random(3,11);

  p.ovr=clamp(p.ovr+growth,40,99);
  p.readiness=clamp(
   p.readiness+readinessGain,
   0,100
  );
  p.campGrowth+=growth;
  p.morale=clamp(
   p.morale+random(1,4),
   0,100
  );

  const performance=
   p.ovr*.68+
   p.readiness*.22+
   random(-6,6);

  reports.push({
   id:p.id,
   name:p.name,
   growth,
   readinessGain,
   performance
  });
 }

 reports.sort(
  (x,y)=>y.performance-x.performance
 );

 const winner=s.roster.find(
  p=>p.id===reports[0].id
 );

 const loser=s.roster.find(
  p=>p.id===reports[1].id
 );

 const all=receivers(s).filter(
  p=>p.id!==winner.id&&p.id!==loser.id
 );

 const chart=[
  ...all,
  winner,
  loser
 ].sort((x,y)=>{
  // Keep elite WR1 ahead of the
  // competition participants.
  if(x.id===winner.id&&y.id===loser.id)
   return -1;
  if(x.id===loser.id&&y.id===winner.id)
   return 1;

  return y.ovr-x.ovr;
 });

 s.camp.completed=true;
 s.camp.decision='Split reps';
 s.camp.results=reports;
 s.camp.depthChart.WR=chart.map(p=>p.id);

 s.camp.report=
  winner.name+
  ' won the receiver competition. '+
  'Both players developed and improved '+
  'their game readiness. '+
  loser.name+
  ' will enter the season lower '+
  'on the depth chart.';

 s.news.unshift(
  'Training Camp: '+s.camp.report
 );

 save(s);
 draw();
}

function addCampButton(){
 const s=load();

 if(!eligible(s))return;

 if($('alpha64-button'))return;

 const heading=[
  ...document.querySelectorAll('h2')
 ].find(h=>h.textContent.includes(
  'NFL League Calendar'
 ));

 if(!heading)return;

 const box=document.createElement('div');

 box.id='alpha64-button';
 box.className='notice';

 box.innerHTML=`
  <h3>🏈 Training Camp Personnel Meeting</h3>
  <p>
   Your coaching staff is ready to
   evaluate the receiver competition.
  </p>
  <button id="open-camp-meeting"
   class="primary">
   Open Competition Meeting →
  </button>
 `;

 heading.parentNode.insertBefore(
  box,
  heading.nextSibling
 );

 $('open-camp-meeting').onclick=open;
}

function addDepthChart(){
 const s=load();

 if(!s?.camp?.completed)return;

 if($('alpha64-depth'))return;

 const heading=[
  ...document.querySelectorAll('h2')
 ].find(h=>h.textContent.includes(
  'Personnel Department'
 ));

 if(!heading)return;

 const box=document.createElement('div');

 box.id='alpha64-depth';
 box.className='notice';

 box.innerHTML=`
  <h3>📋 WR Depth Chart</h3>
  ${renderChart(s)}
  <button id="view-camp-report">
   View Training Camp Report
  </button>
 `;

 heading.parentNode.insertBefore(
  box,
  heading.nextSibling
 );

 $('view-camp-report').onclick=draw;
}

const observer=new MutationObserver(()=>{
 addCampButton();
 addDepthChart();
});

observer.observe(
 $('app'),
 {
  childList:true,
  subtree:true
 }
);

addCampButton();
addDepthChart();

})();
