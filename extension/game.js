// ---------- utilities ----------
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
 set(k,v){try{localStorage.setItem(k,JSON.stringify(v));if(SYNC_KEYS.includes(k))queueSync();else if(ROSTER_KEYS.includes(k))queueRoster();return true}catch(e){return false}},
 del(k){try{localStorage.removeItem(k);if(SYNC_KEYS.includes(k))queueSync();else if(ROSTER_KEYS.includes(k))queueRoster()}catch(e){}}};
const SYNC_KEYS=['lr_run','lr_best','lr_settings'];
const ROSTER_KEYS=['lr_species','lr_moves','lr_overrides','lr_rosteropts'];
let ACC=null;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),1800)}

// ---------- types ----------
const TYPES=['Science','Art','War','Politics','Music','Sport','Mystic','Tech'];
const TCOL={Normal:'#8b8778',Science:'#2f8fe0',Art:'#e0528f',War:'#c9372c',Politics:'#7a5cf0',Music:'#e8952a',Sport:'#2ea85a',Mystic:'#9b45c4',Tech:'#1fb0a6'};
const STRONG={Science:['Mystic','Tech'],Art:['Politics','Science'],War:['Art','Sport'],Politics:['War','Science'],
 Music:['Politics','Mystic'],Sport:['Music','Tech'],Mystic:['War','Sport'],Tech:['Art','Music']};
function eff(a,defs){let m=1;for(const d of defs){if(STRONG[a]&&STRONG[a].includes(d))m*=2;else if(STRONG[d]&&STRONG[d].includes(a))m*=.5}return m}
const TN={Normal:'Normal',Science:'Science',Art:'Art',War:'Guerre',Politics:'Politique',Music:'Musique',Sport:'Sport',Mystic:'Mystique',Tech:'Tech'};
const tn=t=>TN[t]||t;
const tb=t=>`<span class="tb" style="background:${TCOL[t]||'#777'}">${esc(tn(t))}</span>`;

// ---------- moves ----------
const FX={'':'Aucun effet',heal:'Soigne 50 % des PV',drain:'Récupère la moitié des dégâts',recoil:'Le lanceur subit 1/4 de recul',
 atkup:'Augmente son Attaque',defup:'Augmente sa Défense',spdup:'Augmente sa Vitesse',atkdown:'Baisse l’Attaque adverse',defdown:'Baisse la Défense adverse',spddown:'Baisse la Vitesse adverse'};
const STATN={atk:'Attaque',def:'Défense',spd:'Vitesse'};
const MOVES={};
function addMove(id,name,type,pow,acc,fx){MOVES[id]={id,name,type,pow,acc,fx:fx||''}}
addMove('n_shove','Bousculade','Normal',40,100);
addMove('n_rant','Coup de Gueule','Normal',90,85);
addMove('n_heckle','Chahut','Normal',0,100,'defdown');
addMove('n_nap','Sieste','Normal',0,100,'heal');
addMove('n_focus','Concentration','Normal',0,100,'atkup');
const MOVESET={
 Science:[['Équation',45,100],['Explosion de Labo',80,90],['Rayon Relativité',115,85,'recoil'],['Hypothèse',0,100,'atkup']],
 Art:[['Coup de Pinceau',45,100],['Chef-d’œuvre',85,95],['Magnum Opus',110,80],['Inspiration',0,100,'heal']],
 War:[['Charge',50,95],['Salve de Canons',85,90],['Siège',115,75],['Cri de Guerre',0,100,'atkup']],
 Politics:[['Discours',45,100],['Veto',70,100,'defdown'],['Décret',100,85],['Propagande',0,100,'atkdown']],
 Music:[['Mélodie',45,100],['Symphonie',85,95],['Crescendo',110,80],['Berceuse',0,90,'spddown']],
 Sport:[['Sprint',45,100,'spdup'],['Smash',85,90],['Marathon',105,85],['Échauffement',0,100,'spdup']],
 Mystic:[['Maléfice',45,100],['Séance',75,95,'drain'],['Prophétie',105,80],['Disparition',0,100,'defup']],
 Tech:[['Étincelle',45,100],['Court-Circuit',85,90],['Rayon de la Mort',115,75],['Mise à Jour',0,100,'defup']]};
for(const t in MOVESET)MOVESET[t].forEach((m,i)=>addMove(t+'_'+i,m[0],t,m[1],m[2],m[3]));
let customMoves=LS.get('lr_moves',[]);customMoves.forEach(m=>MOVES[m.id]=m);
const LEARN_AT=[1,1,7,15,25,38];
function genMoves(types){const[t1,t2]=types;return[t1+'_0','n_shove',t1+'_3',t1+'_1',t2?t2+'_1':'n_rant',t1+'_2']}

// ---------- roster ----------
const ROSTER=[
['einstein','Albert Einstein','🧠',['Science'],60,60,55,70],
['tesla','Nikola Tesla','⚡',['Tech','Science'],55,80,50,75],
['davinci','Léonard de Vinci','🎨',['Art','Science'],65,65,65,65],
['cleopatra','Cléopâtre','👑',['Politics','Mystic'],60,70,55,80],
['napoleon','Napoléon','🎖️',['War','Politics'],65,85,60,60],
['mozart','Wolfgang Amadeus Mozart','🎹',['Music'],55,75,45,85],
['beethoven','Ludwig van Beethoven','🎼',['Music','War'],70,80,60,50],
['shakespeare','William Shakespeare','🪶',['Art'],60,70,55,70],
['joan','Jeanne d’Arc','⚔️',['War','Mystic'],70,75,70,55],
['genghis','Gengis Khan','🏹',['War','Sport'],75,90,60,70],
['curie','Marie Curie','☢️',['Science','Mystic'],60,80,55,65],
['suntzu','Sun Tzu','📜',['War'],65,65,80,60],
['archimedes','Archimède','🛁',['Science','Tech'],60,60,75,50],
['houdini','Harry Houdini','🪄',['Mystic','Sport'],55,60,55,95],
['caesar','Jules César','🏛️',['Politics','War'],70,75,65,60],
['newton','Isaac Newton','🍎',['Science'],65,70,65,60],
['frida','Frida Kahlo','🌺',['Art','Mystic'],60,75,60,65],
['vangogh','Vincent van Gogh','🌻',['Art'],55,85,45,70],
['socrates','Socrate','🦉',['Politics'],70,55,80,45],
['edison','Thomas Edison','💡',['Tech'],65,70,60,60],
['owens','Jesse Owens','🏃',['Sport'],55,70,50,100],
['lovelace','Ada Lovelace','💻',['Tech','Science'],55,80,55,70],
['hercules','Hercule','💪',['Sport','Mystic'],90,95,80,50],
['rasputin','Rasputin','🔮',['Mystic','Politics'],80,70,70,45],
['bach','Jean-Sébastien Bach','🎻',['Music'],65,65,70,55],
['ruth','Babe Ruth','⚾',['Sport'],75,85,60,55],
['earhart','Amelia Earhart','✈️',['Tech','Sport'],55,65,50,95],
['darwin','Charles Darwin','🐢',['Science'],70,55,75,50],
['lincoln','Abraham Lincoln','🎩',['Politics'],75,65,70,50],
['chaplin','Charlie Chaplin','🎬',['Art','Sport'],55,60,55,85]];
const SPECIES={},DEFAULTS=[],ORIG={};
ROSTER.forEach(r=>{const s={id:r[0],name:r[1],emoji:r[2],types:r[3],base:{hp:r[4],atk:r[5],def:r[6],spd:r[7]},moves:genMoves(r[3])};SPECIES[s.id]=s;ORIG[s.id]=s;DEFAULTS.push(s)});
let overrides=LS.get('lr_overrides',{});
function applyOv(id){const s=overrides[id]?Object.assign({},overrides[id],{id}):ORIG[id];SPECIES[id]=s;DEFAULTS[DEFAULTS.findIndex(x=>x.id===id)]=s}
Object.keys(overrides).forEach(id=>{if(ORIG[id])applyOv(id);else delete overrides[id]});
let customs=LS.get('lr_species',[]);customs.forEach(s=>SPECIES[s.id]=s);
let settings=Object.assign({useDefaults:true,fast:false},LS.get('lr_settings',{}));
let rosterOpts=Object.assign({useDefaults:true},LS.get('lr_rosteropts',{}));
const SPEED=()=>settings.fast?.45:1;
const bst=s=>s.base.hp+s.base.atk+s.base.def+s.base.spd;
const costOf=s=>clamp(Math.round((bst(s)-180)/30),1,6);
function allSpecies(){const l=(rosterOpts.useDefaults?DEFAULTS:[]).concat(customs);return l.length?l:DEFAULTS}
// ---------- pixel sprites ----------
const PX=32,PXC=new Map();
function finishPx(src){const c=document.createElement('canvas');c.width=c.height=PX;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(src,2,2,PX-4,PX-4);
 const d=x.getImageData(0,0,PX,PX),p=d.data,op=new Uint8Array(PX*PX);
 for(let i=0;i<PX*PX;i++){if(p[i*4+3]<100){p[i*4+3]=0;continue}op[i]=1;p[i*4+3]=255;for(let k=0;k<3;k++)p[i*4+k]=Math.min(255,Math.round(p[i*4+k]/36)*36)}
 for(let y=0;y<PX;y++)for(let x0=0;x0<PX;x0++){const i=y*PX+x0;if(op[i])continue;
  if((x0>0&&op[i-1])||(x0<PX-1&&op[i+1])||(y>0&&op[i-PX])||(y<PX-1&&op[i+PX])){p[i*4]=26;p[i*4+1]=20;p[i*4+2]=38;p[i*4+3]=255}}
 x.putImageData(d,0,0);return c.toDataURL('image/png')}
