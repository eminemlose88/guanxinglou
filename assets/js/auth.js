const initSupabase=()=>{
  if(window.__sbClient) return window.__sbClient
  if(!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY){console.warn('Supabase config missing');return null}
  if(typeof window.supabase==='undefined' || !window.supabase.createClient){console.warn('Supabase SDK not loaded');return null}
  window.__sbClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)
  return window.__sbClient
}
const injectScript=(src)=>new Promise(res=>{const s=document.createElement('script');s.src=src;s.onload=()=>res(true);s.onerror=()=>res(false);document.head.appendChild(s)})
const ensureConfigLoaded=async()=>{
  if(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY) return true
  const ok=await injectScript('/api/config?ts='+Date.now())
  return ok && !!(window.SUPABASE_URL&&window.SUPABASE_ANON_KEY)
}
const ensureSDKLoaded=async()=>{
  if(typeof window.supabase!=='undefined'&&window.supabase.createClient) return true
  const ok=await injectScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js')
  return ok && typeof window.supabase!=='undefined' && !!window.supabase.createClient
}
const normalizeEmail=e=>String(e||'').trim().toLowerCase()
const getCookie=(name)=>document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.split('=')[1]||''
const ensureCsrf=async()=>{const c=getCookie('csrf_token');if(c)return c;try{const r=await fetch('/api/auth/csrf',{method:'POST'});const j=await r.json();return j.token||''}catch{return ''}}
const hasLocalSession=()=>{
  try{const t=localStorage.getItem(AUTH_KEY);return !!t}catch{return false}
}
const requireAuthAsync=async()=>{
  if(!document.body.hasAttribute('data-protected')) return
  try{const r=await fetch('/api/auth/me',{credentials:'include'});if(r.status!==200){location.href='login.html';return}}catch{location.href='login.html'}
}
const wireSupabaseLogin=()=>{
  const f=document.querySelector('#loginForm');if(!f) return
  const msg=document.querySelector('#loginMsg')
  const btn=f.querySelector('button[type="submit"]')
  f.addEventListener('submit',async e=>{
    e.preventDefault()
    const d=new FormData(f)
    const email=normalizeEmail((d.get('email')||'').toString())
    const password=(d.get('password')||'').toString()
    if(!/^\S+@\S+\.\S+$/.test(email)){msg.textContent='请输入合法邮箱地址';return}
    if(password.length<6){msg.textContent='密码至少6位';return}
    const readyCfg=await ensureConfigLoaded()
    const readySdk=await ensureSDKLoaded()
    const sb=readyCfg&&readySdk?initSupabase():null
    btn && (btn.disabled=true,btn.classList.add('disabled'),btn.textContent='登陆中…')
    try{
      if(sb){
        const {data, error}=await sb.auth.signInWithPassword({email,password})
        if(error){
          try{
            const r=await fetch('/api/auth/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
            if(r.ok){const j=await r.json();msg.textContent=j.exists?'密码错误':'找不到邮箱'} else {msg.textContent='登录失败'}
          }catch{msg.textContent='登录失败'}
          return
        }
        const csrf=await ensureCsrf()
        if(!csrf){msg.textContent='系统忙，请稍后再试';return}
        const resp=await fetch('/api/auth/login',{method:'POST',headers:{'x-csrf-token':csrf,Authorization:`Bearer ${data.session?.access_token||''}`},credentials:'include'})
        if(!resp.ok){const j=await resp.json().catch(()=>({error:'登录失败'}));msg.textContent=j.error||'登录失败';return}
        const me=await fetch('/api/auth/me',{credentials:'include'})
        if(me.status!==200){msg.textContent='系统忙，请稍后再试';return}
      }else{ msg.textContent='系统忙，请稍后再试';return }
      msg.textContent='登陆成功，正在跳转…'
      setTimeout(()=>location.href='must-read.html',600)
    }catch(e){
      msg.textContent='系统忙，请稍后再试'
    }finally{
      btn && (btn.disabled=false,btn.classList.remove('disabled'),btn.textContent='登陆')
    }
  })
}
const wireLogout=()=>{const el=document.querySelector('#logoutLink');if(!el)return;el.addEventListener('click',async e=>{e.preventDefault();const csrf=await ensureCsrf();await fetch('/api/auth/logout',{method:'POST',headers:{'x-csrf-token':csrf},credentials:'include'});location.href='login.html'})}
window.__auth={requireAuthAsync,wireSupabaseLogin,initSupabase,wireLogout}
