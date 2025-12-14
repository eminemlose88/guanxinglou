const qs=s=>document.querySelector(s)
const normalizeEmail=e=>String(e||'').trim().toLowerCase()
const ensureCsrf=async()=>{try{const r=await fetch('/api/auth/csrf',{method:'GET',credentials:'include'});const j=await r.json();return j.token||''}catch{return ''}}
const strongPassword=p=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(p)
const wireRegister=()=>{
  const f=qs('#registerForm');if(!f)return
  const msg=qs('#registerMsg')
  f.addEventListener('submit',async e=>{
    e.preventDefault()
    const d=new FormData(f)
    const username=(d.get('username')||'').toString().trim()
    const email=normalizeEmail((d.get('email')||'').toString())
    const password=(d.get('password')||'').toString()
    const confirm=(d.get('confirm')||'').toString()
    if(!/^[A-Za-z0-9]{4,}$/.test(username)){msg.textContent='用户名需至少4位字母数字';return}
    if(!/^\S+@\S+\.\S+$/.test(email)){msg.textContent='请输入合法邮箱地址';return}
    if(!strongPassword(password)){msg.textContent='密码需至少8位且包含大小写字母与数字';return}
    if(password!==confirm){msg.textContent='两次密码不一致';return}
    const sb=window.supabase||supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)
    try{
      const { data, error } = await sb.auth.signUp({ email, password })
      if(error){msg.textContent=error.message;return}
      const csrf=await ensureCsrf()
      const ua=navigator.userAgent||''
      const res=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({ username, email, password, supabase_uid:data.user?.id||'', user_agent:ua })})
      if(!res.ok){const j=await res.json().catch(()=>({error:'注册失败'}));msg.textContent=j.error||'注册失败';return}
      msg.textContent='注册成功，欢迎加入观星楼！正在跳转…'
      setTimeout(()=>location.href='login.html',1200)
    }catch(err){msg.textContent='网络异常，请稍后重试'}
  })
}
wireRegister()
