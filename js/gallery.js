import {esc,bg} from './store.js';
export function gallery(root,images){
  root.innerHTML=`<div class="gal"><div class="track">${images.map((im,i)=>`<figure class="tile" style="animation-delay:${i*50}ms" data-i="${i}" tabindex="0"><div class="img${im.px?' px':''}" style="${bg(im.src)}"></div>${im.title?`<figcaption>${esc(im.title)}</figcaption>`:''}</figure>`).join('')}</div>
  <div class="arrows"><button aria-label="Scroll left">←</button><button aria-label="Scroll right">→</button></div></div>`;
  const t=root.querySelector('.track'),[l,r]=root.querySelectorAll('.arrows button');
  l.onclick=()=>t.scrollBy({left:-t.clientWidth*.7,behavior:'smooth'});
  r.onclick=()=>t.scrollBy({left:t.clientWidth*.7,behavior:'smooth'});
  let down=false,sx=0,sl=0,moved=false;
  t.onpointerdown=e=>{if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=t.scrollLeft};
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;t.classList.add('drag')}t.scrollLeft=sl-dx});
  addEventListener('pointerup',()=>{down=false;t.classList.remove('drag')});
  // Mouse wheel scrolls the gallery sideways (smoothed); the page itself doesn't move up/down
  let tgt=0,raf=0;
  const tick=()=>{const dx=tgt-t.scrollLeft;if(Math.abs(dx)<.5){t.scrollLeft=tgt;raf=0;return}t.scrollLeft+=dx*.14;raf=requestAnimationFrame(tick)};
  const wheel=e=>{
    if(!root.isConnected){removeEventListener('wheel',wheel);return}
    if(document.querySelector('.lb'))return;
    e.preventDefault();
    const k=e.deltaMode===1?32:1,v=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*k;
    if(!raf)tgt=t.scrollLeft;
    tgt=Math.max(0,Math.min(t.scrollWidth-t.clientWidth,tgt+v));
    raf||(raf=requestAnimationFrame(tick));
  };
  addEventListener('wheel',wheel,{passive:false});
  const open=e=>{const f=e.target.closest('.tile');if(f&&!moved)lightbox(images,+f.dataset.i)};
  t.onclick=open;t.onkeydown=e=>{if(e.key==='Enter')open(e)};
}
function lightbox(images,i){
  const o=document.createElement('div');o.className='lb';
  o.innerHTML='<button class="x" aria-label="Close">✕</button><button class="p" aria-label="Previous">←</button><div class="lbimg"></div><span class="cap"></span><button class="n" aria-label="Next">→</button>';
  const img=o.querySelector('.lbimg'),cap=o.querySelector('.cap');
  const show=n=>{i=(n+images.length)%images.length;img.style.cssText=bg(images[i].src);img.className='lbimg'+(images[i].px?' px':'');cap.textContent=images[i].title||''};
  const close=()=>{o.remove();removeEventListener('keydown',key)};
  const key=e=>{if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)};
  o.querySelector('.p').onclick=()=>show(i-1);o.querySelector('.n').onclick=()=>show(i+1);
  o.querySelector('.x').onclick=close;o.onclick=e=>{if(e.target===o)close()};
  addEventListener('keydown',key);document.body.append(o);show(i);
}