function emojiPx(e){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.font='96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.fillStyle='#f3efe6';x.textAlign='center';x.textBaseline='middle';x.fillText(e,64,68,124);return finishPx(c)}
// photos stay smooth inside; only the round frame is made of chunky pixels
function imgPx(url){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const S=192,B=S/PX,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),s=Math.min(im.width,im.height);
 x.imageSmoothingQuality='high';x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,S,S);
 const inside=(cx,cy)=>cx>=0&&cy>=0&&cx<PX&&cy<PX&&Math.hypot(cx+.5-PX/2,cy+.5-PX/2)<PX/2-1.6;
 const m=document.createElement('canvas');m.width=m.height=S;const mx=m.getContext('2d');mx.fillStyle='#000';
 for(let cy=0;cy<PX;cy++)for(let cx=0;cx<PX;cx++)if(inside(cx,cy))mx.fillRect(cx*B,cy*B,B,B);
 x.globalCompositeOperation='destination-in';x.drawImage(m,0,0);x.globalCompositeOperation='source-over';
 for(let cy=0;cy<PX;cy++)for(let cx=0;cx<PX;cx++){if(inside(cx,cy))continue;
  if(inside(cx-1,cy)||inside(cx+1,cy)||inside(cx,cy-1)||inside(cx,cy+1)){x.fillStyle='#1a1426';x.fillRect(cx*B,cy*B,B,B)}}
 for(let cy=0;cy<PX;cy++)for(let cx=0;cx<PX;cx++){if(!inside(cx,cy))continue;
  if(!inside(cx-1,cy)||!inside(cx,cy-1)){x.fillStyle='#ffffff55';x.fillRect(cx*B,cy*B,B,B)}else if(!inside(cx+1,cy)||!inside(cx,cy+1)){x.fillStyle='#00000040';x.fillRect(cx*B,cy*B,B,B)}}
 const w=c.toDataURL('image/webp',.85);res(w.startsWith('data:image/webp')?w:c.toDataURL('image/png'))};im.onerror=rej;im.src=url})}
function pix(s){if(s&&s.img)return s.img;const e=(s&&s.emoji)||'⭐';if(!PXC.has(e))PXC.set(e,emojiPx(e));return PXC.get(e)}
const av=s=>`<img class="${s&&s.img&&s.pv===2?'ph':'px'}" src="${pix(s||{emoji:'❔'})}" alt="">`;

// ---------- fighters ----------
const need=l=>Math.round(8*l+1.1*l*l);
const sm=s=>s>=0?(2+s)/2:2/(2-s);
function calc(f){const b=SPECIES[f.sid].base,l=f.lvl,v=f.vit;const s=k=>Math.floor((Math.floor(2*b[k]*l/100)+5)*(1+.1*(v[k]||0)));
 f.maxhp=Math.floor(2*b.hp*l/100)+l+10;if(f.boss)f.maxhp=Math.floor(f.maxhp*2.5);f.atk=s('atk');f.def=s('def');f.spd=s('spd')}
function makeFighter(sid,lvl){const sp=SPECIES[sid];const f={uid:Math.random().toString(36).slice(2),sid,lvl,exp:0,vit:{atk:0,def:0,spd:0},st:{atk:0,def:0,spd:0},moves:[]};
 sp.moves.forEach((m,i)=>{if(m&&MOVES[m]&&LEARN_AT[i]<=lvl&&!f.moves.includes(m))f.moves.push(m)});
 while(f.moves.length>4)f.moves.shift();if(!f.moves.length)f.moves=['n_shove'];
 calc(f);f.hp=f.maxhp;return f}
const nmOf=f=>SPECIES[f.sid]?SPECIES[f.sid].name:'???';
const N=f=>f===G.enemy?(f.boss?'Boss '+nmOf(f):nmOf(f)+' sauvage'):nmOf(f);
const spd=f=>f.spd*sm(f.st.spd);
const resetSt=f=>{f.st={atk:0,def:0,spd:0}};

// ---------- game state ----------
let G=null,busy=false;
const ITEMS={contract:{name:'Contrat',icon:'📝',desc:'Tente de recruter l’adversaire. Marche mieux s’il est affaibli.'},
 potion:{name:'Potion',icon:'🧃',desc:'Rend 30 PV',heal:30},super:{name:'Super Potion',icon:'🧪',desc:'Rend 80 PV',heal:80},
 full:{name:'Guérison',icon:'💖',desc:'Soigne complètement un combattant',heal:99999},revive:{name:'Rappel',icon:'✨',desc:'Ranime un combattant K.O. avec 50 % des PV',revive:true}};
const BIOMES=[{n:'Forum Antique',t:'Politics',sky:'#e8c98a',gr:'#a8834e'},{n:'Atelier Renaissance',t:'Art',sky:'#f3b4a8',gr:'#8e5b4a'},
 {n:'Champ de Bataille',t:'War',sky:'#c97b5a',gr:'#5e4a30'},{n:'Laboratoire',t:'Science',sky:'#a8d8f0',gr:'#6f8a99'},
 {n:'Salle de Concert',t:'Music',sky:'#6b3f6e',gr:'#7a2e2e'},{n:'Stade Olympique',t:'Sport',sky:'#8fd0ff',gr:'#3f8a3a'},
 {n:'Bibliothèque Hantée',t:'Mystic',sky:'#3e3460',gr:'#2a2340'},{n:'Silicon Valley',t:'Tech',sky:'#1c2b44',gr:'#2e4d5e'}];
const curBiome=()=>BIOMES[G.biomes[Math.floor((G.wave-1)/10)%BIOMES.length]];
function save(){if(G)LS.set('lr_run',G)}

// ---------- screens ----------
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$('#'+id).classList.remove('hidden');window.scrollTo(0,0)}
function title(){show('s-title');$('#tEditor').classList.toggle('hidden',!isAdmin());$('#acct').innerHTML=ACC?`👤 ${esc(ACC.name||ACC.email)} <button id="acctBtn">Mon compte</button>`:'';if(ACC)$('#acctBtn').onclick=accountMenu;$('#s-title .parade').innerHTML=['einstein','joan','mozart','cleopatra','tesla'].map(id=>av(SPECIES[id])).join('');const best=LS.get('lr_best',0);$('#best').textContent=best?`Meilleure partie : vague ${best}`:'';
 $('#tContinue').classList.toggle('hidden',!LS.get('lr_run',null))}

// ---------- modal ----------
function choose(ttl,opts,o={}){return new Promise(res=>{const box=$('#modalBox');
 box.innerHTML=`<h3>${ttl}</h3>${o.body||''}<div class="opts ${o.cols?'c'+o.cols:''}"></div>`;
 const wrap=box.querySelector('.opts');const close=v=>{$('#modal').classList.add('hidden');res(v)};
 opts.forEach(op=>{const b=document.createElement('button');b.className='opt '+(op.cls||'');b.innerHTML=op.html||esc(op.label);if(op.disabled)b.disabled=true;b.onclick=()=>close(op.value);wrap.appendChild(b)});
 if(o.cancel){const c=document.createElement('button');c.className='opt cancel';c.textContent=typeof o.cancel==='string'?o.cancel:'Retour';c.onclick=()=>close(null);box.appendChild(c)}
 $('#modal').classList.remove('hidden')})}
function memberHTML(f,extra=''){const p=f.hp/f.maxhp;const sp=SPECIES[f.sid];
 return `<div class="mem"><div class="av">${av(sp)}</div><div class="bx"><div>${esc(sp.name)} <small style="display:inline">N.${f.lvl}</small> ${extra}</div>
 <div>${sp.types.map(tb).join('')}</div><div class="bar"><i style="width:${p*100}%;background:${hpCol(p)}"></i></div><small>${f.hp>0?f.hp+' / '+f.maxhp+' PV':'K.O.'}</small></div></div>`}
