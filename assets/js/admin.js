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
    <div class="cta">
      <button class="btn" data-id="${p.id}" data-pub="${p.published}">${p.published?'已发布':'未发布'}</button>
      <button class="btn" data-edit="${p.id}">编辑</button>
      <button class="btn" data-delete="${p.id}">删除</button>
    </div>`
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
  wrap.querySelectorAll('button[data-edit]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.getAttribute('data-edit')
      const p=items.find(x=>x.id===id);if(p) openEditModal(p)
    })
  })
  wrap.querySelectorAll('button[data-delete]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const id=btn.getAttribute('data-delete')
      if(!confirm('确认删除该资料？此操作不可撤销')) return
      const csrf=await ensureCsrf()
      const res=await fetch('/api/admin/profiles?id='+encodeURIComponent(id),{method:'DELETE',headers:{'x-csrf-token':csrf}})
      if(res.status===204){loadAdminProfiles()}
    })
  })
}
const assertAdmin=async()=>{
  try{const r=await fetch('/api/auth/me',{credentials:'include'});if(!r.ok){location.href='login.html';return false};const j=await r.json();if(j.role!=='admin'){location.href='selection.html';return false}}catch{location.href='login.html';return false}
  return true
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
const ensureEditModal=()=>{
  let m=qs('#editModal');if(m) return m
  m=document.createElement('div');m.id='editModal';m.className='modal';
  m.innerHTML=`<div class="modal-inner"><h3>编辑资料</h3>
    <form id="editForm" class="form">
      <label class="field"><span>昵称</span><input type="text" name="name" required></label>
      <label class="field"><span>城市</span><input type="text" name="city" required></label>
      <label class="field"><span>年龄</span><input type="number" name="age" min="16" max="60"></label>
      <label class="field"><span>标签（逗号分隔）</span><input type="text" name="tags"></label>
      <label class="field"><span>简介</span><textarea name="bio" rows="3"></textarea></label>
      <label class="field"><span>替换头像</span><input type="file" name="avatar" accept="image/*"></label>
      <label class="field"><span>发布</span><select name="published"><option value="false">否</option><option value="true">是</option></select></label>
      <div class="actions"><a class="btn" href="#" id="editCancel">取消</a><button class="btn primary" type="submit">保存</button></div>
    </form></div>`
  document.body.appendChild(m);return m
}
const openEditModal=async (p)=>{
  const m=ensureEditModal();m.classList.add('show')
  const f=qs('#editForm');f.reset()
  f.dataset.id=p.id
  f.name.value=p.name||''
  f.city.value=p.city||''
  f.age.value=p.age||''
  f.tags.value=(p.tags||[]).join(',')
  f.bio.value=p.bio||''
  f.published.value=String(!!p.published)
  qs('#editCancel').onclick=(e)=>{e.preventDefault();m.classList.remove('show')}
  f.onsubmit=async (e)=>{
    e.preventDefault()
    const d=new FormData(f)
    const id=f.dataset.id
    const name=(d.get('name')||'').toString().trim()
    const city=(d.get('city')||'').toString().trim()
    const age=parseInt((d.get('age')||'0').toString(),10)||null
    const tags=toTags((d.get('tags')||'').toString())
    const bio=(d.get('bio')||'').toString()
    const published=(d.get('published')||'false').toString()==='true'
    let avatar_url=undefined
    const file=d.get('avatar')
    if(file&&file.size>0){
      const up=new FormData();up.append('file',file,file.name)
      const r=await fetch('/api/media/upload',{method:'POST',body:up,headers:{'x-file-type':file.type}})
      if(!r.ok){alert('头像上传失败');return}
      const j=await r.json();avatar_url=j.url
    }
    const csrf=await ensureCsrf()
    const payload={id,name,city,age,tags,bio,published}
    if(avatar_url!==undefined) payload.avatar_url=avatar_url
    const res=await fetch('/api/admin/profiles',{method:'PATCH',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify(payload)})
    if(!res.ok){alert('保存失败');return}
    m.classList.remove('show');loadAdminProfiles()
  }
}
(async()=>{if(await assertAdmin()){loadAdminProfiles();wireAdminForm()}})()
