const qs=s=>document.querySelector(s)
const qsa=s=>Array.from(document.querySelectorAll(s))
const setYear=()=>{const y=qs('#year');if(y)y.textContent=new Date().getFullYear()}
// Force canonical domain for customer-facing site
(()=>{const host=location.host.toLowerCase();const canonical='www.all-hands-ai.org';if(host.endsWith('vercel.app')){location.replace(`https://${canonical}${location.pathname}${location.search}${location.hash}`)}})()
const ensureCsrfMain=async()=>{try{const r=await fetch('/api/auth/csrf',{method:'GET',credentials:'include'});const j=await r.json();return j.token||''}catch{return ''}}
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
setYear();requireAuth();handleContact();wireFilters();if(window.__auth&&window.__auth.wireLogout)window.__auth.wireLogout();initUserMenu();loadProfiles()
const renderUserMenu=(name)=>{
  const menu=qs('.menu');if(!menu) return
  const existing=qs('#userMenu');if(existing) existing.remove()
  const loginLink=qsa('.menu a').find(a=>a.textContent.includes('登陆'))
  if(loginLink) loginLink.remove()
  const logoutLink=qs('#logoutLink');if(logoutLink) logoutLink.remove()
  const wrap=document.createElement('div');wrap.id='userMenu';wrap.className='user-menu'
  wrap.innerHTML=`<div class="trigger">${name||'用户'} ▾</div>
    <div class="dropdown">
      <button id="editUsernameBtn" class="btn ghost">修改昵称</button>
      <button id="editPasswordBtn" class="btn ghost">修改密码</button>
      <a id="logoutLink" class="btn" href="#">退出登录</a>
    </div>`
  menu.appendChild(wrap)
  wrap.querySelector('.trigger').addEventListener('click',()=>{wrap.classList.toggle('open')})
  const wireUpdate=(type)=>{
    const val=prompt(type==='username'?'输入新的昵称':'输入新的密码')
    if(!val) return
    ensureCsrfMain().then(async csrf=>{
      const res=await fetch('/api/auth/update',{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':csrf},credentials:'include',body:JSON.stringify(type==='username'?{username:val}:{password:val})})
      if(res.ok){alert('修改成功');if(type==='username'){renderUserMenu(val)}}else{const j=await res.json().catch(()=>({error:'修改失败'}));alert(j.error||'修改失败')}
    })
  }
  qs('#editUsernameBtn').addEventListener('click',()=>wireUpdate('username'))
  qs('#editPasswordBtn').addEventListener('click',()=>wireUpdate('password'))
  const logout=qs('#logoutLink');logout.addEventListener('click',async e=>{e.preventDefault();const csrf=await ensureCsrfMain();await fetch('/api/auth/logout',{method:'POST',headers:{'x-csrf-token':csrf},credentials:'include'});location.href='login.html'})
}
const initUserMenu=async()=>{
  try{const r=await fetch('/api/auth/me',{credentials:'include'});if(!r.ok) return;const j=await r.json();renderUserMenu(j.user_name||'用户')}catch{}
}
