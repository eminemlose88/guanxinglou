export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key){res.status(500).json({error:'Service not configured'});return}
  const body=req.body||{}
  const email=String(body.email||'').trim().toLowerCase()
  if(!email){res.status(400).json({error:'Missing email'});return}
  try{
    const resp=await fetch(`${url}/auth/v1/admin/users?email=eq.${encodeURIComponent(email)}`,{ headers:{ Authorization:`Bearer ${key}`, apikey:key } })
    if(!resp.ok){res.status(200).json({ exists:false });return}
    const j=await resp.json().catch(()=>({users:[]}))
    const exists=Array.isArray(j?.users)? j.users.some(u=>String(u.email||'').toLowerCase()===email) : false
    res.status(200).json({ exists })
  }catch(e){res.status(200).json({ exists:false })}
}
