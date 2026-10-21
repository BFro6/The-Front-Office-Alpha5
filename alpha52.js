
/* THE FRONT OFFICE — ALPHA 5.2: FRANCHISE DNA */
(()=>{
'use strict';

const profiles={
ARI:['Arizona Cardinals','Rise Up Red Sea','State Farm Stadium','Desert red','SEA','LAR'],
ATL:['Atlanta Falcons','Rise Up','Mercedes-Benz Stadium','Atlanta skyline','NO','CAR'],
BAL:['Baltimore Ravens','Ravens Flock','M&T Bank Stadium','Purple-lit harbor','PIT','CIN'],
BUF:['Buffalo Bills','Bills Mafia','Highmark Stadium','Buffalo winter','MIA','NE'],
CAR:['Carolina Panthers','Keep Pounding','Bank of America Stadium','Charlotte skyline','ATL','TB'],
CHI:['Chicago Bears','Bear Down','Soldier Field','Chicago lakefront','GB','DET'],
CIN:['Cincinnati Bengals','Welcome to The Jungle','Paycor Stadium','Cincinnati riverfront','PIT','BAL'],
CLE:['Cleveland Browns','Dawg Pound','Huntington Bank Field','Cleveland lakefront','PIT','CIN'],
DAL:['Dallas Cowboys','How ’Bout Them Cowboys','AT&T Stadium','Dallas skyline','PHI','NYG'],
DEN:['Denver Broncos','Broncos Country','Empower Field at Mile High','Rocky Mountain skyline','KC','LV'],
DET:['Detroit Lions','One Pride','Ford Field','Motor City','GB','CHI'],
GB:['Green Bay Packers','Go Pack Go','Lambeau Field','Frozen Tundra','CHI','MIN'],
HOU:['Houston Texans','We Are Texans','NRG Stadium','Houston skyline','IND','TEN'],
IND:['Indianapolis Colts','For The Shoe','Lucas Oil Stadium','Indianapolis skyline','HOU','JAX'],
JAX:['Jacksonville Jaguars','DUUUVAL!','EverBank Stadium','St. Johns River waterfront','TEN','IND'],
KC:['Kansas City Chiefs','Chiefs Kingdom','GEHA Field at Arrowhead Stadium','Kansas City skyline','BUF','DEN'],
LV:['Las Vegas Raiders','Just Win, Baby','Allegiant Stadium','Las Vegas Strip','KC','DEN'],
LAC:['Los Angeles Chargers','Bolt Up','SoFi Stadium','Los Angeles skyline','LV','KC'],
LAR:['Los Angeles Rams','Rams House','SoFi Stadium','Los Angeles skyline','SF','SEA'],
MIA:['Miami Dolphins','Fins Up','Hard Rock Stadium','South Florida coast','BUF','NYJ'],
MIN:['Minnesota Vikings','SKOL','U.S. Bank Stadium','Minneapolis skyline','GB','DET'],
NE:['New England Patriots','Do Your Job','Gillette Stadium','New England coastline','NYJ','BUF'],
NO:['New Orleans Saints','Who Dat','Caesars Superdome','French Quarter','ATL','TB'],
NYG:['New York Giants','Big Blue','MetLife Stadium','New York skyline','PHI','DAL'],
NYJ:['New York Jets','J-E-T-S!','MetLife Stadium','New York skyline','NE','MIA'],
PHI:['Philadelphia Eagles','Fly, Eagles Fly','Lincoln Financial Field','Philadelphia skyline','DAL','NYG'],
PIT:['Pittsburgh Steelers','Here We Go','Acrisure Stadium','Pittsburgh rivers','BAL','CIN'],
SF:['San Francisco 49ers','Faithful to the Bay','Levi’s Stadium','Bay Area','SEA','LAR'],
SEA:['Seattle Seahawks','12s','Lumen Field','Seattle waterfront','SF','LAR'],
TB:['Tampa Bay Buccaneers','Fire the Cannons','Raymond James Stadium','Tampa waterfront','NO','ATL'],
TEN:['Tennessee Titans','Titan Up','Nissan Stadium','Nashville skyline','JAX','IND'],
WAS:['Washington Commanders','Raise Hail','Northwest Stadium','Washington monuments','DAL','PHI']
};

const css=document.createElement('style');

css.textContent=`
#fo-dna {
 margin:14px 0;
 padding:18px;
 border:1px solid var(--team-primary,#fb4f14);
 border-radius:16px;
 background:linear-gradient(
  125deg,
  rgba(15,22,33,.96),
  rgba(32,42,58,.93)
 );
 box-shadow:0 12px 35px #0005;
}

#fo-dna .eyebrow {
 font-size:11px;
 letter-spacing:2px;
 color:#bbc5d3;
 font-weight:800;
}

#fo-dna h2 {
 margin:8px 0;
 font-size:clamp(22px,5vw,32px);
}

#fo-dna .motto {
 font-weight:900;
 color:var(--team-primary,#fb4f14);
 font-size:19px;
 margin:8px 0 16px;
}

#fo-dna .facts {
 display:grid;
 grid-template-columns:repeat(2,minmax(0,1fr));
 gap:10px;
}

#fo-dna .fact {
 background:#101927;
 border-radius:10px;
 padding:12px;
 min-width:0;
}

#fo-dna .fact small {
 display:block;
 color:#aab8c9;
 margin-bottom:6px;
 font-size:11px;
}

#fo-dna .fact b {
 font-size:13px;
 overflow-wrap:anywhere;
}

#fo-dna .note {
 font-size:12px;
 color:#b7c3d0;
 margin-top:14px;
 line-height:1.5;
}

#fo-dna .scene {
 height:125px;
 border-radius:12px;
 margin-bottom:15px;
 display:flex;
 align-items:end;
 padding:16px;
 background:
  radial-gradient(
   circle at 80% 25%,
   var(--team-primary,#fb4f14),
   transparent 55%
  ),
  linear-gradient(160deg,#27374b,#090e16);
 position:relative;
 overflow:hidden;
}

#fo-dna .scene:after {
 content:'▥ ▥ ▥ ▥ ▥';
 position:absolute;
 right:8px;
 top:18px;
 font-size:37px;
 opacity:.17;
 transform:skew(-8deg);
}

#fo-dna .scene span {
 position:relative;
 z-index:1;
 font-weight:900;
 letter-spacing:1px;
 text-shadow:0 2px 7px #000;
}
`;

document.head.appendChild(css);

function selected(){
 return localStorage.getItem('frontoffice_theme_v1')||'CIN';
}

function add(){
 const app=document.getElementById('app');
 if(!app)return;

 const existing=document.getElementById('fo-dna');
 const code=selected();
 const p=profiles[code]||profiles.CIN;

 const onOffice=!!document.querySelector('#fo-team');
 const inOffice=!!document.querySelector('#app #sim');

 if(!onOffice&&!inOffice){
  existing?.remove();
  return;
 }

 const html=`
 <div class="scene">
  <span>EXECUTIVE SUITE · ${code}</span>
 </div>

 <div class="eyebrow">
  FRANCHISE IDENTITY / ${code}
 </div>

 <h2>${p[0]}</h2>

 <div class="motto">${p[1]}</div>

 <div class="facts">
  <div class="fact">
   <small>HOME STADIUM</small>
   <b>${p[2]}</b>
  </div>

  <div class="fact">
   <small>OFFICE VIEW</small>
   <b>${p[3]}</b>
  </div>

  <div class="fact">
   <small>DIVISION RIVAL</small>
   <b>${profiles[p[4]]?.[0]||p[4]}</b>
  </div>

  <div class="fact">
   <small>SECOND RIVAL</small>
   <b>${profiles[p[5]]?.[0]||p[5]}</b>
  </div>
 </div>

 <div class="note">
  ${code==='CIN'
   ?'Active GM career: Cincinnati.'
   :'Headquarters preview only. Your active GM career is still Cincinnati.'}

  Franchise culture is presentation data;
  ratings and owner personalities will be
  modeled separately.
 </div>
 `;

 let panel=existing;

 if(!panel){
  panel=document.createElement('section');
  panel.id='fo-dna';
  app.prepend(panel);
 }

 if(
  panel.dataset.code!==code||
  panel.dataset.mode!==(onOffice?'preview':'career')
 ){
  panel.innerHTML=html;
  panel.dataset.code=code;
  panel.dataset.mode=onOffice?'preview':'career';
 }
}

let pending=false;

const observer=new MutationObserver(()=>{
 if(pending)return;

 pending=true;

 requestAnimationFrame(()=>{
  pending=false;
  add();
 });
});

observer.observe(
 document.getElementById('app'),
 {childList:true,subtree:false}
);

document.addEventListener('change',e=>{
 if(e.target?.id==='fo-team'){
  setTimeout(add,0);
 }
});

add();

})();
