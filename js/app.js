import {load,esc,bg} from './store.js';
import {gallery} from './gallery.js';
import {effective,apply,loadFont} from './themes.js';
const cs=c=>[c.src&&bg(c.src),c.src&&`--dim:${(c.dim??45)/100}`,c.tc&&`--tc:${c.tc}`,c.pc&&`--pc:${c.pc}`,c.bc&&`background-color:${c.bc}`,c.font&&`--cf:'${c.font}',system-ui,sans-serif`,c.al&&`text-align:${c.al}`].filter(Boolean).join(';');
const preview=new URLSearchParams(location.search).has('preview');
let s;
async function boot(keep){
  s=await load(preview);apply(effective(s));
  document.title=s.name;
  const pg=s.pageBg;document.body.classList.toggle('haspg',!!pg.src);
  if(pg.src){document.body.style.setProperty('--pg',`url("${pg.src}")`);document.body.style.setProperty('--pgo',(100-(pg.vis??25))+'%')}
document.body.classList.toggle('prot',!!s.protect);
  bar.hidden=!(s.banner.on&&s.banner.text);bar.textContent=s.banner.text;
  brand.innerHTML=(s.logo?`<img src="${esc(s.logo)}" alt="${s.logoHideName?esc(s.name):''}">`:'')+(s.logo&&s.logoHideName?'':`<span>${esc(s.name)}</span>`);
  if(s.logo)document.querySelector('link[rel=icon]').href=s.logo;
  nav.innerHTML=[{id:'home',title:'Home'},...s.tabs].map(t=>`<a href="#${esc(t.id)}" data-id="${esc(t.id)}">${esc(t.title)}</a>`).join('');
  foot.innerHTML=`© ${new Date().getFullYear()} ${esc(s.name)}. Artwork may not be copied, traced, or used for AI training.`;
  route(keep);
}
function route(keep){
  const id=location.hash.slice(1)||'home',t=s.tabs.find(t=>t.id===id);
  nav.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.dataset.id===id));
  if(!t){view.innerHTML=`<section class="hero${s.hero.src?' hasimg':''}${s.hero.px?' px':''}" style="${esc(s.hero.src?bg(s.hero.src)+';--dim:'+((s.hero.dim??45)/100):'')}"><h1 class="${s.name.length>24?'xl':s.name.length>12?'long':''}">${esc(s.name)}</h1><p>${esc(s.tagline)}</p><p>${esc(s.bio)}</p>
  <div class="pills">${s.links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div></section>`;return}
  view.innerHTML=`<div class="head"><h2>${esc(t.title)}</h2>${t.desc?`<p>${esc(t.desc)}</p>`:''}</div><div id="body"></div>`;
  const b=document.getElementById('body');
  if(t.type==='text')b.innerHTML=`<div class="text">${esc(t.body)}</div>`;
  else if(t.type==='cards')(t.cards||[]).forEach(c=>c.font&&loadFont(c.font)),b.innerHTML=`<div class="cards">${(t.cards||[]).map(c=>`<article class="ccard${c.src?' hasimg':''}${c.px?' px':''}" style="${esc(cs(c))}"><div class="in"><h3>${esc(c.title)}</h3>${c.price?`<div class="price">${esc(c.price)}</div>`:''}<p>${esc(c.desc)}</p></div></article>`).join('')}</div>`;
  else if(t.images.length)gallery(b,t.images);
  else b.innerHTML='<p class="text">Nothing here yet.</p>';
  if(!keep)scrollTo(0,0);
}
for(const ev of['contextmenu','dragstart'])addEventListener(ev,e=>{if(s?.protect&&e.target.closest('.img,.lbimg,.ccard'))e.preventDefault()});
addEventListener('hashchange',()=>route());
if(preview)new BroadcastChannel('portfolio').onmessage=()=>boot(true);
boot();
