window.Tree=(()=>{
const SEED=[
{id:'u',name:'Upendra Pathak Rajbongsh',sp:'s'},{id:'s',name:'Sumitra Rajbongsh',sp:'u'},
{id:'h',name:'Harendra Kumar',sp:'c'},{id:'c',name:'Smt. Champa Kumar',sp:'h'},
{id:'hal',name:'Haladhar',par:'u'},{id:'g',name:'Gajen',par:'u'},
{id:'r',name:'Rati Kanta Rajbongsh',par:'u',sp:'b'},{id:'b',name:'Bharati Kumar Rajbongsh',par:'h',sp:'r'},
{id:'ud',name:'Uday Kumar',par:'h'},{id:'t',name:'Tilak Kumar',par:'h'},
{id:'bo',name:'Bonajit Rajbongsh',par:'r'},{id:'tr',name:'Tradipta Rajbongsh',par:'r'}];
const CW=132,CH=156,SG=44,GAP=40,ROWH=250,PX=60,PY=40;
let tl=null,prev={};

function layout(P){
 const by=id=>P.find(p=>p.id===id);
 const gen={};P.forEach(p=>gen[p.id]=0);
 for(let k=0,ch=true;ch&&k<60;k++){ch=false;P.forEach(p=>{let g=gen[p.id];
  if(p.par&&by(p.par))g=Math.max(g,gen[p.par]+1);
  if(p.sp&&by(p.sp))g=Math.max(g,gen[p.sp]);
  if(g!==gen[p.id]){gen[p.id]=g;ch=true}})}
 const uo={},U=[];
 P.forEach(p=>{if(uo[p.id])return;const m=[p],s=p.sp&&by(p.sp);if(s&&!uo[s.id])m.push(s);
  const u={m,g:gen[p.id],w:m.length*CW+(m.length-1)*SG};m.forEach(x=>uo[x.id]=u);U.push(u)});
 const G=Math.max(...U.map(u=>u.g)),rows=[];
 for(let g=0;g<=G;g++)rows.push(U.filter(u=>u.g===g));
 const pars=u=>[...new Set(u.m.filter(x=>x.par&&uo[x.par]).map(x=>uo[x.par]))];
 rows[0].forEach((u,i)=>u.x=i*1000);
 for(let g=1;g<=G;g++){rows[g].forEach(u=>{const ps=pars(u);u.k=ps.length?ps.reduce((a,p)=>a+p.x,0)/ps.length:1e9});
  rows[g].sort((a,b)=>a.k-b.k);rows[g].forEach(u=>u.x=u.k)}
 rows.forEach(r=>{let x=0;r.forEach(u=>{u.x=x+u.w/2;x+=u.w+GAP})});
 const kids=new Map();U.forEach(u=>kids.set(u,[]));U.forEach(c=>pars(c).forEach(p=>kids.get(p).push(c)));
 const sp=r=>{for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i];b.x=Math.max(b.x,a.x+(a.w+b.w)/2+GAP)}};
 for(let it=0;it<4;it++){
  for(let g=1;g<=G;g++){rows[g].forEach(u=>{const ps=pars(u);if(ps.length)u.x=ps.reduce((a,p)=>a+p.x,0)/ps.length});sp(rows[g])}
  for(let g=G-1;g>=0;g--){rows[g].forEach(u=>{const k=kids.get(u);if(k.length)u.x=k.reduce((a,c)=>a+c.x,0)/k.length});sp(rows[g])}
 }
 const off=PX-Math.min(...U.map(u=>u.x-u.w/2));
 U.forEach(u=>{u.x+=off;u.y=PY+u.g*ROWH});
 return{U,uo,G,W:Math.max(...U.map(u=>u.x+u.w/2))+PX,H:PY*2+G*ROWH+CH}
}
const mx=(u,i)=>u.x-u.w/2+CW/2+i*(CW+SG);

