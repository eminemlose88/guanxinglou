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
const requireAuthAsync=async()=>{
  const sb=initSupabase();if(!sb) return
  if(document.body.hasAttribute('data-protected')){
    const {data:{session}}=await sb.auth.getSession();if(!session) location.href='login.html'
  }
}
const wireSupabaseLogin=()=>{
  const sb=initSupabase();if(!sb) return
  const f=document.querySelector('#loginForm');if(!f) return
  const msg=document.querySelector('#loginMsg')
  f.addEventListener('submit',async e=>{
    e.preventDefault()
    const d=new FormData(f)
    const phone=normalizePhone((d.get('phone')||'').toString())
    const password=(d.get('password')||'').toString()
    if(!/^\+\d{6,}$/.test(phone)){msg.textContent='请输入合法手机号（国内自动加+86）';return}
    if(password.length<6){msg.textContent='密码至少6位';return}
    const {data,error}=await sb.auth.signInWithPassword({phone,password})
    if(error){msg.textContent=error.message;return}
    msg.textContent='登陆成功，正在跳转…'
    setTimeout(()=>location.href='must-read.html',600)
  })
}
window.__auth={requireAuthAsync,wireSupabaseLogin,initSupabase}
