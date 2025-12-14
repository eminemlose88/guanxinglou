const AUTH_KEY='authToken'
const initSupabase=()=>{
  if(window.supabase) return window.supabase
  if(!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY){console.warn('Supabase config missing');return null}
  window.supabase=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)
  return window.supabase
}
const normalizeEmail=e=>String(e||'').trim().toLowerCase()
const hasLocalSession=()=>{
  try{const t=localStorage.getItem(AUTH_KEY);return !!t}catch{return false}
}
const requireAuthAsync=async()=>{
  if(!document.body.hasAttribute('data-protected')) return
  const sb=initSupabase()
  if(sb){const {data:{session}}=await sb.auth.getSession();if(!session) {location.href='login.html';return}}
  else {if(!hasLocalSession()) {location.href='login.html';return}}
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
      const {error}=await sb.auth.signInWithPassword({email,password})
      if(error){msg.textContent=error.message;return}
    }else{
      localStorage.setItem(AUTH_KEY,JSON.stringify({email,ts:Date.now()}))
    }
    msg.textContent='登陆成功，正在跳转…'
    setTimeout(()=>location.href='must-read.html',600)
  })
}
window.__auth={requireAuthAsync,wireSupabaseLogin,initSupabase}