function render(stage,svg,P,o={}){
 const L=layout(P);
 stage.style.width=L.W+'px';stage.style.height=L.H+'px';
 svg.setAttribute('width',L.W);svg.setAttribute('height',L.H);
 stage.querySelectorAll('.card').forEach(e=>e.remove());
 let s='';
 L.U.forEach(u=>{
  if(u.m.length>1){const x1=mx(u,0)+CW/2,y=u.y+CH/2;s+=`<line class="ln sp" data-g="${u.g}" data-c="${u.m[1].id}" x1="${x1}" y1="${y}" x2="${x1+SG}" y2="${y}"/>`}
  u.m.forEach((p,i)=>{
   const cx=mx(u,i),pu=p.par&&L.uo[p.par];
   if(pu){const sx=pu.x,sy=pu.m.length>1?pu.y+CH/2:pu.y+CH,ey=u.y,my=(sy+ey)/2;
    s+=`<path class="ln" data-g="${pu.g}" data-c="${p.id}" d="M${sx} ${sy}C${sx} ${my} ${cx} ${my} ${cx} ${ey}"/>`}
   const c=document.createElement('div');c.className='card'+(o.onClick?' edit':'')+(p.id===o.sel?' sel':'');c.dataset.g=u.g;c.dataset.id=p.id;
   c.style.cssText=`left:${cx-CW/2}px;top:${u.y}px;width:${CW}px;height:${CH}px`;
   const av=document.createElement('div');av.className='av';
   if(p.photo){const im=document.createElement('img');im.src=p.photo;im.alt='';av.appendChild(im)}else av.textContent=(p.name||'?')[0].toUpperCase();
   const nm=document.createElement('div');nm.className='nm';nm.textContent=p.name;
   const nt=document.createElement('div');nt.className='nt';nt.textContent=p.place?'📍 '+p.place:(p.note||'');
   c.append(av,nm,nt);const bt=o.badge&&o.badge(p);if(bt){const e=document.createElement('div');e.className='bd';e.textContent=bt;c.appendChild(e)}
   c.onmouseenter=()=>gsap.to(c,{y:-6,scale:1.05,duration:.25});
   c.onmouseleave=()=>gsap.to(c,{y:0,scale:1,duration:.25});
   if(o.onClick)c.onclick=()=>o.onClick(p.id);
   stage.appendChild(c)})
 });
 svg.innerHTML=s;
 const run=o.anim&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 svg.querySelectorAll('.ln').forEach(l=>{if(run){const n=l.getTotalLength();l.style.strokeDasharray=n;l.style.strokeDashoffset=n}});
 if(tl)tl.kill();
 if(run){tl=gsap.timeline();
  for(let g=0;g<=L.G;g++){
   tl.fromTo(stage.querySelectorAll(`.card[data-g="${g}"]`),{autoAlpha:0,y:36,scale:.85},{autoAlpha:1,y:0,scale:1,duration:.7,stagger:.12,ease:'back.out(1.5)'},g*1.3);
   tl.to(svg.querySelectorAll(`.ln[data-g="${g}"]`),{strokeDashoffset:0,duration:1,stagger:.08,ease:'power2.inOut'},g*1.3+.45)}}
 flip(stage,svg,o,run);
}
function flip(stage,svg,o,run){
 const now={},go=!run&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 stage.querySelectorAll('.card').forEach(c=>{const id=c.dataset.id,l=parseFloat(c.style.left),t=parseFloat(c.style.top);now[id]=[l,t];
  if(!go)return;
  if(o.fresh&&o.fresh.has(id))gsap.from(c,{autoAlpha:0,scale:.7,y:-30,duration:.6,ease:'back.out(1.6)'});
  else if(prev[id]&&(prev[id][0]!==l||prev[id][1]!==t))gsap.from(c,{x:prev[id][0]-l,y:prev[id][1]-t,duration:.6,ease:'power2.inOut'})});
 if(go&&o.fresh)svg.querySelectorAll('.ln').forEach(l=>{
  if(o.fresh.has(l.dataset.c)){const n=l.getTotalLength();gsap.fromTo(l,{strokeDasharray:n,strokeDashoffset:n},{strokeDashoffset:0,duration:.9,delay:.35,ease:'power2.inOut'})}
  else gsap.from(l,{opacity:0,duration:.6})});
 prev=now;
}
return{SEED,render}})();
