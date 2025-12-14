const qs=s=>document.querySelector(s)
const getCookie=(name)=>document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.split('=')[1]||''
const ensureCsrf=async()=>{const c=getCookie('csrf_token');if(c)return c;try{const r=await fetch('/api/auth/csrf',{method:'GET',credentials:'include'});const j=await r.json();return j.token||''}catch{return ''}}
const wirePromote=()=>{
  const btn=qs('#promoteBtn');const msg=qs('#promoteMsg');if(!btn)return
  btn.addEventListener('click',async()=>{
    const csrf=await ensureCsrf()
    try{const r=await fetch('/api/admin/promote',{method:'POST',headers:{'x-csrf-token':csrf},credentials:'include'});if(r.ok){msg.textContent='升级成功，正在跳转管理页';setTimeout(()=>location.href='admin.html',800)}else{const j=await r.json().catch(()=>({error:'升级失败'}));msg.textContent=j.error||'升级失败'}}catch{msg.textContent='网络异常'}
  })
}
wirePromote()
