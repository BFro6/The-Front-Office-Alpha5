
/*
 THE FRONT OFFICE — ALPHA 6.2
 TRADE WAR ROOM
 Load after the Alpha 6.1 inline script.
*/
(()=>{
'use strict';

const KEY='frontoffice_career61';

const TEAMS=[
 ['ARI','Cardinals'],
 ['ATL','Falcons'],
 ['BAL','Ravens'],
 ['BUF','Bills'],
 ['CAR','Panthers'],
 ['CHI','Bears'],
 ['CIN','Bengals'],
 ['CLE','Browns'],
 ['DAL','Cowboys'],
 ['DEN','Broncos'],
 ['DET','Lions'],
 ['GB','Packers'],
 ['HOU','Texans'],
 ['IND','Colts'],
 ['JAX','Jaguars'],
 ['KC','Chiefs'],
 ['LV','Raiders'],
 ['LAC','Chargers'],
 ['LAR','Rams'],
 ['MIA','Dolphins'],
 ['MIN','Vikings'],
 ['NE','Patriots'],
 ['NO','Saints'],
 ['NYG','Giants'],
 ['NYJ','Jets'],
 ['PHI','Eagles'],
 ['PIT','Steelers'],
 ['SF','49ers'],
 ['SEA','Seahawks'],
 ['TB','Buccaneers'],
 ['TEN','Titans'],
 ['WAS','Commanders']
];

let modal;
let selectedPlayer=0;
let partner='NE';
let sendPick='';
let receivePick='';
let receivePlayer='';
let counter=null;

const $=s=>document.querySelector(s);

const esc=s=>String(s).replace(
 /[&<>"']/g,
 c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
 }[c])
);

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

function makePlayers(id){
 const seed=TEAMS.findIndex(t=>t[0]===id);

 return [
  ['Veteran Quarterback','QB',86,30],
  ['Starting Cornerback','CB',83,13],
  ['Starting Guard','G',79,8],
  ['Young Edge Rusher','EDGE',81,12],
  ['Rotational Receiver','WR',75,5]
 ].map((p,i)=>({
  id:id+'-asset-'+i,
  name:id+' '+p[0],
  pos:p[1],
  ovr:p[2]+(seed%5)-2,
  salary:p[3],
  years:2,
  morale:72,
  injury:0
 }));
}

function init(s){
 if(!s.tradeAssets){
  s.tradeAssets={};
 }

 if(!s.tradeLog){
  s.tradeLog=[];
 }

 for(const [id] of TEAMS){
  if(!s.tradeAssets[id]){
   s.tradeAssets[id]={
    picks:[1,2,3,4,5,6,7].map(
     round=>({
      year:s.year+1,
      round
     })
    ),
    players:id===s.team
     ?[]
     :makePlayers(id)
   };
  }
 }
}

const pickKey=p=>p.year+'-'+p.round;

function value(p){
 return Math.max(
  1,
  (p.ovr-65)*2.4+
  (p.pos==='QB'?18:0)+
  (p.years>1?4:0)-
  p.salary*.35
 );
}

function pickValue(p){
 return [0,65,38,24,15,9,6,4][p.round];
}

function capRoom(s){
 return 255-s.deadCap-
  s.roster.reduce(
   (a,p)=>a+p.salary,
   0
  );
}

function close(){
 if(modal){
  modal.remove();
  modal=null;
 }
}

function open(i){
 const s=load();

 if(
  !s?.employed||
  !s.roster?.[i]
 ){
  return;
 }

 init(s);
 save(s);

 selectedPlayer=i;

 if(partner===s.team){
  partner='NE';
 }

 sendPick='';
 receivePick='';
 receivePlayer='';
 counter=null;

 draw();
}

function options(
 arr,
 selected,
 placeholder,
 format
){
 return `<option value="">
 ${placeholder}
 </option>`+
 arr.map(x=>{
  const item=format(x);

  return `<option
   value="${esc(item.key)}"
   ${item.key===selected?'selected':''}>
   ${esc(item.label)}
  </option>`;
 }).join('');
}

function draw(msg=''){
 const s=load();

 if(!s?.roster?.[selectedPlayer]){
  close();
  return;
 }

 init(s);

 const player=s.roster[selectedPlayer];
 const target=s.tradeAssets[partner];
 const mine=s.tradeAssets[s.team];

 const theirs=target.players.find(
  p=>p.id===receivePlayer
 );

 const sp=mine.picks.find(
  p=>pickKey(p)===sendPick
 );

 const rp=target.picks.find(
  p=>pickKey(p)===receivePick
 );

 const outgoing=value(player)+
  (sp?pickValue(sp):0);

 const incoming=
  (theirs?value(theirs):0)+
  (rp?pickValue(rp):0);

 const ratio=incoming
  ?outgoing/incoming
  :0;

 const css=`
 <style id="warroom-style">
 #warroom{
  position:fixed;
  inset:0;
  z-index:99999;
  background:#050914e8;
  overflow-y:auto;
  padding:16px;
 }
 #warroom .panel{
  max-width:650px;
  margin:12px auto;
  background:#142236;
  color:#f5f7fb;
  border:2px solid #fb4f14;
  border-radius:18px;
  padding:20px;
  box-shadow:0 15px 50px #000b;
 }
 #warroom h2{
  margin:0 0 8px;
 }
 #warroom p{
  line-height:1.45;
 }
 #warroom label{
  display:block;
  margin:14px 0 6px;
  font-weight:700;
 }
 #warroom select{
  display:block;
  width:100%;
  background:#233751;
  color:white;
  border:1px solid #59718d;
  padding:12px;
  border-radius:10px;
 }
 #warroom .split{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin:15px 0;
 }
 #warroom .asset{
  background:#20334a;
  padding:12px;
  border-radius:12px;
  min-width:0;
 }
 #warroom .asset b{
  display:block;
  margin:5px 0;
 }
 #warroom button{
  padding:12px;
  border-radius:9px;
  border:1px solid #678;
  background:#283e57;
  color:white;
  margin:5px 5px 5px 0;
 }
 #warroom .primary{
  background:#fb4f14;
  border-color:#fb4f14;
 }
 #warroom .muted{
  color:#b7c6d8;
  font-size:13px;
 }
 #warroom .feedback{
  padding:12px;
  border-left:4px solid #ffb448;
  background:#2b3040;
  border-radius:7px;
 }
 #warroom .top{
  display:flex;
  justify-content:space-between;
  align-items:center;
 }
 #warroom .top button{
  font-size:18px;
 }
 @media(max-width:480px){
  #warroom .split{
   grid-template-columns:1fr;
  }
 }
 </style>`;

 if(!modal){
  modal=document.createElement('div');
  modal.id='warroom';
  document.body.append(modal);
 }

 modal.innerHTML=css+`
 <div class="panel">

  <div class="top">
   <h2>🤝 Trade War Room</h2>
   <button id="wr-close">
    ✕ Close
   </button>
  </div>

  <p class="muted">
   Alpha 6.2 · Simulated assets and
   AI trade values. No real NFL
   transaction or verified contract
   figures.
  </p>

  ${msg?`
   <p class="feedback">
    ${esc(msg)}
   </p>
  `:''}

  <label>Negotiating with</label>

  <select id="wr-partner">
   ${TEAMS.filter(
    t=>t[0]!==s.team
   ).map(t=>`
    <option value="${t[0]}"
     ${t[0]===partner?'selected':''}>
     ${t[0]} — ${t[1]}
    </option>
   `).join('')}
  </select>

  <div class="split">

   <div class="asset">
    <strong>YOU SEND</strong>

    <b>
     ${esc(player.name)}
     · ${esc(player.pos)}
    </b>

    <span class="muted">
     OVR ${player.ovr}
     · $${player.salary.toFixed(1)}M
    </span>

    <label>
     Additional draft pick
    </label>

    <select id="wr-send">
     ${options(
      mine.picks,
      sendPick,
      'No additional pick',
      p=>({
       key:pickKey(p),
       label:`${p.year} Round ${p.round}`
      })
     )}
    </select>
   </div>

   <div class="asset">
    <strong>YOU RECEIVE</strong>

    <label>Player</label>

    <select id="wr-player">
     ${options(
      target.players,
      receivePlayer,
      'No player',
      p=>({
       key:p.id,
       label:
        `${p.name} · ${p.pos} · OVR ${p.ovr}`
      })
     )}
    </select>

    <label>Draft pick</label>

    <select id="wr-receive">
     ${options(
      target.picks,
      receivePick,
      'No draft pick',
      p=>({
       key:pickKey(p),
       label:
        `${p.year} Round ${p.round}`
      })
     )}
    </select>
   </div>

  </div>

  <p class="muted">
   Estimated trade-value ratio:
   ${incoming
    ?ratio.toFixed(2)
    :'Choose a return'}
   · Cincinnati cap room:
   $${capRoom(s).toFixed(1)}M
  </p>

  <p class="muted">
   Counterparty evaluates positional
   value, salary, and draft capital.
   This is a simplified negotiation model.
  </p>

  <button
   class="primary"
   id="wr-submit"
   ${!incoming?'disabled':''}>
   Submit Trade Offer
  </button>

  <button id="wr-reset">
   Reset Offer
  </button>

  ${counter?`
   <p class="feedback">
    ${esc(counter)}
   </p>
  `:''}

 </div>`;

 $('#wr-close').onclick=close;

 $('#wr-partner').onchange=e=>{
  partner=e.target.value;
  receivePick='';
  receivePlayer='';
  counter=null;
  draw();
 };

 $('#wr-send').onchange=e=>{
  sendPick=e.target.value;
  draw();
 };

 $('#wr-player').onchange=e=>{
  receivePlayer=e.target.value;
  draw();
 };

 $('#wr-receive').onchange=e=>{
  receivePick=e.target.value;
  draw();
 };

 $('#wr-reset').onclick=()=>{
  sendPick='';
  receivePick='';
  receivePlayer='';
  counter=null;
  draw();
 };

 $('#wr-submit').onclick=submit;
}

function submit(){
 const s=load();

 if(
  !s?.employed||
  !s.roster[selectedPlayer]
 ){
  close();
  return;
 }

 init(s);

 const p=s.roster[selectedPlayer];
 const own=s.tradeAssets[s.team];
 const other=s.tradeAssets[partner];

 const sp=own.picks.find(
  x=>pickKey(x)===sendPick
 );

 const rp=other.picks.find(
  x=>pickKey(x)===receivePick
 );

 const incomingPlayer=other.players.find(
  x=>x.id===receivePlayer
 );

 if(!rp&&!incomingPlayer){
  return draw(
   'Choose at least one asset to receive.'
  );
 }

 const sendVal=value(p)+
  (sp?pickValue(sp):0);

 const getVal=
  (rp?pickValue(rp):0)+
  (incomingPlayer?value(incomingPlayer):0);

 const ratio=sendVal/getVal;

 const roomAfter=
  capRoom(s)+
  p.salary-
  (incomingPlayer?.salary||0)-
  p.salary*.15;

 if(roomAfter<0){
  return draw(
   'Trade blocked: acquiring that contract would exceed your simulated cap.'
  );
 }

 const star=incomingPlayer?.ovr>=90;
 const floor=star?1.5:1.0;
 const roll=Math.random();

 const accepted=
  ratio>=floor+.28||
  (
   ratio>=floor&&
   roll<Math.min(
    .9,
    .25+(ratio-floor)*1.6
   )
  );

 if(!accepted){
  p.morale=Math.max(
   0,
   p.morale-2
  );

  counter=ratio<floor
   ?`${partner} wants more value. Add a draft pick, or request less in return.`
   :`${partner} is interested, but wants a stronger offer. Revise and resubmit.`;

  s.tradeLog.unshift({
   year:s.year,
   week:s.week,
   result:'Rejected',
   partner,
   player:p.name
  });

  save(s);

  return draw(
   'Offer rejected. Player morale -2.'
  );
 }

 // Complete the transaction.

 s.roster.splice(selectedPlayer,1);

 s.deadCap=Math.round(
  (s.deadCap+p.salary*.15)*10
 )/10;

 if(incomingPlayer){
  s.roster.push({
   ...incomingPlayer,
   id:s.team+'-traded-'+Date.now()
  });

  other.players=other.players.filter(
   x=>x.id!==incomingPlayer.id
  );
 }

 if(sp){
  own.picks=own.picks.filter(
   x=>pickKey(x)!==sendPick
  );

  other.picks.push(sp);
 }

 if(rp){
  other.picks=other.picks.filter(
   x=>pickKey(x)!==receivePick
  );

  own.picks.push(rp);
 }

 other.players.push({
  ...p,
  id:partner+'-received-'+Date.now()
 });

 const received=[
  incomingPlayer?.name,
  rp?`${rp.year} Round ${rp.round} pick`:null
 ].filter(Boolean).join(' + ');

 const result=
  `TRADE ACCEPTED: ${p.name}`+
  (sp?' + '+sp.year+' R'+sp.round:'')+
  ` to ${partner} for ${received}.`;

 s.tradeLog.unshift({
  year:s.year,
  week:s.week,
  result:'Accepted',
  partner,
  player:p.name,
  received
 });

 if(s.news){
  s.news.unshift(result);
 }

 save(s);
 close();
 location.reload();
}

// Intercept Alpha 6.1's old Trade button
// before its random-trade handler runs.

document.addEventListener(
 'click',
 e=>{
  const b=e.target.closest?.(
   '[data-act="trade"]'
  );

  if(!b)return;

  e.preventDefault();
  e.stopImmediatePropagation();

  open(Number(b.dataset.i));
 },
 true
);

// Display the latest trade history
// on the Roster screen.

const observer=new MutationObserver(()=>{
 const s=load();

 if(
  $('#wr-history')||
  !s?.tradeLog?.length
 ){
  return;
 }

 const rosterHeading=[
  ...document.querySelectorAll('h2')
 ].find(h=>
  h.textContent.includes(
   'Personnel Department'
  )
 );

 if(!rosterHeading)return;

 const el=document.createElement('div');

 el.id='wr-history';
 el.className='notice';

 el.innerHTML=`
  <b>Trade War Room History</b>
  <div style="
   font-size:12px;
   margin-top:6px
  ">
   ${s.tradeLog.slice(0,5).map(
    x=>esc(
     `${x.year} W${x.week}: `+
     `${x.result} · `+
     `${x.player} / ${x.partner}`+
     (x.received
      ?' → '+x.received
      :'')
    )
   ).join('<hr>')}
  </div>
 `;

 rosterHeading.parentNode.append(el);
});

observer.observe(
 document.getElementById('app'),
 {
  childList:true,
  subtree:true
 }
);

})();
