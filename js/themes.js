export const PRESETS={
 Minimal:{bg:'#fbfbfc',ink:'#1b1d24',mute:'#767b88',acc:'#3b4cca',font:'Bricolage Grotesque',r:14},
 Dark:{bg:'#14151a',ink:'#f1f1f4',mute:'#8d90a0',acc:'#8fa0ff',font:'Bricolage Grotesque',r:14},
 Pastel:{bg:'#fff6f8',ink:'#4a3b52',mute:'#9a8aa3',acc:'#e0679c',font:'Nunito',r:24},
 Pixel:{bg:'#1b1b2f',ink:'#f4f1de',mute:'#9aa0c4',acc:'#ffd166',font:'Space Mono',r:0},
 Halloween:{bg:'#17101f',ink:'#f6e7d2',mute:'#a58fb5',acc:'#ff7a1a',font:'Fraunces',r:10},
 Winter:{bg:'#f2f7fb',ink:'#1d2b3a',mute:'#6c8499',acc:'#2f8fd6',font:'Fraunces',r:18}};
export const FONTS=['Bricolage Grotesque','Fraunces','Space Mono','Nunito'];
const inRange=(a,b,x)=>a<=b?x>=a&&x<=b:x>=a||x<=b;
// Look order: preview/edit pick, "use always" pick, a look whose dates include today, else the main look
export function effective(s){
  const n=new Date(),md=String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),L=s.looks||[];
  const l=L.find(l=>l.name===s._pv)||L.find(l=>l.name===s.look)||L.find(l=>l.from&&l.to&&inRange(l.from,l.to,md));
  return {...PRESETS.Minimal,...s.theme,...(l?.theme||{})};
}
export function apply(t){
  const r=document.documentElement.style;
  for(const k of['bg','ink','mute','acc'])r.setProperty('--'+k,t[k]);
  r.setProperty('--r',t.r+'px');r.setProperty('--f1',`'${t.font}',system-ui,sans-serif`);
  loadFont(t.font);
}
export function loadFont(f){
  const id='gf-'+f.replace(/ /g,'');if(document.getElementById(id))return;
  const l=document.createElement('link');l.id=id;l.rel='stylesheet';
  l.href=`https://fonts.googleapis.com/css2?family=${f.replace(/ /g,'+')}${FONTS.includes(f)?':wght@400;700':''}&display=swap`;document.head.append(l);
}
