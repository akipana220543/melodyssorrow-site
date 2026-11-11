import {PRESETS} from './themes.js';
export const fill=d=>({theme:{...PRESETS.Minimal},looks:[],fonts:[],logo:'',hero:{},pageBg:{},look:'',...d,banner:{on:false,text:'',...d.banner}});
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('portfolio',1);r.onupgradeneeded=()=>r.result.createObjectStore('draft');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function tx(mode,fn){const db=await open();return new Promise((res,rej)=>{const t=db.transaction('draft',mode),q=fn(t.objectStore('draft'));t.oncomplete=()=>res(q?.result);t.onerror=()=>rej(t.error)})}
export async function load(useDraft){
  if(useDraft){try{const d=await tx('readonly',s=>s.get('d'));if(d)return fill(d)}catch{}}
  return fill(await (await fetch('data/site.json?'+Date.now())).json());
}
export async function saveDraft(d){try{await tx('readwrite',s=>s.put(JSON.parse(JSON.stringify(d)),'d'));return true}catch(e){alert('Could not save the draft: '+e.message);return false}}
export const clearDraft=()=>tx('readwrite',s=>s.delete('d'));
// "#rrggbb" = placeholder colour box, anything else = image path/URL
export const bg=src=>src.startsWith('#')?`background:${src}`:`background-image:url('${src}')`;
