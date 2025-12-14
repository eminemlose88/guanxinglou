import { createClient } from '@supabase/supabase-js'

const mask = (v) => {
  if(!v) return ''
  const s=String(v)
  if(s.length<=6) return '***'
  return s.slice(0,6)+'***'+s.slice(-4)
}

export default async function handler(req,res){
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasUrl=!!url
  const hasSr=!!key
  let adminOk=false, count=-1, usersSample=[]
  try{
    if(hasUrl&&hasSr){
      const sb=createClient(url,key)
      const { data, error } = await sb.auth.admin.listUsers({ page:1, perPage:10 })
      if(!error){
        adminOk=true
        count=(data?.users||[]).length
        usersSample=(data?.users||[]).map(u=>({ uid:u.id, email:u.email }))
      }
    }
  }catch{}
  res.status(200).json({
    env:{ hasUrl, hasSr, urlMask: mask(url), srMask: mask(key) },
    admin:{ ok: adminOk, count, usersSample }
  })
}
