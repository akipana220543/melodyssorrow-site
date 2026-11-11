import {load,saveDraft,clearDraft,esc,bg} from './store.js';
import {PRESETS,FONTS} from './themes.js';
const $=id=>document.getElementById(id),app=$('app'),ch=new BroadcastChannel('portfolio');
const CFG='portfolio-gh',DIRTY='portfolio-dirty',TABS=['Site','Pages','Look','Publish'];
let d=await load(true),tab=localStorage.getItem('adm-tab')||'Site',drag=null,timer;
let gh=JSON.parse(localStorage.getItem(CFG)||'{"repo":"","branch":"main","token":""}');
const get=(o,p)=>p.split('.').reduce((a,k)=>a?.[k],o);
const set=(o,p,v)=>{const k=p.split('.'),l=k.pop();get(o,k.join('.')||'')?.[l]!==undefined||k.length?k.reduce((a,x)=>a[x],o)[l]=v:o[l]=v};
const toast=m=>{const e=Object.assign(document.createElement('div'),{className:'msg',textContent:m});document.body.append(e);setTimeout(()=>e.remove(),3500)};
const tp=()=>{const i=d.looks.findIndex(l=>l.name===d._pv);return i>=0?`looks.${i}.theme`:'theme'};
const inp=(p,label,ph='')=>`<label>${label}<input type="text" data-p="${p}" value="${esc(get(d,p))}" placeholder="${esc(ph)}"></label>`;
const lum=h=>{const c=[1,3,5].map(i=>{const v=parseInt(h.slice(i,i+2),16)/255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};

const site=()=>`<section class="card"><h2>About you</h2>${inp('name','Name')}${inp('tagline','Tagline')}<label>Bio<textarea data-p="bio">${esc(d.bio)}</textarea></label>
<label class="drop" data-h="1">${d.hero.src?'Replace the home background image':'Add a home background image (optional)'}<input type="file" accept="image/*" hidden data-h="1"></label>
${d.hero.src?`<label>Image darkness<input type="range" min="0" max="80" data-p="hero.dim" value="${d.hero.dim??45}"></label><button data-a="hr">Remove background image</button>`:''}
<p class="hint">Background images for the home page and cards are not watermarked, so choose something you are happy to share openly.</p></section>
<section class="card"><h2>Logo</h2>${d.logo?`<img src="${esc(d.logo)}" alt="" style="height:3rem;width:auto;align-self:start;border-radius:6px;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/12px 12px">`:''}
<label class="drop" data-logo="1">${d.logo?'Replace logo':'Add a logo (optional)'}<input type="file" accept="image/*" hidden data-logo="1"></label>
${d.logo?`<label><input type="checkbox" data-c="logoHideName" ${d.logoHideName?'checked':''}> Show only the logo in the header</label><button data-a="lr">Remove logo</button>`:''}
<p class="hint">A PNG with a transparent background works best. It also becomes the browser tab icon.</p></section>
<section class="card"><h2>Page background</h2>
<label class="drop" data-pg="1">${d.pageBg.src?'Replace the page background':'Add a background image for the whole site (optional)'}<input type="file" accept="image/*" hidden data-pg="1"></label>
${d.pageBg.src?`<label>Image visibility<input type="range" min="5" max="100" data-p="pageBg.vis" value="${d.pageBg.vis??25}"></label><button data-a="pr">Remove page background</button>`:''}
<p class="hint">Sits behind every page and is not watermarked. Lower visibility keeps text easy to read.</p></section>
<section class="card"><h2>Announcement bar</h2><label><input type="checkbox" data-c="banner.on" ${d.banner.on?'checked':''}> Show a bar at the top of the site</label>${inp('banner.text','Message','Holiday sale this week!')}</section>
<section class="card"><h2>Links</h2>${d.links.map((l,i)=>`<div class="row"><input type="text" data-p="links.${i}.label" value="${esc(l.label)}" placeholder="Label"><input type="text" data-p="links.${i}.url" value="${esc(l.url)}" placeholder="https://"><button class="s" data-a="dl" data-i="${i}">Remove</button></div>`).join('')}<button data-a="al">Add link</button></section>
<section class="card"><h2>Image protection</h2>${inp('watermark','Watermark text')}
<label><input type="checkbox" data-c="protect" ${d.protect?'checked':''}> Block right-click, drag and save</label>
<label><input type="checkbox" data-c="pixel" ${d.pixel?'checked':''}> Keep small pixel art sharp</label></section>`;

const cardsUI=(t,ti)=>(t.cards||[]).map((c,ci)=>{const th=get(d,tp()),P=`tabs.${ti}.cards.${ci}`,B=`data-t="${ti}" data-i="${ci}"`;return `<div class="look"><div class="row"><input type="text" data-p="${P}.title" value="${esc(c.title)}" placeholder="Card title"><input class="s" style="width:6rem" type="text" data-p="${P}.price" value="${esc(c.price||'')}" placeholder="Price"></div>
<textarea data-p="${P}.desc" placeholder="What's included">${esc(c.desc||'')}</textarea>
<div class="colors"><label>Text<input type="color" data-p="${P}.tc" value="${c.tc||(c.src?'#ffffff':th.ink)}"></label><label>Price<input type="color" data-p="${P}.pc" value="${c.pc||(c.src?'#ffffff':th.acc)}"></label>${c.src?'':`<label>Card<input type="color" data-p="${P}.bc" value="${c.bc||th.bg}"></label>`}</div>
<div class="row"><label>Font<select data-p="${P}.font"><option value="">Same as site</option>${[...FONTS,...d.fonts].map(f=>`<option ${c.font==f?'selected':''}>${esc(f)}</option>`).join('')}</select></label><label>Align<select data-p="${P}.al"><option value="">Left</option><option value="center" ${c.al=='center'?'selected':''}>Centered</option></select></label></div>
<label class="drop" data-t="${ti}" data-k="${ci}">${c.src?'Replace background image':'Add a background image (optional)'}<input type="file" accept="image/*" hidden data-t="${ti}" data-k="${ci}"></label>
${c.src?`<label>Image darkness<input type="range" min="0" max="80" data-p="${P}.dim" value="${c.dim??45}"></label>`:''}
<div class="row"><button data-a="cu" ${B}>↑</button><button data-a="cd" ${B}>↓</button>${c.src?`<button data-a="ci" ${B}>Remove image</button>`:''}<button data-a="cr" ${B}>Reset style</button><button data-a="cs" ${B}>Copy style to all</button><button data-a="dc" ${B}>Delete card</button></div></div>`}).join('')+`<button data-a="ac" data-t="${ti}">Add a card</button>`;
const pages=()=>d.tabs.map((t,ti)=>`<section class="card"><div class="row"><input type="text" data-p="tabs.${ti}.title" value="${esc(t.title)}">
<select class="s" data-p="tabs.${ti}.type" data-r><option value="gallery" ${t.type=='gallery'?'selected':''}>Gallery</option><option value="text" ${t.type=='text'?'selected':''}>Text page</option><option value="cards" ${t.type=='cards'?'selected':''}>Cards</option></select>
<button class="s" data-a="tu" data-t="${ti}">↑</button><button class="s" data-a="td" data-t="${ti}">↓</button><button class="s" data-a="dt" data-t="${ti}">Delete</button></div>
<input type="text" data-p="tabs.${ti}.desc" value="${esc(t.desc||'')}" placeholder="Short description (optional)">
${t.type=='cards'?cardsUI(t,ti):t.type=='text'?`<textarea data-p="tabs.${ti}.body" style="min-height:10rem">${esc(t.body||'')}</textarea>`:`
<label class="drop" data-t="${ti}">Drop images here or click to choose<input type="file" accept="image/*" multiple hidden data-t="${ti}"></label>
<p class="hint">Drag a picture to change its order.</p>
<div class="grid">${(t.images||[]).map((im,ii)=>`<div class="thumb" draggable="true" data-t="${ti}" data-i="${ii}"><div class="img${im.px?' px':''}" style="${bg(im.src)}"></div><input type="text" data-p="tabs.${ti}.images.${ii}.title" value="${esc(im.title||'')}" placeholder="Title"><div class="row"><button data-a="di" data-t="${ti}" data-i="${ii}">Remove</button></div></div>`).join('')}</div>`}</section>`).join('')+'<button data-a="at">Add a page</button>';

const look=()=>{const p=tp(),t=get(d,p);return `<section class="card"><h2>${d._pv?`Editing the “${esc(d._pv)}” look`:'Your main look'}</h2>${d._pv?'<button data-a="main">Back to main look</button>':''}
<div class="row">${Object.keys(PRESETS).map(k=>`<button data-a="pre" data-v="${k}">${k}</button>`).join('')}</div>
<div class="colors">${[['bg','Background'],['ink','Text'],['mute','Soft text'],['acc','Accent']].map(([k,l])=>`<label>${l}<input type="color" data-p="${p}.${k}" value="${t[k]}"></label>`).join('')}</div>
${ratio(t.bg,t.ink)<4.5?'<p class="warn">Text and background are too close in color to read comfortably.</p>':''}
<label>Heading font<select data-p="${p}.font">${[...FONTS,...d.fonts].map(f=>`<option ${t.font==f?'selected':''}>${esc(f)}</option>`).join('')}</select></label>
<div class="row"><input type="text" id="newfont" placeholder="Add any Google Font, e.g. Pacifico"><button class="s" data-a="af">Add font</button></div><p class="hint">Browse fonts at fonts.google.com and type the name exactly.</p>${d.fonts.length?`<div class="row">${d.fonts.map((f,i)=>`<button class="s" data-a="df" data-i="${i}">${esc(f)} ✕</button>`).join('')}</div>`:''}
<label>Corner roundness<input type="range" min="0" max="32" data-p="${p}.r" value="${t.r}"></label></section>
<section class="card"><h2>Saved looks</h2><p class="hint">Give a look dates and it switches on by itself every year. “Use always” ignores the dates.</p>
${d.looks.map((l,i)=>`<div class="look"><b>${esc(l.name)}</b><div class="row"><label>From<input type="date" data-dt="looks.${i}.from" value="${l.from?'2000-'+l.from:''}"></label><label>To<input type="date" data-dt="looks.${i}.to" value="${l.to?'2000-'+l.to:''}"></label></div>
<div class="row"><button data-a="ed" data-v="${esc(l.name)}">Edit and preview</button><button class="${d.look==l.name?'on':''}" data-a="always" data-v="${esc(l.name)}">${d.look==l.name?'Always on':'Use always'}</button><button data-a="dlk" data-i="${i}">Delete</button></div></div>`).join('')}
<div class="row"><input type="text" id="newlook" placeholder="Name this look, e.g. Valentine’s"><button class="s" data-a="sl">Save current look</button></div></section>`};

const publishTab=()=>`<section class="card"><h2>Connect to GitHub</h2><ol class="hint" style="padding-left:1.1rem;display:grid;gap:.3rem"><li>On github.com, open Settings, Developer settings, Fine-grained tokens, then Generate new token.</li><li>Under Repository access, choose Only select repositories and pick this site’s repo.</li><li>Under Permissions, set Contents to Read and write.</li><li>Copy the token and paste it below. It stays in this browser only.</li></ol>
<div class="row"><input type="text" data-g="repo" value="${esc(gh.repo)}" placeholder="username/repo"><input type="text" data-g="branch" value="${esc(gh.branch)}" placeholder="main"></div>
<input type="password" data-g="token" value="${esc(gh.token)}" placeholder="Access token"></section>
<section class="card"><h2>Other</h2><div class="row"><button data-a="exp">Export site.json</button><button data-a="rst">Discard unpublished changes</button><a class="btn" href="index.html?preview" target="_blank">Open preview</a></div></section>`;

function badge(){const b=$('badge'),x=!!localStorage.getItem(DIRTY);b.textContent=x?'● Unpublished changes':'All changes published';b.className=x?'dirty':''}
function render(){
  $('tabs').innerHTML=TABS.map(k=>`<button class="${k==tab?'on':''}" data-tab="${k}">${k}</button>`).join('');
  app.innerHTML={Site:site,Pages:pages,Look:look,Publish:publishTab}[tab]();badge();
}
function save(){localStorage.setItem(DIRTY,'1');badge();clearTimeout(timer);timer=setTimeout(async()=>{await saveDraft(d);ch.postMessage(1)},250)}
const out=()=>{const o={...d};delete o._pv;return o};
$('tabs').onclick=e=>{const k=e.target.dataset.tab;if(k){tab=k;localStorage.setItem('adm-tab',k);render()}};
$('pub').onclick=()=>publish();
app.addEventListener('input',e=>{const t=e.target,p=t.dataset.p;
  if(p){set(d,p,t.type=='range'?+t.value:t.value);save()}
  if(t.dataset.dt){set(d,t.dataset.dt,t.value?t.value.slice(5):'');save()}
  if(t.dataset.g){gh[t.dataset.g]=t.value.trim();localStorage.setItem(CFG,JSON.stringify(gh))}});
app.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.c){set(d,t.dataset.c,t.checked);save()}
  if(t.dataset.r)render();
  if(t.type=='file')dispatch(t.dataset,t.files)});
