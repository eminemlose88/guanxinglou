const AUTH_KEY='authToken'
const initSupabase=()=>{
  if(window.supabase) return window.supabase
  if(!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY){console.warn('Supabase config missing');return null}
  window.supabase=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)
  return window.supabase
}
const normalizeEmail=e=>String(e||'').trim().toLowerCase()
const getCookie=(name)=>document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.split('=')[1]||''
const ensureCsrf=async()=>{const c=getCookie('csrf_token');if(c)return c;try{const r=await fetch('/api/auth/csrf',{method:'POST'});const j=await r.json();return j.token||''}catch{return ''}}
const isPrivateMode=async()=>{try{const req=indexedDB.open('pm_check');return await new Promise(res=>{req.onupgradeneeded=()=>res(false);req.onsuccess=()=>res(false);req.onerror=()=>res(true)})}catch{return true}}
const hasLocalSession=()=>{
  try{const t=localStorage.getItem(AUTH_KEY);return !!t}catch{return false}
}
const requireAuthAsync=async()=>{
  if(!document.body.hasAttribute('data-protected')) return
  if(await isPrivateMode()){location.href='login.html';return}
  try{const r=await fetch('/api/auth/me',{credentials:'include'});if(r.status!==200){location.href='login.html';return};const j=await r.json();showWelcome(j.user_name)}catch{location.href='login.html'}
}
const wireSupabaseLogin=()=>{
  const f=document.querySelector('#loginForm');if(!f) return
  const msg=document.querySelector('#loginMsg')
  f.addEventListener('submit',async e=>{
    e.preventDefault()
    const d=new FormData(f)
    const email=normalizeEmail((d.get('email')||'').toString())
    const password=(d.get('password')||'').toString()
    if(!/^\S+@\S+\.\S+$/.test(email)){msg.textContent='请输入合法邮箱地址';return}
    if(password.length<6){msg.textContent='密码至少6位';return}
    const sb=initSupabase()
    if(sb){
      const {data, error}=await sb.auth.signInWithPassword({email,password})
      if(error){msg.textContent=error.message;return}
      const csrf=await ensureCsrf()
      await fetch('/api/auth/login',{method:'POST',headers:{'x-csrf-token':csrf,Authorization:`Bearer ${data.session?.access_token||''}`},credentials:'include'})
    }else{
      localStorage.setItem(AUTH_KEY,JSON.stringify({email,ts:Date.now()}))
    }
    msg.textContent='登陆成功，正在跳转…'
    setTimeout(()=>location.href='must-read.html',600)
  })
}
const showModal=(title,body)=>{let m=document.querySelector('#welcomeModal');if(!m){m=document.createElement('div');m.id='welcomeModal';m.className='modal';m.innerHTML=`<div class="modal-inner"><h3></h3><p></p><div class="actions"><a class=\"btn\" href=\"#\" id=\"modalClose\">关闭</a></div></div>`;document.body.appendChild(m)}m.querySelector('h3').textContent=title;m.querySelector('p').textContent=body;m.classList.add('show');const close=()=>m.classList.remove('show');m.querySelector('#modalClose').onclick=(e)=>{e.preventDefault();close()};setTimeout(close,15000)}
const showWelcome=(name)=>{const shown=localStorage.getItem('welcomeShown');if(!shown){showModal('全网独家资源','观星楼为全网质量最高的包养俱乐部，门槛最高，杜绝屌丝。从业多年，国内外城市都有资源，只做包养/伴游，优质资源更新快。');localStorage.setItem('welcomeShown','1')}else{showModal('欢迎回来',`欢迎回来 ${name||''}`)}}
const wireLogout=()=>{const el=document.querySelector('#logoutLink');if(!el)return;el.addEventListener('click',async e=>{e.preventDefault();const csrf=await ensureCsrf();await fetch('/api/auth/logout',{method:'POST',headers:{'x-csrf-token':csrf},credentials:'include'});location.href='login.html'})}
window.__auth={requireAuthAsync,wireSupabaseLogin,initSupabase}