const hpCol=p=>p>.5?'var(--good)':p>.2?'var(--mid)':'var(--bad)';

// ---------- starter select ----------
let picks=[];const BUDGET=10;
function starterScreen(){picks=[];show('s-starter');renderStarters()}
function renderStarters(){const used=picks.reduce((a,id)=>a+costOf(SPECIES[id]),0);
 $('#stBudget').innerHTML=`Points ${used}/${BUDGET}<span class="pips">${Array.from({length:BUDGET},(_,i)=>`<span class="pip ${i<used?'on':''}"></span>`).join('')}</span>`;
 $('#stChosen').innerHTML=picks.length?picks.map(id=>`<div class="mini"><span class="av">${av(SPECIES[id])}</span>${esc(SPECIES[id].name)}</div>`).join(''):'<span class="empty">Touche les combattants ci-dessous pour les ajouter à ton équipe (6 max). Les plus forts coûtent plus de points.</span>';
 $('#stGo').disabled=!picks.length;
 const list=[...customs,...(rosterOpts.useDefaults||!customs.length?DEFAULTS:[])];
 $('#stGrid').innerHTML=list.map(s=>{const sel=picks.includes(s.id),c=costOf(s),can=sel||(used+c<=BUDGET&&picks.length<6);
  return `<div class="card ${sel?'sel':''} ${can?'':'no'}" data-id="${esc(s.id)}">${customs.includes(s)?'<span class="star">★</span>':''}<span class="cost">${c}</span><div class="av">${av(s)}</div><div class="nm">${esc(s.name)}</div><div>${s.types.map(tb).join('')}</div></div>`}).join('');
 $('#stGrid').querySelectorAll('.card').forEach(el=>el.onclick=()=>{const id=el.dataset.id;const i=picks.indexOf(id);
  if(i>=0)picks.splice(i,1);else{const c=costOf(SPECIES[id]);if(used+c>BUDGET||picks.length>=6)return toast('Pas assez de points');picks.push(id)}renderStarters()})}
function startRun(){const order=[...BIOMES.keys()].sort(()=>Math.random()-.5);
 G={party:picks.map(id=>makeFighter(id,5)),active:0,wave:1,bag:{contract:5,potion:3,super:0,full:0,revive:0},biomes:order,enemy:null};
 show('s-battle');nextWave()}

// ---------- battle rendering ----------
function infoHTML(f,isP){const sp=SPECIES[f.sid];
 return `<div class="row"><span class="n">${f.boss?'<span class="crown">♛</span> ':''}${esc(sp.name)}</span><span class="lv">N.${f.lvl}</span></div>
 <div>${sp.types.map(tb).join('')}</div><div class="bar"><i class="hpf"></i></div>${isP?'<div class="hpt"></div><div class="bar exp"><i class="xpf"></i></div>':''}<div class="stg"></div>`}
function renderBattle(enter){const e=G.enemy,p=G.party[G.active];
 $('#eInfo').innerHTML=infoHTML(e,false);$('#pInfo').innerHTML=infoHTML(p,true);
 $('#eSpr').innerHTML=av(SPECIES[e.sid]);$('#pSpr').innerHTML=av(SPECIES[p.sid]);
 $('#eMon').classList.toggle('boss',!!e.boss);
 ['#eSpr','#pSpr'].forEach(s=>{const el=$(s);el.className='spr';if(enter){void el.offsetWidth;el.classList.add('enter')}});
 const b=curBiome();$('#arena').style.background=`linear-gradient(${b.sky},${b.sky} 58%,transparent 58%)`;$('#arena').style.setProperty('--ground',b.gr);
 $('#waveTxt').textContent=`Vague ${G.wave} · ${b.n}`;$('#spdBtn').style.color=settings.fast?'var(--acc)':'';
 upd()}
function setBars(box,f,isP){const p=f.hp/f.maxhp,hf=box.querySelector('.hpf');if(!hf)return;hf.style.width=(p*100)+'%';hf.style.background=hpCol(p);
 if(isP){box.querySelector('.hpt').textContent=`${f.hp} / ${f.maxhp}`;box.querySelector('.xpf').style.width=Math.min(100,f.exp/need(f.lvl)*100)+'%'}
 box.querySelector('.stg').innerHTML=Object.keys(f.st).filter(k=>f.st[k]).map(k=>`<b class="${f.st[k]>0?'u':'d'}">${STATN[k].slice(0,3).toUpperCase()}${f.st[k]>0?'▲':'▼'}${Math.abs(f.st[k])}</b>`).join('')}
function upd(){setBars($('#eInfo'),G.enemy,false);setBars($('#pInfo'),G.party[G.active],true);
 $('#partyBar').innerHTML=G.party.map((f,i)=>{const p=f.hp/f.maxhp;return `<div class="pm ${i===G.active?'act':''} ${f.hp<=0?'ko':''}"><span class="av">${av(SPECIES[f.sid])}</span><div>N.${f.lvl}<div class="bar"><i style="width:${p*100}%;background:${hpCol(p)}"></i></div></div></div>`}).join('')
 +`<span id="bagTag">📝${G.bag.contract} 🧃${G.bag.potion+G.bag.super+G.bag.full} ✨${G.bag.revive}</span>`}
function anim(sel,cls){const el=$(sel);el.classList.remove('hit','lunge-p','lunge-e','wobble','buff','enter');void el.offsetWidth;el.classList.add(cls)}
let msgDone=null;
function say(t,ms=1100){const el=$('#msg');el.textContent=t;el.classList.add('wait');
 return new Promise(r=>{let d=false;const fin=()=>{if(d)return;d=true;msgDone=null;el.classList.remove('wait');r()};msgDone=fin;setTimeout(fin,ms*SPEED())})}
$('#msg').onclick=()=>msgDone&&msgDone();

// ---------- menus ----------
const act=()=>G.party[G.active];
function showMain(){busy=false;$('#msg').textContent=`Que doit faire ${nmOf(act())} ?`;$('#msg').classList.remove('wait');
 const c=$('#cmd');c.innerHTML='';
 [['⚔ ATTAQUE',showMoves],['🎒 SAC',openBag],['👥 ÉQUIPE',()=>openTeam(false)],[`📝 RECRUTER ×${G.bag.contract}`,doRecruit]].forEach(([l,fn])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{if(!busy)fn()};c.appendChild(b)})}
function showMoves(){const c=$('#cmd'),p=act(),e=G.enemy;c.innerHTML='';
 p.moves.forEach((id,i)=>{const m=MOVES[id];if(!m)return;const ef=m.pow?eff(m.type,SPECIES[e.sid].types):1;
  const b=document.createElement('button');b.className='mv';b.style.setProperty('--c',TCOL[m.type]||'#777');
  b.innerHTML=`<b>${esc(m.name)}</b><small>${esc(tn(m.type))} · ${m.pow?'Puiss. '+m.pow:'Statut'} · ${m.acc} %</small><i class="${ef>1?'se':ef<1?'nve':''}">${m.pow?(ef>1?'▲ Super efficace':ef<1?'▼ Peu efficace':''):esc(FX[m.fx]||'')}</i>`;
  b.onclick=()=>doMove(i);c.appendChild(b)});
 const bk=document.createElement('button');bk.className='back';bk.textContent='◀ Retour';bk.onclick=showMain;c.appendChild(bk)}
const lockUI=()=>{busy=true;$('#cmd').innerHTML=''};

// ---------- core battle ----------
function enemyChoose(){const e=G.enemy,p=act();const sc=e.moves.map(id=>{const m=MOVES[id];if(!m)return -1;
 if(!m.pow){if(m.fx==='heal')return e.hp/e.maxhp<.4?120:-1;if(m.fx.endsWith('up'))return e.st[m.fx.slice(0,3)]<2?35:-1;return p.st[m.fx.slice(0,3)]>-2?30:-1}
 return m.pow*eff(m.type,SPECIES[p.sid].types)*(SPECIES[e.sid].types.includes(m.type)?1.5:1)*m.acc/100});
 if(Math.random()<.25)return pick(e.moves.filter(id=>MOVES[id]));let bi=0;sc.forEach((s,i)=>{if(s>sc[bi])bi=i});return e.moves[bi]}
function damage(a,d,m){const e=eff(m.type,SPECIES[d.sid].types);const A=a.atk*sm(a.st.atk),D=d.def*sm(d.st.def);
 let x=((2*a.lvl/5+2)*m.pow*A/D)/50+2;const stab=SPECIES[a.sid].types.includes(m.type)?1.5:1;const crit=Math.random()<1/16;
 x*=stab*e*(crit?1.5:1)*(.85+Math.random()*.15);return{dmg:Math.max(1,Math.floor(x)),e,crit}}
