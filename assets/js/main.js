const qs=s=>document.querySelector(s)
const qsa=s=>Array.from(document.querySelectorAll(s))
const setYear=()=>{const y=qs('#year');if(y)y.textContent=new Date().getFullYear()}
const requireAuth=()=>{if(window.__auth)window.__auth.requireAuthAsync()}
const handleContact=()=>{const f=qs('#contactForm');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const msg=qs('#contactMsg');msg.textContent='已收到信息，秘书将尽快联系你';f.reset()})}
const unique=v=>Array.from(new Set(v))
let profiles=[]
const renderFilters=()=>{const c=qs('#filterCity');const t=qs('#filterTag');if(!c||!t)return;c.innerHTML='<option value="">全部城市</option>';
  t.innerHTML='<option value="">全部标签</option>';
  unique(profiles.map(p=>p.city)).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;c.appendChild(o)});
  unique(profiles.flatMap(p=>p.tags||[])).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;t.appendChild(o)})}
const matchProfile=(p,{city,tag,search})=>{if(city&&p.city!==city)return false;if(tag&&!p.tags.includes(tag))return false;if(search){const s=search.toLowerCase();if(!p.name.toLowerCase().includes(s)&&!p.bio.toLowerCase().includes(s))return false}return true}
const renderProfiles=()=>{const wrap=qs('#profiles');if(!wrap)return;const city=qs('#filterCity').value;const tag=qs('#filterTag').value;const search=qs('#filterSearch').value.trim();wrap.innerHTML='';
  if(!profiles.length){wrap.innerHTML='<div class="card">暂无数据，请稍后重试</div>';return}
  profiles.filter(p=>matchProfile(p,{city,tag,search})).forEach(p=>{const el=document.createElement('div');el.className='card';const tags=document.createElement('div');tags.className='tags';(p.tags||[]).forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;tags.appendChild(s)});const img=p.avatar_url?`<img class="avatar" src="${p.avatar_url}" alt="${p.name}">`:'';el.innerHTML=`${img}<div class="profile-row"><h3>${p.name}</h3><span>${p.city} · ${p.age||''}</span></div><p>${p.bio||''}</p>`;el.appendChild(tags);wrap.appendChild(el)})}
const wireFilters=()=>{['#filterCity','#filterTag','#filterSearch'].forEach(s=>{const el=qs(s);if(el)el.addEventListener('input',renderProfiles)})}
const loadProfiles=async()=>{
  const wrap=qs('#profiles');if(!wrap)return
  try{
    const res=await fetch('/api/profiles')
    if(res.ok){const json=await res.json();profiles=(json.data||[]).map(p=>({name:p.name,city:p.city,age:p.age,tags:p.tags,bio:p.bio,avatar_url:p.avatar_url}))}
  }catch(e){profiles=[]}
  renderFilters();renderProfiles()
}
setYear();requireAuth();handleContact();wireFilters();if(window.__auth&&window.__auth.wireLogout)window.__auth.wireLogout();loadProfiles()
