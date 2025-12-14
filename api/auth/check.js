import { createClient } from '@supabase/supabase-js'

const getSrv=()=>{
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) return null
  return createClient(url,key)
}

const findByEmail=async (sb,email)=>{
  let page=1
  const perPage=200
  while(true){
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage })
    if(error) return false
    const hit=(data?.users||[]).find(u=>String(u.email||'').toLowerCase()===String(email||'').toLowerCase())
    if(hit) return true
    if(!data || (data.users||[]).length<perPage) break
    page++
  }
  return false
}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const sb=getSrv();if(!sb){res.status(500).json({error:'Service not configured'});return}
  const body=req.body||{}
  const email=String(body.email||'').trim().toLowerCase()
  if(!email){res.status(400).json({error:'Missing email'});return}
  try{
    const exists=await findByEmail(sb,email)
    res.status(200).json({ exists })
  }catch(e){res.status(500).json({error:String(e&&e.message||e)})}
}