app.addEventListener('dragstart',e=>{const th=e.target.closest('.thumb');if(th)drag={t:+th.dataset.t,i:+th.dataset.i}});
app.addEventListener('dragend',()=>{drag=null;app.querySelectorAll('.over').forEach(x=>x.classList.remove('over'))});
app.addEventListener('dragover',e=>{const z=e.target.closest(drag?'.thumb':'.drop');if(z){e.preventDefault();z.classList.add('over')}});
app.addEventListener('dragleave',e=>e.target.closest('.over')?.classList.remove('over'));
app.addEventListener('drop',e=>{
  const th=e.target.closest('.thumb');
  if(drag&&th&&+th.dataset.t==drag.t){e.preventDefault();const a=d.tabs[drag.t].images,[m]=a.splice(drag.i,1);a.splice(+th.dataset.i,0,m);drag=null;save();render();return}
  const z=e.target.closest('.drop');if(z){e.preventDefault();dispatch(z.dataset,e.dataTransfer.files)}});
const mv=(a,i,j)=>{if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]]};
app.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!b.dataset.a)return;
  const {a,t,i,v}=b.dataset,T=d.tabs[+t],n=+i;
  if(a=='exp'){Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([JSON.stringify(out(),null,1)])),download:'site.json'}).click();return}
  if(a=='rst'){if(confirm('Discard unpublished changes?')){await clearDraft();localStorage.removeItem(DIRTY);d=await load(false);ch.postMessage(1);render()}return}
  if(a=='af'){const nm=$('newfont').value.trim().replace(/\s+/g,' ');
    if(!/^[A-Za-z0-9 ]+$/.test(nm))return toast('Type the font name using letters and numbers only.');
    if(![...FONTS,...d.fonts].includes(nm)){
      const ok=await new Promise(r=>{const l=document.createElement('link');l.rel='stylesheet';l.href=`https://fonts.googleapis.com/css2?family=${nm.replace(/ /g,'+')}&display=swap`;l.onload=()=>r(true);l.onerror=()=>r(false);document.head.append(l)});
      if(!ok)return toast("Couldn't find that font on Google Fonts. Check the spelling.");
      d.fonts.push(nm)}
    get(d,tp()).font=nm}
  if(a=='df'){const nm=d.fonts.splice(n,1)[0];for(const th of[d.theme,...d.looks.map(l=>l.theme)])if(th.font==nm)th.font='Bricolage Grotesque'}
  if(a=='ac')(T.cards??=[]).push({title:'New card',price:'',desc:''});
  if(a=='pr'){delete d.pageBg.src;delete d.pageBg.px}
  if(a=='hr'){delete d.hero.src;delete d.hero.px}
  if(a=='lr'){d.logo=''}
  if(a=='dc')T.cards.splice(n,1);
  if(a=='cr')for(const k of['tc','pc','bc','font','al'])delete T.cards[n][k];
  if(a=='cs'){const c=T.cards[n];for(const o of T.cards)if(o!==c)for(const k of['tc','pc','bc','font','al'])c[k]?o[k]=c[k]:delete o[k]}
  if(a=='cu')mv(T.cards,n,n-1);if(a=='cd')mv(T.cards,n,n+1);
  if(a=='ci'){delete T.cards[n].src;delete T.cards[n].px}
  if(a=='dl')d.links.splice(n,1);if(a=='al')d.links.push({label:'',url:''});
  if(a=='at')d.tabs.push({id:'tab-'+Date.now().toString(36),title:'New page',type:'gallery',desc:'',images:[]});
  if(a=='dt'&&confirm('Delete this page?'))d.tabs.splice(+t,1);
  if(a=='tu')mv(d.tabs,+t,+t-1);if(a=='td')mv(d.tabs,+t,+t+1);
  if(a=='di')T.images.splice(n,1);
  if(a=='pre')Object.assign(get(d,tp()),PRESETS[v]);
  if(a=='ed')d._pv=v;if(a=='main')delete d._pv;
  if(a=='always')d.look=d.look==v?'':v;
  if(a=='sl'){const nm=$('newlook').value.trim();if(!nm)return toast('Give the look a name first.');d.looks.push({name:nm,theme:{...get(d,tp())},from:'',to:''});d._pv=nm}
  if(a=='dlk'){const nm=d.looks[n].name;d.looks.splice(n,1);if(d._pv==nm)delete d._pv;if(d.look==nm)d.look=''}
  save();render()});
