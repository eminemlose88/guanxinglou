import { createClient } from '@supabase/supabase-js'

const getServiceClient=()=>{
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) return null
  return createClient(url,key)
}
const parseCookies=(cookieHeader)=>{const out={};String(cookieHeader||'').split(';').forEach(p=>{const [k,...rest]=p.trim().split('=');if(!k)return;out[k]=decodeURIComponent(rest.join('='))});return out}
const verifyAuth=async(req)=>{
  try{
    const token=parseCookies(req.headers.cookie)['sb_token'];const url=process.env.SUPABASE_URL;const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY
    if(!token||!url||!anon) return false
    const sb=createClient(url,anon)
    const { data, error } = await sb.auth.getUser(token)
    if(error||!data?.user) return false
    const email=data.user.email||''
    const allow=(process.env.SUPABASE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
    return allow.includes(String(email||'').toLowerCase())
  }catch{return false}
}
const verifyCsrf=(req)=>{
  const token=req.headers['x-csrf-token']
  const cookie=(req.headers.cookie||'').includes(`csrf_token=${token}`)
  return !!(token && cookie)
}

export default async function handler(req,res){
  const sb=getServiceClient();if(!sb){res.status(500).json({error:'Service not configured'});return}
  if(!(await verifyAuth(req))){res.status(401).json({error:'Unauthorized'});return}
  if(req.method==='GET'){
    const { data, error } = await sb.from('profiles').select('id,name,city,age,tags,bio,published,avatar_url').order('created_at',{ascending:false})
    if(error){res.status(500).json({error:error.message});return}
    res.status(200).json({data});return
  }
  if(!verifyCsrf(req)){res.status(403).json({error:'CSRF token invalid'});return}
  if(req.method==='POST'){
    const b=req.body||{}
    const payload={ name:b.name, city:b.city, age:b.age, tags:b.tags||[], bio:b.bio||'', published:!!b.published, avatar_url: b.avatar_url||null }
    const { data, error } = await sb.from('profiles').insert(payload).select('*').single()
    if(error){res.status(400).json({error:error.message});return}
    res.status(201).json({data});return
  }
  if(req.method==='PATCH'){
    const b=req.body||{}
    const id=b.id
    if(!id){res.status(400).json({error:'Missing id'});return}
    const updates={}
    ;['name','city','age','tags','bio','published','avatar_url'].forEach(k=>{if(b[k]!==undefined) updates[k]=b[k]})
    const { data, error } = await sb.from('profiles').update(updates).eq('id',id).select('*').single()
    if(error){res.status(400).json({error:error.message});return}
    res.status(200).json({data});return
  }
  if(req.method==='DELETE'){
    const id=(req.query?.id||'').toString()
    if(!id){res.status(400).json({error:'Missing id'});return}
    const { error } = await sb.from('profiles').delete().eq('id',id)
    if(error){res.status(400).json({error:error.message});return}
    res.status(204).end();return
  }
  res.setHeader('Allow','GET,POST,PATCH,DELETE')
  res.status(405).end('Method Not Allowed')
}
