const qs=s=>document.querySelector(s)
const ensureCsrf=async()=>{try{const r=await fetch('/api/auth/csrf',{method:'POST'});const j=await r.json();return j.token||''}catch{return ''}}
const toTags=s=>s.split(',').map(x=>x.trim()).filter(Boolean)
const renderAdminProfiles=items=>{
  const wrap=qs('#adminProfiles');if(!wrap) return
  wrap.innerHTML=''
  items.forEach(p=>{
    const el=document.createElement('div');el.className='card'
    const img=p.avatar_url?`<img class="avatar" src="${p.avatar_url}" alt="${p.name}">`:''
    el.innerHTML=`${img}<div class="profile-row"><h3>${p.name}</h3><span>${p.city} · ${p.age||''}</span></div>
    <p>${p.bio||''}</p>
    <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    <div class="cta"><button class="btn" data-id="${p.id}" data-pub="${p.published}">${p.published?'已发布':'未发布'}</button></div>`
    wrap.appendChild(el)
  })
  wrap.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const id=btn.getAttribute('data-id');const pub=btn.getAttribute('data-pub')==='true'
      const csrf=await ensureCsrf()
      const res=await fetch('/api/admin/profiles',{method:'PATCH',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({id,published:!pub})})
      if(res.ok){btn.textContent=!pub?'已发布':'未发布';btn.setAttribute('data-pub',String(!pub))}
    })
  })
}
const loadAdminProfiles=async()=>{
  const res=await fetch('/api/admin/profiles')
  if(res.ok){const j=await res.json();renderAdminProfiles(j.data||[])}
}
const wireAdminForm=()=>{
  const f=qs('#profileForm');if(!f) return
  const msg=qs('#profileMsg')
  f.addEventListener('submit',async e=>{
    e.preventDefault()
    msg.textContent=''
    const d=new FormData(f)
    const name=(d.get('name')||'').toString().trim()
    const city=(d.get('city')||'').toString().trim()
    const age=parseInt((d.get('age')||'0').toString(),10)||null
    const tags=toTags((d.get('tags')||'').toString())
    const bio=(d.get('bio')||'').toString()
    const published=(d.get('published')||'false').toString()==='true'
    let avatar_url=null
    const file=d.get('avatar')
    if(file&&file.size>0){
      const up=new FormData();up.append('file',file,file.name)
      const r=await fetch('/api/media/upload',{method:'POST',body:up,headers:{'x-file-type':file.type}})
      if(!r.ok){msg.textContent='图片上传失败';return}
      const j=await r.json();avatar_url=j.url
    }
    const csrf=await ensureCsrf()
    const res=await fetch('/api/admin/profiles',{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({name,city,age,tags,bio,published,avatar_url})})
    if(!res.ok){const j=await res.json().catch(()=>({error:'提交失败'}));msg.textContent=j.error||'提交失败';return}
    msg.textContent='提交成功'
    f.reset();loadAdminProfiles()
  })
}
loadAdminProfiles();wireAdminForm()