async function useMove(a,d,id,isP){const m=MOVES[id]||MOVES.n_shove;
 await say(`${N(a)} utilise ${m.name} !`,800);anim(isP?'#pSpr':'#eSpr',isP?'lunge-p':'lunge-e');await sleep(250*SPEED());
 if(Math.random()*100>=m.acc)return say(`Mais ça rate !`);
 if(!m.pow){anim(m.fx.endsWith('up')||m.fx==='heal'?(isP?'#pSpr':'#eSpr'):(isP?'#eSpr':'#pSpr'),m.fx.endsWith('up')||m.fx==='heal'?'buff':'hit');return applyFx(m.fx,a,d,0)}
 const r=damage(a,d,m);d.hp=Math.max(0,d.hp-r.dmg);anim(isP?'#eSpr':'#pSpr','hit');upd();await sleep(450*SPEED());
 if(r.crit)await say('Coup critique !',800);
 if(r.e>1)await say('C’est super efficace !',900);else if(r.e<1)await say('Ce n’est pas très efficace…',900);
 if(m.fx){if(m.fx==='drain'||m.fx==='recoil')await applyFx(m.fx,a,d,r.dmg);
  else if(Math.random()<.3&&(m.fx.endsWith('up')||d.hp>0))await applyFx(m.fx,a,d,r.dmg)}}
async function applyFx(fx,a,d,dmg){if(!fx)return;
 if(fx==='heal'){if(a.hp>=a.maxhp)return say(`Les PV de ${N(a)} sont déjà au max !`);a.hp=Math.min(a.maxhp,a.hp+Math.ceil(a.maxhp/2));upd();return say(`${N(a)} récupère des PV !`)}
 if(fx==='drain'){a.hp=Math.min(a.maxhp,a.hp+Math.max(1,Math.floor(dmg/2)));upd();return say(`${N(a)} absorbe de l’énergie !`,900)}
 if(fx==='recoil'){a.hp=Math.max(0,a.hp-Math.max(1,Math.floor(dmg/4)));upd();return say(`${N(a)} subit le contrecoup !`,900)}
 const k=fx.slice(0,3),up=fx.endsWith('up'),t=up?a:d,nv=t.st[k]+(up?1:-1);
 if(nv>6||nv<-6)return say(`${STATN[k]} de ${N(t)} ne peut plus ${up?'monter':'baisser'} !`);
 t.st[k]=nv;upd();return say(`${STATN[k]} de ${N(t)} ${up?'augmente':'baisse'} !`,900)}
async function doMove(i){if(busy)return;lockUI();const p=act(),e=G.enemy,pm=p.moves[i],em=enemyChoose();
 const ps=spd(p),es=spd(e),pf=ps>es||(ps===es&&Math.random()<.5);
 const seq=pf?[[p,e,pm,true],[e,p,em,false]]:[[e,p,em,false],[p,e,pm,true]];
 for(const[a,d,m,isP]of seq){if(a.hp<=0||d.hp<=0)break;await useMove(a,d,m,isP);if(await resolve())return}
 showMain()}
async function enemyTurn(){const e=G.enemy,p=act();if(e.hp>0&&p.hp>0)await useMove(e,p,enemyChoose(),false);if(await resolve())return;showMain()}
async function resolve(){if(G.enemy.hp<=0){await winBattle(false);return true}if(act().hp<=0){await playerFainted();return true}return false}
async function playerFainted(){anim('#pSpr','enter');$('#pSpr').className='spr faint';await say(`${nmOf(act())} est K.O. !`);
 if(!G.party.some(f=>f.hp>0))return gameOver();
 const i=await choose('Qui envoyer au combat ?',G.party.map((f,i)=>({value:i,html:memberHTML(f),disabled:f.hp<=0})));
 G.active=i;resetSt(act());renderBattle(true);$('#eSpr').className='spr';await say(`En avant, ${nmOf(act())} !`,800);showMain()}

// ---------- bag / team / recruit ----------
async function openBag(){const ks=Object.keys(ITEMS).filter(k=>G.bag[k]>0);
 if(!ks.length)return toast('Ton sac est vide');
 const k=await choose('Sac',ks.map(k=>({value:k,html:`${ITEMS[k].icon} ${ITEMS[k].name} ×${G.bag[k]}<small>${ITEMS[k].desc}</small>`})),{cancel:true});
 if(!k)return;if(k==='contract')return doRecruit();
 const it=ITEMS[k];const idx=await choose(`Utiliser ${it.name} sur…`,G.party.map((f,i)=>({value:i,html:memberHTML(f),disabled:it.revive?f.hp>0:(f.hp<=0||f.hp>=f.maxhp)})),{cancel:true});
 if(idx===null)return;lockUI();G.bag[k]--;const f=G.party[idx];
 if(it.revive)f.hp=Math.floor(f.maxhp/2);else f.hp=Math.min(f.maxhp,f.hp+it.heal);upd();
 await say(it.revive?`${nmOf(f)} est de retour !`:`${nmOf(f)} récupère des PV !`);await enemyTurn()}
async function openTeam(){const i=await choose('Équipe — qui faire entrer ?',G.party.map((f,i)=>({value:i,html:memberHTML(f,i===G.active?'<em>(au combat)</em>':''),disabled:i===G.active||f.hp<=0})),{cancel:true});
 if(i===null)return;lockUI();await say(`Reviens, ${nmOf(act())} !`,700);resetSt(act());G.active=i;renderBattle(false);anim('#pSpr','enter');
 await say(`En avant, ${nmOf(act())} !`,700);await enemyTurn()}
async function doRecruit(){if(G.bag.contract<=0)return toast('Plus de Contrats !');lockUI();G.bag.contract--;upd();
 const e=G.enemy,n=nmOf(e);await say(`Tu proposes un Contrat à ${n}…`,900);
 const rate=Math.min(.95,(e.boss?.3:1)*(1-.8*e.hp/e.maxhp)+.1);anim('#eSpr','wobble');await sleep(1300*SPEED());
 if(Math.random()<rate){await say(`✍️ ${n} signe le Contrat !`);if(await addToParty(e))await say(`${n} rejoint ton équipe !`);await winBattle(true)}
 else{await say(`${n} déchire le Contrat !`);await enemyTurn()}}
async function addToParty(e){const f=JSON.parse(JSON.stringify(e));f.uid=Math.random().toString(36).slice(2);delete f.boss;calc(f);f.hp=Math.max(1,Math.ceil(e.hp/e.maxhp*f.maxhp));resetSt(f);
 if(G.party.length<6){G.party.push(f);return true}
 const i=await choose(`Ton équipe est pleine ! Libérer quelqu’un pour faire de la place à ${esc(nmOf(f))} ?`,[...G.party.map((m,i)=>({value:i,html:memberHTML(m),disabled:i===G.active})),{value:-1,html:`Ne pas garder ${esc(nmOf(f))}`}]);
 if(i===-1||i===null)return false;await say(`${nmOf(G.party[i])} quitte l’équipe. Adieu !`,900);G.party[i]=f;return true}

// ---------- progression ----------
async function giveExp(f,amt,loud){if(f.lvl>=100)return;f.exp+=amt;if(loud&&amt){upd();await say(`${nmOf(f)} gagne ${amt} points d’EXP.`,800)}
 while(f.lvl<100&&f.exp>=need(f.lvl)){f.exp-=need(f.lvl);const old=f.maxhp;f.lvl++;calc(f);if(f.hp>0)f.hp+=f.maxhp-old;upd();
  await say(`${nmOf(f)} passe au niveau ${f.lvl} !`,900);const sp=SPECIES[f.sid];
  for(let i=0;i<sp.moves.length;i++)if(LEARN_AT[i]===f.lvl&&sp.moves[i])await learnMove(f,sp.moves[i])}}
async function learnMove(f,id){const m=MOVES[id];if(!m||f.moves.includes(id))return;
 if(f.moves.length<4){f.moves.push(id);return say(`${nmOf(f)} apprend ${m.name} !`)}
 const r=await choose(`${esc(nmOf(f))} veut apprendre ${esc(m.name)} (${esc(tn(m.type))}, ${m.pow?'Puiss. '+m.pow:'Statut'}). Quelle attaque oublier ?`,
  [...f.moves.map((x,i)=>({value:i,html:`${esc(MOVES[x].name)}<small>${esc(tn(MOVES[x].type))} · ${MOVES[x].pow?'Puiss. '+MOVES[x].pow:'Statut'}</small>`})),{value:-1,html:`Ne pas apprendre ${esc(m.name)}`}],{cols:2});
 if(r===-1||r===null)return say(`${nmOf(f)} n’a pas appris ${m.name}.`);const old=MOVES[f.moves[r]].name;f.moves[r]=id;await say(`${nmOf(f)} oublie ${old} et apprend ${m.name} !`)}
