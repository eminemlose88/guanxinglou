import { createClient } from '@supabase/supabase-js'

const getServiceClient=()=>{
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) return null
  return createClient(url,key)
}

const getBearer=(req)=>{
  const h=req.headers['authorization']||req.headers['Authorization']
  if(!h) return ''
  const m=String(h).match(/^Bearer\s+(.+)$/)
  return m?m[1]:''
}

export default async function handler(req,res){
  const sb=getServiceClient()
  if(!sb){res.status(500).json({error:'Supabase service not configured'})
    return}
  if(req.method==='GET'){
    const token=getBearer(req)
    if(!token){res.status(401).json({error:'Unauthorized'});return}
    const { data:userData, error:authError } = await sb.auth.getUser(token)
    if(authError||!userData?.user){res.status(401).json({error:'Unauthorized'});return}
    const { data, error } = await sb.from('profiles').select('id,name,city,age,tags,bio,published').eq('published',true).order('created_at',{ascending:false})
    if(error){res.status(500).json({error:error.message});return}
    res.status(200).json({data})
    return
  }
  if(req.method==='POST'){
    const body=req.body||{}
    const payload={
      name:body.name,city:body.city,age:body.age,tags:body.tags||[],bio:body.bio||'',published:!!body.published
    }
    const { data, error } = await sb.from('profiles').insert(payload).select('*').single()
    if(error){res.status(400).json({error:error.message});return}
    res.status(201).json({data})
    return
  }
  res.setHeader('Allow','GET,POST')
  res.status(405).end('Method Not Allowed')
}
