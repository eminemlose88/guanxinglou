export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key){res.status(500).json({error:'Service not configured'});return}
  const body=req.body||{}
  const type=String(body.type||'').trim()
  const email=String(body.email||'').trim().toLowerCase()
  try{
    const resp=await fetch(`${url}/auth/v1/resend`,{ method:'POST', headers:{ apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body: JSON.stringify({ type, email }) })
    if(!resp.ok){const t=await resp.text();res.status(resp.status).end(t);return}
    res.status(200).json({ ok:true })
  }catch(e){res.status(500).json({error:String(e&&e.message||e)})}
}