async function winBattle(caught){const e=G.enemy;
 if(!caught){$('#eSpr').className='spr faint';await say(`${N(e)} est vaincu !`)}else $('#eSpr').className='spr faint';
 const base=Math.round((e.lvl*e.lvl*.9+e.lvl*10)*(e.boss?2:1));
 for(let i=0;i<G.party.length;i++){const f=G.party[i];if(f.hp<=0)continue;await giveExp(f,i===G.active?base:Math.round(base*.5),i===G.active)}
 if(e.boss){G.party.forEach(f=>f.hp=f.maxhp);upd();await say('👑 Boss vaincu ! Toute ton équipe est soignée.',1300)}
 G.wave++;await rewards();await nextWave()}
const REWARDS=[
 {w:18,ic:'🧃',n:'2× Potion',d:'Rend 30 PV chacune',fn:()=>G.bag.potion+=2},
 {w:12,ic:'🧪',n:'Super Potion',d:'Rend 80 PV',fn:()=>G.bag.super++},
 {w:4,ic:'💖',n:'Guérison',d:'Soigne complètement un combattant',fn:()=>G.bag.full++},
 {w:8,ic:'✨',n:'Rappel',d:'Ranime un combattant K.O.',fn:()=>G.bag.revive++},
 {w:16,ic:'📝',n:'3× Contrat',d:'Recrute plus de combattants',fn:()=>G.bag.contract+=3},
 {w:12,ic:'🍬',n:'Super Bonbon',d:'+1 niveau pour un combattant',tg:1,fn:async f=>{f.exp=Math.max(f.exp,need(f.lvl));await giveExp(f,0,false)}},
 {w:5,ic:'💪',n:'Protéine',d:'+10 % d’Attaque pour toujours',tg:1,fn:f=>{f.vit.atk++;calc(f)}},
 {w:5,ic:'🛡️',n:'Fer',d:'+10 % de Défense pour toujours',tg:1,fn:f=>{f.vit.def++;calc(f)}},
 {w:5,ic:'👟',n:'Carbone',d:'+10 % de Vitesse pour toujours',tg:1,fn:f=>{f.vit.spd++;calc(f)}},
 {w:7,ic:'🏕️',n:'Feu de Camp',d:'Toute l’équipe récupère 50 %, même les K.O.',fn:()=>G.party.forEach(f=>f.hp=Math.min(f.maxhp,f.hp+Math.ceil(f.maxhp/2)))},
 {w:6,ic:'📚',n:'Professeur',d:'Apprend une nouvelle attaque à un combattant',tg:1,fn:tutor}];
async function tutor(f){const types=[...SPECIES[f.sid].types,'Normal'];const pool=Object.values(MOVES).filter(m=>types.includes(m.type)&&!f.moves.includes(m.id)).sort(()=>Math.random()-.5).slice(0,3);
 if(!pool.length)return say('Rien de nouveau à apprendre.');
 const id=await choose(`Quelle attaque apprendre à ${esc(nmOf(f))} ?`,pool.map(m=>({value:m.id,html:`${tb(m.type)} ${esc(m.name)}<small>${m.pow?'Puiss. '+m.pow:'Statut'} · ${m.acc} % · ${esc(FX[m.fx]||'')}</small>`})),{cancel:'Passer'});
 if(id)await learnMove(f,id)}
async function rewards(){const pool=[...REWARDS],out=[];
 while(out.length<3){const tot=pool.reduce((a,r)=>a+r.w,0);let x=Math.random()*tot;const i=pool.findIndex(r=>(x-=r.w)<0);out.push(pool.splice(i,1)[0])}
 const r=await choose(`Vague ${G.wave-1} terminée ! Choisis une récompense`,out.map(r=>({value:r,cls:'rw',html:`<span class="ic">${r.ic}</span><b>${r.n}</b><small>${r.d}</small>`})),{cols:3});
 if(r.tg){const i=await choose(`${r.ic} ${r.n} : choisis un combattant`,G.party.map((f,i)=>({value:i,html:memberHTML(f)})));await r.fn(G.party[i]);if(r.fn!==tutor&&r.ic!=='🍬')await say(`${nmOf(G.party[i])} devient plus fort !`,900)}
 else{r.fn();await say(`Tu obtiens : ${r.n} !`,800)}upd()}
function genEnemy(){const w=G.wave,boss=w%10===0;let pool=allSpecies();
 if(boss){const s=[...pool].sort((a,b)=>bst(b)-bst(a));pool=s.slice(0,Math.max(1,Math.ceil(s.length/2)))}
 const fav=pool.filter(s=>s.types.includes(curBiome().t));const sp=fav.length&&Math.random()<.5?pick(fav):pick(pool);
 const lvl=Math.min(100,Math.max(2,Math.round(2+w*.6+rnd(-1,1)))+(boss?3:0));const e=makeFighter(sp.id,lvl);
 if(boss){e.boss=true;calc(e);e.hp=e.maxhp}return e}
async function nextWave(){if(!G.party.some(f=>f.hp>0))return gameOver();
 const newBiome=G.wave===1||(G.wave-1)%10===0;G.enemy=genEnemy();G.party.forEach(resetSt);
 if(act().hp<=0){renderBattle(false);const i=await choose('Qui mène le prochain combat ?',G.party.map((f,i)=>({value:i,html:memberHTML(f),disabled:f.hp<=0})));G.active=i}
 save();renderBattle(true);busy=true;$('#cmd').innerHTML='';
 if(newBiome)await say(`📍 Tu entres dans : ${curBiome().n}.`,1100);
 await say(G.enemy.boss?`👑 Le BOSS ${nmOf(G.enemy)} bloque le passage !`:`Un ${nmOf(G.enemy)} sauvage apparaît !`);
 showMain()}
async function gameOver(){const w=G.wave;const best=Math.max(LS.get('lr_best',0),w);LS.set('lr_best',best);LS.del('lr_run');
 await say('Toute ton équipe est épuisée…',1400);
 const r=await choose('PARTIE TERMINÉE',[{value:'new',html:'Nouvelle partie'},{value:'title',html:'Retour au menu'}],{body:`<div class="modtxt">Tu as atteint la <b style="color:var(--acc)">vague ${w}</b>. Record : vague ${best}.<br>Équipe finale : ${G.party.map(f=>esc(nmOf(f))+' N.'+f.lvl).join(', ')}</div>`,cols:2});
 G=null;if(r==='new')starterScreen();else title()}
function continueRun(){const g=LS.get('lr_run',null);if(!g)return title();g.party=g.party.filter(f=>SPECIES[f.sid]);
 if(!g.party.length){LS.del('lr_run');toast('Impossible de charger la sauvegarde');return title()}
 G=g;if(G.active>=G.party.length||act().hp<=0)G.active=Math.max(0,G.party.findIndex(f=>f.hp>0));
 if(!G.enemy||!SPECIES[G.enemy.sid])G.enemy=genEnemy();show('s-battle');renderBattle(true);showMain()}

// ---------- info modals ----------
function typeChart(){let h='<table class="tc"><tr><th>ATQ ↓ / DÉF →</th>'+TYPES.map(t=>`<th>${tb(t)}</th>`).join('')+'</tr>';
 TYPES.forEach(a=>{h+=`<tr><th>${tb(a)}</th>`+TYPES.map(d=>{const e=eff(a,[d]);return `<td class="${e>1?'x2':e<1?'x05':''}">${e>1?'2×':e<1?'½':''}</td>`}).join('')+'</tr>'});
 choose('Table des types',[],{body:h+'</table><div class="note" style="margin-top:10px">Une attaque du même type que le combattant fait 1,5× plus de dégâts.</div>',cancel:'Fermer'})}
function help(){choose('Comment jouer',[],{cancel:'Compris !',body:`<div class="modtxt">
• Dépense 10 points pour choisir jusqu’à 6 combattants. Les plus forts coûtent plus cher.<br>
• Combats vague après vague. Toutes les 10 vagues, un <b>Boss</b> avec beaucoup de PV t’attend ; le battre soigne toute ton équipe.<br>
• Après chaque victoire, choisis 1 récompense sur 3 : potions, Contrats, Super Bonbons, boosts de stats, nouvelles attaques…<br>
• Affaiblis un adversaire, puis utilise un <b>📝 Contrat</b> pour le recruter.<br>
• Profite des types (voir la Table des types) pour frapper fort.<br>
• Tes combattants apprennent de nouvelles attaques en montant de niveau.<br>
• Un combattant K.O. le reste jusqu’à ce que tu utilises un Rappel. Si tout le monde est K.O., la partie est finie. Jusqu’où iras-tu ?<br><br>
De nouveaux combattants sont ajoutés régulièrement par le créateur du jeu !</div>`})}

