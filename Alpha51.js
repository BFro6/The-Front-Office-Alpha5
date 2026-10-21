
/* THE FRONT OFFICE — ALPHA 5.1
   Visual Identity + Verified Contract Board
   Preserves the Alpha 5 franchise save.
*/
(()=>{
'use strict';

const THEME_KEY='frontoffice_theme_v1';
const teams=[
['ARI','Arizona','#97233f','#ffb612'],
['ATL','Atlanta','#a71930','#000000'],
['BAL','Baltimore','#241773','#9e7c0c'],
['BUF','Buffalo','#00338d','#c60c30'],
['CAR','Carolina','#0085ca','#101820'],
['CHI','Chicago','#0b162a','#c83803'],
['CIN','Cincinnati','#fb4f14','#111111'],
['CLE','Cleveland','#ff3c00','#311d00'],
['DAL','Dallas','#003594','#869397'],
['DEN','Denver','#fb4f14','#002244'],
['DET','Detroit','#0076b6','#b0b7bc'],
['GB','Green Bay','#203731','#ffb612'],
['HOU','Houston','#03202f','#a71930'],
['IND','Indianapolis','#002c5f','#a2aaad'],
['JAX','Jacksonville','#006778','#d7a22a'],
['KC','Kansas City','#e31837','#ffb81c'],
['LV','Las Vegas','#a5acaf','#000000'],
['LAC','LA Chargers','#0080c6','#ffc20e'],
['LAR','LA Rams','#003594','#ffa300'],
['MIA','Miami','#008e97','#fc4c02'],
['MIN','Minnesota','#4f2683','#ffc62f'],
['NE','New England','#002244','#c60c30'],
['NO','New Orleans','#d3bc8d','#101820'],
['NYG','NY Giants','#0b2265','#a71930'],
['NYJ','New York Jets','#125740','#000000'],
['PHI','Philadelphia','#004c54','#a5acaf'],
['PIT','Pittsburgh','#ffb612','#101820'],
['SF','San Francisco','#aa0000','#b3995d'],
['SEA','Seattle','#002244','#69be28'],
['TB','Tampa Bay','#d50a0a','#34302b'],
['TEN','Tennessee','#0c2340','#4b92db'],
['WAS','Washington','#5a1414','#ffb612']
];

// Verified 2026 cap charges from OverTheCap.
// These are cap hits, NOT average annual salaries.
const contracts=[
['Joe Burrow','QB',9,37599784,12250000],
["Ja'Marr Chase",'WR',1,26171176,17730000],
['Tee Higgins','WR',5,26514706,10900000],
['Orlando Brown Jr.','OT',75,19291666,3500000],
['Boye Mafe','EDGE','—',17000000,7400000],
['Dexter Lawrence','DT','—',15333333,11000000]
];

const money=n=>'$'+(n/1000000).toFixed(2)+'M';
const originalKey='frontoffice_alpha5_v1';
let current=localStorage.getItem(THEME_KEY)||'CIN';

const style=document.createElement('style');
style.textContent=`
:root {
 --team-primary:#fb4f14;
 --team-secondary:#111111;
}
body {
 background:
 radial-gradient(ellipse at 80% 0%,
 color-mix(in srgb,var(--team-primary) 20%,transparent),
 transparent 48%),
 #090e16;
}
header {
 position:relative;
 min-height:205px;
 padding:28px 22px;
 background:
 linear-gradient(90deg,
 rgba(7,10,15,.96) 0%,
 rgba(7,10,15,.76) 55%,
 rgba(7,10,15,.30) 100%),
 radial-gradient(circle at 85% 45%,
 var(--team-primary),#111827 65%);
 border-bottom:4px solid var(--team-primary);
 overflow:hidden;
}
header:after {
 content:"";
 position:absolute;
 right:-30px;
 top:-40px;
 width:170px;
 height:280px;
 transform:rotate(-23deg);
 opacity:.18;
 background:repeating-linear-gradient(
  90deg,transparent 0 17px,
  var(--team-primary) 17px 31px,
  transparent 31px 53px);
 pointer-events:none;
}
header h1 {
 position:relative;
 z-index:1;
 font-size:clamp(25px,6vw,40px);
 letter-spacing:1px;
}
header small {position:relative;z-index:1}
#frontoffice-hero {
 position:relative;
 z-index:1;
 margin-top:18px;
 font-size:12px;
 letter-spacing:2px;
 font-weight:900;
 color:#fff;
}
#frontoffice-hero strong {
 display:block;
 margin-top:7px;
 font-size:19px;
 letter-spacing:0;
}
.panel,.stat {
 background:linear-gradient(145deg,#1c2838,#111b29);
 box-shadow:0 10px 30px rgba(0,0,0,.16);
}
nav button.active,button:not(nav button) {
 background:var(--team-primary);
 color:white;
}
#roster-button {
 border:1px solid var(--team-primary);
 color:white;
}
.fo-row {
 display:flex;
 justify-content:space-between;
 gap:12px;
 padding:12px 0;
 border-bottom:1px solid #334357;
}
.fo-row small {display:block;margin-top:4px}
.fo-card {
 border:1px solid #35475d;
 border-radius:12px;
 padding:15px;
 margin:12px 0;
 background:#111b29;
}
.fo-value {font-size:20px;font-weight:900}
.fo-link {color:#ffad79}
.fo-selector {
 width:100%;
 padding:13px;
 border-radius:10px;
 background:#293649;
 color:white;
 border:1px solid #52647c;
}
.fo-back {
 margin-bottom:16px;
 background:#293649!important;
}
`;
document.head.appendChild(style);

function getSave(){
 try{return JSON.parse(localStorage.getItem(originalKey));}
 catch(e){return null;}
}
function applyTheme(){
 const t=teams.find(t=>t[0]===current)||teams[6];
 document.documentElement.style.setProperty('--team-primary',t[2]);
 document.documentElement.style.setProperty('--team-secondary',t[3]);
 let hero=document.getElementById('frontoffice-hero');
 if(!hero){
  hero=document.createElement('div');
  hero.id='frontoffice-hero';
  document.querySelector('header')?.appendChild(hero);
 }
 const label=current==='CIN'?'THE JUNGLE':'FRANCHISE HEADQUARTERS';
 hero.innerHTML=`${label}<strong>${t[1]} · GM OFFICE</strong>`;
}

let viewing=false;
let oldMarkup='';

function showRoster(){
 const app=document.getElementById('app');
 if(!app)return;
 viewing=true;
 oldMarkup=app.innerHTML;
 const saved=getSave();
 const capSpace=8712270;

 app.innerHTML=`
 <button class="fo-back" id="fo-back">← Back to Office</button>
 <div class="panel">
  <h2>🏟️ FRANCHISE HEADQUARTERS</h2>
  <p class="muted">Preview any franchise's office colors.
  The active simulated team remains Cincinnati.</p>
  <select id="fo-team" class="fo-selector">
   ${teams.map(t=>`
    <option value="${t[0]}"
    ${t[0]===current?'selected':''}>
    ${t[1]}</option>`).join('')}
  </select>
 </div>
 <div class="panel">
  <h2>💼 2026 BENGALS CAP ROOM</h2>
  <div class="grid">
   <div class="stat">
    <small>REPORTED CAP SPACE</small>
    <strong>${money(capSpace)}</strong>
   </div>
   <div class="stat">
    <small>FRANCHISE RECORD</small>
    <strong>${saved?.clubs?.find(t=>t.id==='CIN')?.w||0}–
    ${saved?.clubs?.find(t=>t.id==='CIN')?.l||0}</strong>
   </div>
  </div>
  <p class="muted">
   Source snapshot: OverTheCap, October 2026.
   Figures may change with transactions.
   This board is read-only for now.
  </p>
 </div>
 <div class="panel">
  <h2>🐅 CONTRACT INTELLIGENCE</h2>
  <p class="muted">Verified 2026 cap charges.
   Not the full 53-player roster.</p>
  ${contracts.map(p=>`
   <div class="fo-card">
    <div class="fo-row">
     <div><b>${p[0]}</b>
      <small>${p[1]} · #${p[2]}</small></div>
     <div style="text-align:right">
      <div class="fo-value">${money(p[3])}</div>
      <small>2026 cap hit</small>
     </div>
    </div>
    <small>Base salary: ${money(p[4])}</small>
   </div>`).join('')}
  <p><a class="fo-link"
   href="https://overthecap.com/salary-cap/cincinnati-bengals"
   target="_blank" rel="noopener">
   View full Bengals cap report ↗</a></p>
  <p><a class="fo-link"
   href="https://www.bengals.com/team/players-roster/"
   target="_blank" rel="noopener">
   View official active roster ↗</a></p>
 </div>
 <div class="panel">
  <h2>📚 GM ACADEMY</h2>
  <p><b>Cap hit vs. base salary:</b> A player's
  cap charge can include bonuses and prorated
  amounts beyond his base salary.</p>
  <p><b>Restructures:</b> Converting eligible
  salary into a signing bonus can reduce this
  year's cap hit, but typically pushes costs
  into future seasons.</p>
  <p class="muted">Contract actions will be
  enabled only after we implement the actual
  cap-accounting engine.</p>
 </div>`;

 document.getElementById('fo-team').onchange=e=>{
  current=e.target.value;
  localStorage.setItem(THEME_KEY,current);
  applyTheme();
 };
 document.getElementById('fo-back').onclick=()=>{
  viewing=false;
  const app=document.getElementById('app');
  app.innerHTML=oldMarkup;
  // Re-enter the existing game through its Office tab.
  const office=[...document.querySelectorAll(
   '#nav button')].find(b=>b.textContent.trim()==='Office');
  if(office)office.click();
 };
}

function addButton(){
 const nav=document.getElementById('nav');
 if(!nav||nav.querySelector('#roster-button'))return;
 const b=document.createElement('button');
 b.id='roster-button';
 b.textContent='🏟️ Front Office';
 b.onclick=showRoster;
 nav.appendChild(b);
}

applyTheme();
addButton();

// Alpha 5 replaces navigation during its own renders.
// Restore our extra tab after those renders.
const nav=document.getElementById('nav');
if(nav){
 const observer=new MutationObserver(()=>addButton());
 observer.observe(nav,{childList:true});
}

})();
