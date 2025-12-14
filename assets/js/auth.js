const AUTH_KEY='authToken'
const initSupabase=()=>{
  if(window.supabase) return window.supabase
  if(!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY){console.warn('Supabase config missing');return null}
  window.supabase=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)
  return window.supabase
}
const normalizePhone=p=>{
  const s=(p||'').trim()
  if(!s) return ''
  if(s.startsWith('+')) return s
  if(/^1\d{10}$/.test(s)) return '+86'+s
  return s
}
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
    const phone=normalizePhone((d.get('phone')||'').toString())
    const password=(d.get('password')||'').toString()
    if(!/^\+\d{6,}$/.test(phone)){msg.textContent='请输入合法手机号（国内自动加+86）';return}
    if(password.length<6){msg.textContent='密码至少6位';return}
    const sb=initSupabase()
    if(sb){
      const {error}=await sb.auth.signInWithPassword({phone,password})
      if(error){msg.textContent=error.message;return}
    }else{
      localStorage.setItem(AUTH_KEY,JSON.stringify({phone,ts:Date.now()}))
    }
    msg.textContent='登陆成功，正在跳转…'
    setTimeout(()=>location.href='must-read.html',600)
  })
}
window.__auth={requireAuthAsync,wireSupabaseLogin,initSupabase}