// ---------- editor ----------
let ed={id:null,img:null,px:false,pv:0};
function moveOptions(sel){let h='<option value="">—</option>';['Normal',...TYPES].forEach(t=>{const ms=Object.values(MOVES).filter(m=>m.type===t);if(!ms.length)return;
 h+=`<optgroup label="${tn(t)}">`+ms.map(m=>`<option value="${esc(m.id)}" ${m.id===sel?'selected':''}>${esc(m.name)} (${m.pow?m.pow:'statut'}${m.id.startsWith('cm_')?' ★':''})</option>`).join('')+'</optgroup>'});return h}
function edInit(){const to=(arr,none)=>(none?'<option value="">Aucun</option>':'')+arr.map(t=>`<option value="${t}">${tn(t)}</option>`).join('');
 $('#edT1').innerHTML=to(TYPES);$('#edT2').innerHTML=to(TYPES,true);$('#nmType').innerHTML=to(['Normal',...TYPES]);
 $('#nmFx').innerHTML=Object.keys(FX).map(k=>`<option value="${k}">${FX[k]}</option>`).join('');
 $('#edStats').innerHTML=['hp','atk','def','spd'].map(k=>`<div class="stat"><span>${{hp:'PV',atk:'Attaque',def:'Défense',spd:'Vitesse'}[k]}</span><input type="range" min="20" max="150" value="65" id="es_${k}"><b id="ev_${k}">65</b></div>`).join('');
 ['hp','atk','def','spd'].forEach(k=>$('#es_'+k).oninput=edStatUpd);
 $('#edMoves').innerHTML=LEARN_AT.map((l,i)=>`<div>Niv. ${l}<select id="em_${i}"></select></div>`).join('')}
function edStatUpd(){let t=0;['hp','atk','def','spd'].forEach(k=>{const v=+$('#es_'+k).value;$('#ev_'+k).textContent=v;t+=v});
 $('#edBst').textContent=`· total ${t} · coûte ${costOf({base:{hp:t,atk:0,def:0,spd:0}})} pts`}
function edFillMoves(ms){LEARN_AT.forEach((_,i)=>$('#em_'+i).innerHTML=moveOptions(ms[i]||''))}
function edPrev(){$('#edPrev').innerHTML=av({img:ed.img,pv:ed.pv,emoji:$('#edEmoji').value.trim()||'⭐'});$('#edNoImg').classList.toggle('hidden',!ed.img)}
function edLoad(s){ed={id:s?s.id:null,img:s?s.img||null:null,px:!!(s&&s.px),pv:s?s.pv||0:0};$('#edTitle').textContent=s?(ORIG[s.id]?`Modifier ${s.name} (de base)`:'Modifier le combattant'):'Nouveau combattant';
 $('#edSave').textContent=s&&ORIG[s.id]?'Enregistrer les modifications':'Enregistrer';
 $('#edName').value=s?s.name:'';$('#edEmoji').value=s?s.emoji||'⭐':'⭐';$('#edT1').value=s?s.types[0]:'Science';$('#edT2').value=s&&s.types[1]?s.types[1]:'';
 ['hp','atk','def','spd'].forEach(k=>$('#es_'+k).value=s?s.base[k]:65);edStatUpd();edFillMoves(s?s.moves:genMoves([$('#edT1').value]));edPrev()}
function edList(){$('#edList').innerHTML=customs.length?customs.map(s=>`<div class="it"><span class="av">${av(s)}</span><div class="t">${esc(s.name)}<br>${s.types.map(tb).join('')}</div><button data-e="${esc(s.id)}">Modifier</button><button data-d="${esc(s.id)}">Supprimer</button></div>`).join(''):'<div class="note">Aucun combattant perso pour l’instant. Crée-en un à gauche !</div>';
 $('#edBuiltin').innerHTML=DEFAULTS.map(s=>`<div class="it"><span class="av">${av(s)}</span><div class="t">${esc(s.name)}${overrides[s.id]?' <small style="color:var(--acc)">modifié</small>':''}<br>${s.types.map(tb).join('')}</div><button data-e="${esc(s.id)}">Modifier</button>${overrides[s.id]?`<button data-r="${esc(s.id)}">Réinitialiser</button>`:''}</div>`).join('');
 $('#s-editor').querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{edLoad(SPECIES[b.dataset.e]);window.scrollTo(0,0)});
 $('#edBuiltin').querySelectorAll('[data-r]').forEach(b=>b.onclick=async()=>{const id=b.dataset.r;const ok=await choose(`Remettre ${esc(SPECIES[id].name)} comme à l’origine (${esc(ORIG[id].name)}) ?`,[{value:1,label:'Oui, réinitialiser'},{value:0,label:'Annuler'}],{cols:2});
  if(!ok)return;delete overrides[id];applyOv(id);LS.set('lr_overrides',overrides);if(ed.id===id)edLoad(SPECIES[id]);edList()});
 $('#edList').querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{const s=SPECIES[b.dataset.d];const ok=await choose(`Supprimer ${esc(s.name)} ?`,[{value:1,label:'Oui, supprimer'},{value:0,label:'Garder'}],{cols:2});
  if(!ok)return;customs=customs.filter(x=>x.id!==s.id);delete SPECIES[s.id];LS.set('lr_species',customs);if(ed.id===s.id)edLoad(null);edList()});
 $('#nmList').innerHTML=customMoves.length?'Tes attaques : '+customMoves.map(m=>esc(m.name)).join(', '):''}
function editorScreen(){if(!isAdmin())return;show('s-editor');$('#useDef').checked=rosterOpts.useDefaults;edLoad(null);edList()}
function edSave(){const name=$('#edName').value.trim();if(!name)return toast('Donne un nom à ton combattant');
 const t1=$('#edT1').value,t2=$('#edT2').value;const types=t2&&t2!==t1?[t1,t2]:[t1];
 const moves=LEARN_AT.map((_,i)=>$('#em_'+i).value);if(!moves.some(Boolean))return toast('Choisis au moins une attaque');
 const s={id:ed.id||'c_'+Date.now().toString(36),name,emoji:$('#edEmoji').value.trim()||'⭐',img:ed.img||null,types,
  base:{hp:+$('#es_hp').value,atk:+$('#es_atk').value,def:+$('#es_def').value,spd:+$('#es_spd').value},moves,px:!!(ed.img&&ed.px),pv:ed.img?ed.pv:0};
 let ok;if(ORIG[s.id]){overrides[s.id]=s;applyOv(s.id);ok=LS.set('lr_overrides',overrides)}
 else{s.custom=true;const i=customs.findIndex(x=>x.id===s.id);if(i>=0)customs[i]=s;else customs.push(s);SPECIES[s.id]=s;ok=LS.set('lr_species',customs)}
 if(!ok)toast('Enregistré pour cette session seulement (stockage plein ou bloqué)');else toast(`${name} enregistré !`);
 edLoad(null);edList()}
function loadImg(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>imgPx(r.result).then(res,rej);r.onerror=rej;r.readAsDataURL(file)})}