// Downscale + watermark in the browser so originals never leave the computer
async function mark(file,wm=true,max=1400){
  const bm=await createImageBitmap(file),m=Math.max(bm.width,bm.height);
  const px=!!d.pixel&&m<=600;
  const s=px?Math.max(1,Math.floor(900/m)):Math.min(1,max/m);
  const W=Math.round(bm.width*s),H=Math.round(bm.height*s),c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  if(!px){x.fillStyle='#fff';x.fillRect(0,0,W,H)}
  x.imageSmoothingEnabled=!px;x.imageSmoothingQuality='high';x.drawImage(bm,0,0,W,H);
  if(wm){
    const step=px?s:1,q=v=>Math.round(v/step)*step,fs=Math.max(10,Math.round(Math.min(W,H)/18));
    {
      const txt=d.watermark||'';x.font=`700 ${fs}px monospace`;x.textBaseline='top';
      const w=x.measureText(txt).width+fs*2,h=fs*3.2;
      for(let r=0,y=0;y<H;y+=h,r++)for(let xx=(r%2)*w/2;xx<W;xx+=w){const X=q(xx),Y=q(y);
        x.fillStyle='rgba(0,0,0,.1)';x.fillText(txt,X+1,Y+1);x.fillStyle='rgba(255,255,255,.26)';x.fillText(txt,X,Y)}
      const f=Math.max(9,Math.round(fs*.8));x.font=`700 ${f}px monospace`;x.textBaseline='bottom';
      x.fillStyle='rgba(0,0,0,.5)';x.fillText(txt,11,H-7);x.fillStyle='#fff';x.fillText(txt,10,H-8);
    }
  }
  return {src:px?c.toDataURL('image/png'):c.toDataURL('image/jpeg',.9),px};
}
async function logoImg(f){
  if(!f||!f.type.startsWith('image/'))return;
  const bm=await createImageBitmap(f),s=Math.min(1,320/Math.max(bm.width,bm.height)),c=document.createElement('canvas');
  c.width=Math.round(bm.width*s);c.height=Math.round(bm.height*s);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
  d.logo=c.toDataURL('image/png');save();render();
}
async function heroImg(f){if(!f||!f.type.startsWith('image/'))return;Object.assign(d.hero,await mark(f,false));save();render()}
async function pageImg(f){if(!f||!f.type.startsWith('image/'))return;Object.assign(d.pageBg,await mark(f,false,1920));save();render()}
const dispatch=(ds,fl)=>ds.logo!==undefined?logoImg(fl[0]):ds.pg!==undefined?pageImg(fl[0]):ds.h!==undefined?heroImg(fl[0]):ds.k!==undefined?cardImg(+ds.t,+ds.k,fl[0]):addFiles(+ds.t,fl);
async function up(o,k){const v=o[k];if(!v?.startsWith('data:'))return;const p='images/'+crypto.randomUUID().replace(/-/g,'').slice(0,14)+'.'+(v.startsWith('data:image/png')?'png':'jpg');toast('Uploading '+p);await put(p,v.split(',')[1]);o[k]=p}
async function addFiles(ti,files){
  for(const f of files){if(!f.type.startsWith('image/'))continue;d.tabs[ti].images.push({...await mark(f),title:f.name.replace(/\.[^.]+$/,'')})}
  save();render();toast('Added. Publish to put it online.');
}
async function cardImg(ti,ci,f){if(!f||!f.type.startsWith('image/'))return;Object.assign(d.tabs[ti].cards[ci],await mark(f,false));save();render()}
async function put(path,b64){
  const u=`https://api.github.com/repos/${gh.repo}/contents/${path}`,H={Authorization:'Bearer '+gh.token,Accept:'application/vnd.github+json'};
  const r=await fetch(`${u}?ref=${gh.branch}`,{headers:H});const sha=r.ok?(await r.json()).sha:undefined;
  const res=await fetch(u,{method:'PUT',headers:H,body:JSON.stringify({message:'Update '+path,content:b64,branch:gh.branch,sha})});
  if(!res.ok)throw new Error((await res.json()).message||res.status);
}
async function publish(){
  if(!gh.repo||!gh.token){tab='Publish';render();return toast('Connect to GitHub first.')}
  try{
    await up(d,'logo');await up(d.hero,'src');await up(d.pageBg,'src');
    for(const t of d.tabs)for(const im of [...(t.images||[]),...(t.cards||[])])if(im.src?.startsWith('data:')){
      const p='images/'+crypto.randomUUID().replace(/-/g,'').slice(0,14)+'.'+(im.src.startsWith('data:image/png')?'png':'jpg');toast('Uploading '+p);
      await put(p,im.src.split(',')[1]);im.src=p}
    await put('data/site.json',btoa(unescape(encodeURIComponent(JSON.stringify(out(),null,1)))));
    localStorage.removeItem(DIRTY);await saveDraft(d);ch.postMessage(1);render();toast('Published. The site updates in about a minute.');
  }catch(err){toast('Publish failed: '+err.message)}
}
render();
