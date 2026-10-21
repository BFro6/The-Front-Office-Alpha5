
/* THE FRONT OFFICE — ALPHA 5.3 EXECUTIVE SUITE */
(()=>{
'use strict';

const profiles={
CIN:['THE JUNGLE','Cincinnati riverfront'],
JAX:['DUUUVAL!','St. Johns River'],
MIA:['FINS UP','South Florida coast'],
BAL:['RAVENS FLOCK','Baltimore harbor'],
PIT:['HERE WE GO','Pittsburgh skyline'],
PHI:['FLY EAGLES FLY','Philadelphia skyline'],
KC:['CHIEFS KINGDOM','Kansas City skyline'],
BUF:['BILLS MAFIA','Buffalo skyline'],
DAL:['AMERICA’S TEAM','Dallas skyline'],
GB:['GO PACK GO','Green Bay'],
SF:['FAITHFUL','Bay Area'],
SEA:['THE 12S','Seattle waterfront'],
DET:['ONE PRIDE','Detroit skyline']
};

const css=document.createElement('style');
css.textContent=`
#suite53{
 border:1px solid var(--team-primary,#fb4f14);
 border-radius:17px;
 overflow:hidden;
 margin:12px 0 20px;
 background:#101827;
 box-shadow:0 16px 40px #0007;
}
#suite53 .view{
 height:250px;
 position:relative;
 overflow:hidden;
 background:
 radial-gradient(ellipse at 76% 20%,
 var(--team-primary,#fb4f14),transparent 60%),
 linear-gradient(155deg,#203044,#0a111e 68%);
}
#suite53 .window{
 position:absolute;
 inset:10px 13px 40px;
 border:5px solid #354559;
 border-bottom:0;
 border-radius:10px 10px 0 0;
 background:linear-gradient(180deg,#253b53a8,#101b29bb);
 overflow:hidden;
}
#suite53 .window:before{
 content:'';
 position:absolute;
 left:49%;
 top:0;
 bottom:0;
 width:8px;
 background:#344356;
}
#suite53 .city{
 position:absolute;
 left:0;
 right:0;
 bottom:0;
 height:75px;
 background:linear-gradient(to top,#0a1420,#0e2132);
 clip-path:polygon(
 0 55%,5% 55%,5% 20%,11% 20%,
 11% 44%,17% 44%,17% 0,24% 0,
 24% 42%,31% 42%,31% 14%,37% 14%,
 37% 56%,45% 56%,45% 26%,52% 26%,
 52% 60%,60% 60%,60% 8%,68% 8%,
 68% 49%,75% 49%,75% 28%,83% 28%,
 83% 58%,91% 58%,91% 37%,100% 37%,
 100% 100%,0 100%);
}
#suite53 .desk{
 position:absolute;
 bottom:10px;
 left:7%;
 width:86%;
 height:49px;
 background:linear-gradient(#61452f,#281c19);
 border-top:8px solid #91613a;
 border-radius:5px 5px 12px 12px;
 box-shadow:0 15px 18px #0008;
}
#suite53 .screen{
 position:absolute;
 bottom:61px;
 left:41%;
 width:23%;
 height:57px;
 background:#070d15;
 border:5px solid #5d6c7d;
 border-radius:5px;
 display:grid;
 place-items:center;
 color:var(--team-primary,#fb4f14);
 font-weight:900;
 font-size:15px;
}
#suite53 .lamp{
 position:absolute;
 bottom:60px;
 right:17%;
 font-size:34px;
}
#suite53 .file{
 position:absolute;
 bottom:62px;
 left:20%;
 font-size:30px;
}
#suite53 .office-caption{
 position:absolute;
 top:20px;
 left:25px;
 right:25px;
 text-shadow:0 2px 6px #000;
 font-weight:900;
 letter-spacing:1px;
 font-size:13px;
}
#suite53 .info{padding:17px}
#suite53 h2{
 margin:0 0 5px;
 font-size:22px;
}
#suite53 .sub{
 color:#b5c3d2;
 font-size:12px;
 margin:0 0 15px;
}
#suite53 .destinations{
 display:grid;
 grid-template-columns:repeat(2,minmax(0,1fr));
 gap:9px;
}
#suite53 .destination{
 background:#223147;
 color:#fff;
 border:1px solid #40516a;
 border-radius:12px;
 padding:15px 10px;
 text-align:left;
 font-size:13px;
 min-height:82px;
 line-height:1.4;
}
#suite53 .destination b{
 display:block;
 font-size:14px;
 margin-bottom:5px;
}
#suite53 .destination span{
 color:#b9c7d5;
 font-size:11px;
 font-weight:400;
}
#suite53 .destination:active{
 background:var(--team-primary,#fb4f14);
}
#suite53 .notice{
 margin-top:12px;
 padding:11px;
 background:#19273a;
 border-radius:9px;
 font-size:12px;
 color:#d6e1ec;
}
`;
document.head.appendChild(css);

function read(){
 try{
  return JSON.parse(
   localStorage.getItem('frontoffice_alpha5_v1')
  );
 }catch(e){
  return null;
 }
}

function team(){
 return localStorage.getItem('frontoffice_theme_v1')
 ||'CIN';
}

function activeOffice(){
 const app=document.getElementById('app');
 return app&&!!app.querySelector('#sim');
}

function insert(){
 const app=document.getElementById('app');
 if(!app)return;

 const old=document.getElementById('suite53');

 if(!activeOffice()){
  old?.remove();
  return;
 }

 const code=team();
 const p=profiles[code]||
 ['FRANCHISE HEADQUARTERS','Home city'];

 if(old?.dataset.team===code)return;

 const saved=read();
 const cin=saved?.clubs?.find(t=>t.id==='CIN');

 const el=old||document.createElement('section');
 el.id='suite53';
 el.dataset.team=code;

 el.innerHTML=`
 <div class="view">
  <div class="window">
   <div class="city"></div>
  </div>
  <div class="office-caption">
   ${p[0]} · EXECUTIVE SUITE
  </div>
  <div class="file">📁</div>
  <div class="screen">${code}</div>
  <div class="lamp">💡</div>
  <div class="desk"></div>
 </div>

 <div class="info">
  <h2>Welcome to the Front Office</h2>
  <p class="sub">
   ${p[1]} · ${code} headquarters preview
  </p>

  <div class="destinations">
   <button class="destination" data-go="personnel">
    <b>📋 Personnel</b>
    <span>Review your GM command center</span>
   </button>

   <button class="destination" data-go="contracts">
    <b>💼 Contracts</b>
    <span>Cap and contract intelligence</span>
   </button>

   <button class="destination" data-go="owner">
    <b>🏛️ Owner's Office</b>
    <span>Confidence and expectations</span>
   </button>

   <button class="destination" data-go="league">
    <b>🌎 League Intel</b>
    <span>All 32 franchises</span>
   </button>
  </div>

  <div class="notice" id="suite53notice">
   ${code==='CIN'
    ?'Active career: Cincinnati'
    :'Preview only — active career remains Cincinnati'}.
   ${cin?`Bengals record: ${cin.w}-${cin.l}-${cin.t}.`:''}
  </div>
 </div>`;

 if(!old)app.prepend(el);

 el.querySelectorAll('[data-go]').forEach(b=>{
  b.onclick=()=>{
   const dest=b.dataset.go;

   if(dest==='contracts'){
    document.getElementById('roster-button')?.click();
    return;
   }

   if(dest==='league'){
    [...document.querySelectorAll('#nav button')]
    .find(x=>x.textContent.trim()==='League')
    ?.click();
    return;
   }

   const note=document.getElementById('suite53notice');

   if(note){
    note.textContent=dest==='owner'
    ?`Owner confidence: ${saved?.confidence??'—'}%.
      Owner meetings and demands are coming
      in a future update.`
    :'Your GM command center is below.
      Player-level personnel decisions
      are coming in a future update.';
   }
  };
 });
}

let queued=false;

const observer=new MutationObserver(()=>{
 if(queued)return;
 queued=true;

 requestAnimationFrame(()=>{
  queued=false;
  insert();
 });
});

observer.observe(
 document.getElementById('app'),
 {childList:true}
);

document.addEventListener('change',e=>{
 if(e.target?.id==='fo-team'){
  setTimeout(insert,0);
 }
});

insert();
})();