// ---------- wiring ----------
$('#tNew').onclick=()=>{if(LS.get('lr_run',null)){choose('Commencer une nouvelle partie ? Ta partie sauvegardée sera perdue.',[{value:1,label:'Oui, nouvelle partie'},{value:0,label:'Annuler'}],{cols:2}).then(v=>{if(v){LS.del('lr_run');starterScreen()}})}else starterScreen()};
$('#tContinue').onclick=continueRun;$('#tEditor').onclick=editorScreen;$('#tTypes').onclick=typeChart;$('#tHelp').onclick=help;
$('#stBack').onclick=title;$('#stGo').onclick=startRun;$('#edBack').onclick=title;
$('#spdBtn').onclick=()=>{settings.fast=!settings.fast;LS.set('lr_settings',settings);$('#spdBtn').style.color=settings.fast?'var(--acc)':'';toast(settings.fast?'Texte rapide':'Texte normal')};
$('#quitBtn').onclick=async()=>{const v=await choose('Quitter la partie ? Elle est sauvegardée au début de chaque vague.',[{value:1,label:'Retour au menu'},{value:0,label:'Continuer'}],{cols:2});if(v){G=null;busy=false;title()}};
edInit();
$('#edT1').onchange=$('#edT2').onchange=()=>{if(!ed.id)$('#edAuto').click()};
$('#edAuto').onclick=()=>{const t2=$('#edT2').value;edFillMoves(genMoves(t2&&t2!==$('#edT1').value?[$('#edT1').value,t2]:[$('#edT1').value]))};
$('#edEmoji').oninput=edPrev;
$('#edFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{ed.img=await loadImg(f);ed.px=true;ed.pv=2;edPrev()}catch(x){toast('Impossible de lire cette image')}e.target.value=''};
$('#edNoImg').onclick=()=>{ed.img=null;edPrev()};
$('#edSave').onclick=edSave;$('#edReset').onclick=()=>edLoad(null);
$('#useDef').onchange=e=>{rosterOpts.useDefaults=e.target.checked;LS.set('lr_rosteropts',rosterOpts)};
$('#nmAdd').onclick=()=>{const name=$('#nmName').value.trim();if(!name)return toast('Donne un nom à l’attaque');
 const m={id:'cm_'+Date.now().toString(36),name,type:$('#nmType').value,pow:clamp(+$('#nmPow').value||0,0,150),acc:clamp(+$('#nmAcc').value||100,30,100),fx:$('#nmFx').value};
 if(!m.pow&&!m.fx)m.fx='atkup';customMoves.push(m);MOVES[m.id]=m;LS.set('lr_moves',customMoves);
 const cur=LEARN_AT.map((_,i)=>$('#em_'+i).value);const empty=cur.indexOf('');if(empty>=0)cur[empty]=m.id;edFillMoves(cur);
 $('#nmName').value='';toast(`Attaque « ${name} » créée`);edList()};
$('#edExport').onclick=()=>{$('#edIO').value=JSON.stringify({species:customs,moves:customMoves,overrides});toast('Exporté ! Copie le texte pour le garder')};
$('#edCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#edIO').value);toast('Copié !')}catch(e){$('#edIO').select();toast('Sélectionne le texte et copie-le à la main')}};
$('#edImport').onclick=()=>{try{const d=JSON.parse($('#edIO').value);(d.moves||[]).forEach(m=>{if(m&&m.id&&m.name){const i=customMoves.findIndex(x=>x.id===m.id);if(i>=0)customMoves[i]=m;else customMoves.push(m);MOVES[m.id]=m}});
 let n=0;(d.species||[]).forEach(s=>{if(s&&s.id&&s.name&&Array.isArray(s.types)&&s.base&&Array.isArray(s.moves)){const i=customs.findIndex(x=>x.id===s.id);if(i>=0)customs[i]=s;else customs.push(s);SPECIES[s.id]=s;n++}});
 Object.entries(d.overrides||{}).forEach(([id,s])=>{if(ORIG[id]&&s&&s.name&&Array.isArray(s.types)&&s.base&&Array.isArray(s.moves)){overrides[id]=s;applyOv(id);n++}});
 LS.set('lr_species',customs);LS.set('lr_moves',customMoves);LS.set('lr_overrides',overrides);edFillMoves(LEARN_AT.map((_,i)=>$('#em_'+i).value));edList();toast(`${n} combattant(s) importé(s)`)}catch(e){toast('Ce texte n’est pas valide')}};
// ---------- accounts (Firebase, via its web APIs) ----------
const FIREBASE={apiKey:'AIzaSyDkiO0QIkjVw4uX_2FbCWa6d00AnqAlMn0',projectId:'legends-rogue'};
// the project ID is read from the login token when not set above
function jwtAud(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).aud||''}catch(e){return ''}}
let syncT=null,syncing=false,syncAgain=false;
const CLOUD=t=>{$('#cloud').textContent=t};
function saveSession(){try{localStorage.setItem('lr_session',JSON.stringify(ACC))}catch(e){}}
function dropSession(){ACC=null;try{localStorage.removeItem('lr_session')}catch(e){}}
const AERR={EMAIL_EXISTS:'Cet e-mail a déjà un compte. Connecte-toi plutôt.',EMAIL_NOT_FOUND:'E-mail ou mot de passe incorrect.',INVALID_PASSWORD:'E-mail ou mot de passe incorrect.',
 INVALID_LOGIN_CREDENTIALS:'E-mail ou mot de passe incorrect.',WEAK_PASSWORD:'Mot de passe trop court (6 caractères minimum).',INVALID_EMAIL:'Adresse e-mail invalide.',MISSING_PASSWORD:'Écris ton mot de passe.',
 TOO_MANY_ATTEMPTS_TRY_LATER:'Trop d’essais. Réessaie dans quelques minutes.',USER_DISABLED:'Ce compte a été désactivé.',OPERATION_NOT_ALLOWED:'La connexion par e-mail n’est pas activée dans Firebase.',
 CONFIGURATION_NOT_FOUND:'Firebase Authentication n’est pas encore activé.',CREDENTIAL_TOO_OLD_LOGIN_AGAIN:'Pour ça, déconnecte-toi puis reconnecte-toi d’abord.',
 PERMISSION_DENIED:'La base de données refuse l’accès (vérifie les règles Firestore).',NOT_FOUND:'La base de données Firestore n’existe pas encore.',
 TOKEN_EXPIRED:'Session expirée, reconnecte-toi.',USER_NOT_FOUND:'Compte introuvable, reconnecte-toi.',INVALID_REFRESH_TOKEN:'Session expirée, reconnecte-toi.'};
function errMsg(e){if(e instanceof TypeError)return 'Pas de connexion internet.';const m=String(e&&e.message||e);for(const k in AERR)if(m.startsWith(k))return AERR[k];return 'Erreur : '+m}
async function fbAuth(path,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${FIREBASE.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error&&j.error.message||'HTTP '+r.status);return j}
async function refreshTok(){const r=await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE.apiKey}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(ACC.refreshToken)});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error&&j.error.message||'HTTP '+r.status);ACC.idToken=j.id_token;ACC.refreshToken=j.refresh_token;ACC.exp=Date.now()+(+j.expires_in-60)*1000;saveSession()}
async function idTok(){if(!ACC.idToken||Date.now()>ACC.exp)await refreshTok();return ACC.idToken}
const docURL=()=>`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId||jwtAud(ACC.idToken)}/databases/(default)/documents/players/${ACC.uid}`;
async function fsErr(r){const j=await r.json().catch(()=>({}));return new Error(j.error&&j.error.status||'HTTP '+r.status)}
async function cloudLoad(){const r=await fetch(docURL(),{headers:{Authorization:'Bearer '+await idTok()}});if(r.status===404)return null;if(!r.ok)throw await fsErr(r);
 const f=(await r.json()).fields||{};return{data:f.data?JSON.parse(f.data.stringValue):{},name:f.name&&f.name.stringValue}}
function localData(){const d={};SYNC_KEYS.forEach(k=>{try{const v=localStorage.getItem(k);if(v!=null)d[k]=v}catch(e){}});return d}
async function cloudSave(keep){const body=JSON.stringify({fields:{data:{stringValue:JSON.stringify(localData())},name:{stringValue:ACC.name||''},updated:{timestampValue:new Date().toISOString()}}});
 const r=await fetch(docURL(),{method:'PATCH',keepalive:!!keep&&body.length<60000,headers:{Authorization:'Bearer '+await idTok(),'Content-Type':'application/json'},body});if(!r.ok)throw await fsErr(r)}
function queueSync(){if(!ACC)return;CLOUD('☁️ …');clearTimeout(syncT);syncT=setTimeout(doSync,1500)}
async function doSync(keep){clearTimeout(syncT);syncT=null;if(!ACC)return;if(syncing){syncAgain=true;return}syncing=true;
 try{await cloudSave(keep);CLOUD('☁️ Sauvegardé')}catch(e){CLOUD('⚠️ Pas synchronisé');console.warn(e)}syncing=false;if(syncAgain){syncAgain=false;await doSync()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&ACC&&syncT)doSync(true)});
function reloadState(){customMoves.forEach(m=>delete MOVES[m.id]);customMoves=LS.get('lr_moves',[]);customMoves.forEach(m=>MOVES[m.id]=m);
 customs.forEach(s=>delete SPECIES[s.id]);customs=LS.get('lr_species',[]);customs.forEach(s=>SPECIES[s.id]=s);
 Object.keys(ORIG).forEach(id=>{SPECIES[id]=ORIG[id];DEFAULTS[DEFAULTS.findIndex(x=>x.id===id)]=ORIG[id]});
 overrides=LS.get('lr_overrides',{});Object.keys(overrides).forEach(id=>{if(ORIG[id])applyOv(id);else delete overrides[id]});
 settings=Object.assign({useDefaults:true,fast:false},LS.get('lr_settings',{}));rosterOpts=Object.assign({useDefaults:true},LS.get('lr_rosteropts',{}))}
