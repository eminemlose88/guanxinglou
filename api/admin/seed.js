import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { parseCookies, decrypt } from '../_lib/secure'

const canSeed=(email)=>{
  const allow=(process.env.SUPABASE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  return allow.includes(String(email||'').toLowerCase())
}

const getSrv=()=>{
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) return null
  return createClient(url,key)
}

const findUserByEmail=async (sb,email)=>{
  let page=1
  const perPage=200
  while(true){
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage })
    if(error) break
    const hit=(data?.users||[]).find(u=>u.email?.toLowerCase()===email.toLowerCase())
    if(hit) return hit
    if(!data || (data.users||[]).length<perPage) break
    page++
  }
  return null
}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const token=req.headers['x-csrf-token']
  const cookie=(req.headers.cookie||'').includes(`csrf_token=${token}`)
  if(!token||!cookie){res.status(403).json({error:'CSRF token invalid'});return}

  const cookies=parseCookies(req.headers.cookie)
  const raw=cookies['auth_token']
  const payload=decrypt(raw,process.env.SUPABASE_JWT_SECRET||process.env.AUTH_COOKIE_SECRET||'changeme')
  if(!payload){res.status(401).json({error:'Unauthorized'});return}
  if(!canSeed(payload.email)){res.status(403).json({error:'Not allowed'});return}

  const sb=getSrv();if(!sb){res.status(500).json({error:'Service not configured'});return}

  const accounts=[
    { email:'admin@guanxinlou.test', password:'Admin1234', username:'admin', role:'admin' },
    { email:'boss1@guanxinlou.test', password:'Boss1234', username:'boss1', role:'user' },
    { email:'user1@guanxinlou.test', password:'User1234', username:'user1', role:'user' }
  ]
  const created=[]
  for(const a of accounts){
    let authUser=await findUserByEmail(sb,a.email)
    if(!authUser){
      const { data, error } = await sb.auth.admin.createUser({ email:a.email, password:a.password, email_confirmed:true })
      if(error){created.push({ email:a.email, error:error.message });continue}
      authUser=data?.user||null
    }
    const uid=authUser?.id
    const now=new Date().toISOString()
    const hash=bcrypt.hashSync(a.password, bcrypt.genSaltSync(10))
    const up={ username:a.username, email:a.email, password_hash:hash, role:a.role, status:'active', supabase_uid:uid, created_at:now, updated_at:now }
    const { error:upErr } = await sb.from('users').upsert(up,{ onConflict:'email' })
    if(upErr){created.push({ email:a.email, error:upErr.message });continue}
    created.push({ email:a.email, role:a.role })
  }

  const samples=[
    { name:'Amber',city:'上海',age:23,tags:['学生','清新','音乐'],bio:'商学院在读，钢琴十级',published:true },
    { name:'Mika',city:'北京',age:24,tags:['职场','成熟','健身'],bio:'产品助理，作息稳定',published:true },
    { name:'Luna',city:'深圳',age:22,tags:['元气','摄影','潮流'],bio:'乐于探索新店',published:true }
  ]
  for(const p of samples){
    const { data:exists } = await sb.from('profiles').select('id').eq('name',p.name).limit(1)
    if(exists && exists.length) continue
    await sb.from('profiles').insert(p)
  }

  res.status(200).json({ created })
}