async function pullCloud(){const c=await cloudLoad();
 if(c){SYNC_KEYS.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});for(const k in c.data)if(SYNC_KEYS.includes(k))try{localStorage.setItem(k,c.data[k])}catch(e){}if(c.name&&!ACC.name)ACC.name=c.name}
 else await cloudSave();
 await pullRoster(c&&c.data);
 reloadState();saveSession();CLOUD('☁️ Sauvegardé')}
// ---------- shared roster: only the admin can change it ----------
const ADMIN_EMAILS=['joshualieberthal0@gmail.com'];
const isAdmin=()=>!!ACC&&ADMIN_EMAILS.includes(String(ACC.email||'').toLowerCase());
function tokClaims(){try{return JSON.parse(atob(ACC.idToken.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch(e){return{}}}
const rosterURL=()=>`https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId||jwtAud(ACC.idToken)}/databases/(default)/documents/game/roster`;
async function rosterLoad(){const r=await fetch(rosterURL(),{headers:{Authorization:'Bearer '+await idTok()}});if(r.status===404)return null;if(!r.ok)throw await fsErr(r);
 const f=(await r.json()).fields||{};return f.data?JSON.parse(f.data.stringValue):{}}
function rosterLocal(){const d={};ROSTER_KEYS.forEach(k=>{try{const v=localStorage.getItem(k);if(v!=null)d[k]=v}catch(e){}});return d}
async function rosterSave(){const body=JSON.stringify({fields:{data:{stringValue:JSON.stringify(rosterLocal())},updated:{timestampValue:new Date().toISOString()}}});
 if(body.length>1000000)throw new Error('TROP_GROS');
 const r=await fetch(rosterURL(),{method:'PATCH',headers:{Authorization:'Bearer '+await idTok(),'Content-Type':'application/json'},body});if(!r.ok)throw await fsErr(r)}
let rosT=null;
function queueRoster(){if(!isAdmin())return;CLOUD('☁️ …');clearTimeout(rosT);rosT=setTimeout(pushRoster,1200)}
async function pushRoster(){clearTimeout(rosT);rosT=null;
 try{try{await rosterSave()}catch(e){if(!String(e.message).startsWith('PERMISSION_DENIED'))throw e;await refreshTok();await rosterSave()}CLOUD('☁️ Combattants publiés')}
 catch(e){CLOUD('⚠️ Combattants non publiés');const m=String(e.message);
  toast(m.startsWith('PERMISSION_DENIED')?'Pas publié : vérifie les règles Firestore':m==='TROP_GROS'?'Trop de photos : la limite en ligne est atteinte':errMsg(e))}}
async function pullRoster(fallback){let d;try{d=await rosterLoad()}catch(e){console.warn('roster',e);return}
 if(d){ROSTER_KEYS.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});for(const k in d)if(ROSTER_KEYS.includes(k))try{localStorage.setItem(k,d[k])}catch(e){}}
 else if(isAdmin()){if(fallback)for(const k of ROSTER_KEYS)try{if(fallback[k]!=null&&localStorage.getItem(k)==null)localStorage.setItem(k,fallback[k])}catch(e){}
  try{await rosterSave()}catch(e){console.warn('roster',e)}}
 else ROSTER_KEYS.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})}
function setSession(j,name){ACC={uid:j.localId,email:j.email,name:name||j.displayName||'',idToken:j.idToken,refreshToken:j.refreshToken,exp:Date.now()+(+j.expiresIn-60)*1000};saveSession()}
let aMode='in';
function aMsg(t,ok){const e=$('#aErr');e.textContent=t;e.classList.toggle('ok',!!ok)}
function authMode(m){aMode=m;$('#aTabIn').classList.toggle('on',m==='in');$('#aTabUp').classList.toggle('on',m==='up');$('#aNameF').classList.toggle('hidden',m==='in');
 $('#aGo').textContent=m==='in'?'Se connecter':'Créer mon compte';$('#aForgot').classList.toggle('hidden',m!=='in');$('#aPass').autocomplete=m==='in'?'current-password':'new-password';aMsg('')}
function showAuth(){show('s-auth');$('#authParade').innerHTML=['napoleon','curie','mozart','frida','owens'].map(id=>av(SPECIES[id])).join('');authMode(aMode)}
function enterGame(){title()}
$('#aTabIn').onclick=()=>authMode('in');$('#aTabUp').onclick=()=>authMode('up');
$('#aForm').onsubmit=async e=>{e.preventDefault();const email=$('#aEmail').value.trim(),pw=$('#aPass').value,name=$('#aName').value.trim();
 if(aMode==='up'&&!name)return aMsg('Choisis un pseudo.');
 $('#aGo').disabled=true;aMsg(aMode==='up'?'Création du compte…':'Connexion…',true);
 try{if(aMode==='up'){const j=await fbAuth('signUp',{email,password:pw,returnSecureToken:true});setSession(j,name);fbAuth('update',{idToken:j.idToken,displayName:name,returnSecureToken:false}).catch(()=>{})}
  else setSession(await fbAuth('signInWithPassword',{email,password:pw,returnSecureToken:true}));
  await pullCloud();$('#aPass').value='';aMsg('');enterGame()}
 catch(x){dropSession();CLOUD('');aMsg(errMsg(x))}
 $('#aGo').disabled=false};
$('#aForgot').onclick=async()=>{const email=$('#aEmail').value.trim();if(!email)return aMsg('Écris ton e-mail d’abord.');
 try{await fbAuth('sendOobCode',{requestType:'PASSWORD_RESET',email});aMsg('E-mail envoyé ! Regarde ta boîte de réception (et les spams).',true)}catch(x){aMsg(errMsg(x))}};
function clearLocal(){SYNC_KEYS.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});reloadState();G=null;busy=false}
async function logout(){if(syncT||syncing){CLOUD('☁️ …');await doSync()}dropSession();clearLocal();CLOUD('');showAuth()}
async function accountMenu(){let adm='',opts=[{value:'out',label:'Se déconnecter'},{value:'del',label:'Supprimer mon compte'}];
 if(isAdmin()){try{await refreshTok()}catch(e){}const ver=!!tokClaims().email_verified;
  adm=`<br><br>⭐ <b style="color:var(--acc)">Administrateur</b> : tu es le seul à pouvoir créer des combattants, et tout le monde les voit.`;
  opts.unshift({value:'pub',label:'☁️ Republier mes combattants'});if(!ver)opts.push({value:'verify',label:'📧 Vérifier mon e-mail (facultatif)'})}
 const v=await choose('Mon compte',opts,{cancel:'Retour',
 body:`<div class="modtxt">Pseudo : ${esc(ACC.name||'—')}<br>E-mail : ${esc(ACC.email||'')}<br><br>Ta progression est sauvegardée en ligne et te suit sur tous tes appareils.${adm}</div>`});
 if(v==='verify'){try{await fbAuth('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:await idTok()});toast('E-mail envoyé ! Clique sur le lien, puis rouvre « Mon compte »')}catch(x){toast(errMsg(x))}return}
 if(v==='pub')return pushRoster();
 if(v==='out')return logout();
 if(v==='del'){const ok=await choose('Supprimer ton compte ? Ta partie, ton record et tes combattants seront effacés pour toujours.',[{value:1,label:'Oui, supprimer'},{value:0,label:'Annuler'}],{cols:2});if(!ok)return;
  try{const t=await idTok();const r=await fetch(docURL(),{method:'DELETE',headers:{Authorization:'Bearer '+t}});if(!r.ok&&r.status!==404)throw await fsErr(r);await fbAuth('delete',{idToken:t})}
  catch(x){return toast(errMsg(x))}
  dropSession();clearLocal();CLOUD('');showAuth();aMsg('Compte supprimé.',true)}}
async function boot(){if(!FIREBASE.apiKey){showAuth();aMsg('Les comptes ne sont pas encore configurés (clés Firebase manquantes).');$('#aGo').disabled=true;return}
 const s=LS.get('lr_session',null);
 if(s&&s.refreshToken){ACC=s;CLOUD('☁️ …');
  try{await refreshTok();await pullCloud();return enterGame()}
  catch(e){if(e instanceof TypeError){CLOUD('⚠️ Hors ligne');return enterGame()}dropSession();CLOUD('')}}
 showAuth()}
boot();
// convert pictures saved by the older version into pixel sprites
(async()=>{let c1=false,c2=false;for(const s of customs)if(s.img&&!s.px){try{s.img=await imgPx(s.img);s.px=true;s.pv=2;c1=true}catch(e){}}
 for(const id in overrides){const s=overrides[id];if(s.img&&!s.px){try{s.img=await imgPx(s.img);s.px=true;s.pv=2;c2=true;applyOv(id)}catch(e){}}}
 if(c1){LS.set('lr_species',customs);customs.forEach(s=>SPECIES[s.id]=s)}if(c2)LS.set('lr_overrides',overrides)})();
